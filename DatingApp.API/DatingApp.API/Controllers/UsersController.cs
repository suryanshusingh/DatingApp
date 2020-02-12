using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository repo;
        private IMapper mapper;

        public UsersController(IDatingRepository repo, IMapper mapper)
        {
            this.repo = repo;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery]UserParams userParams)
        {
            var userFromRepo  = await GetCurrentUserFromRepo();

            UpdateUserParams(ref userParams, userFromRepo);

            var users = await repo.GetUsers(userParams);
            var usersToReturn = mapper.Map<IEnumerable<UserForListDto>>(users);

            Response.AddPagination(users.CurrentPage, users.PageSize,
                users.TotalCount, users.TotalPages);

            return Ok(usersToReturn);
        }

        private void UpdateUserParams(ref UserParams userParams, User userFromRepo)
        {
            userParams.UserId = userFromRepo.Id;
            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userFromRepo.Gender == "male" ? "female" : "male";
            }
        }

        private async Task<User> GetCurrentUserFromRepo()
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await repo.GetUser(currentUserId);
            return userFromRepo;
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await repo.GetUser(id);

            var userToReturn = mapper.Map<UserForDetailedDto>(user);
            return Ok(userToReturn);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto userForUpdateDto)
        {
            if (InvalidUser(id))
                return Unauthorized();

            var userFromRepo = await repo.GetUser(id);
            mapper.Map(userForUpdateDto, userFromRepo);
            if (await repo.SaveAll())
                return NoContent();

            throw new Exception($"Updating user {id} failed on save");
        }

        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            if (InvalidUser(id))
                return Unauthorized();

            if (await AlreadyLiked(id, recipientId))
                return BadRequest("You already like this user");

            //Check if recipient user exists
            if (await repo.GetUser(recipientId) == null)
                return NotFound();

            var like = new Like
            {
                LikerId = id,
                LikeeId = recipientId
            };

            repo.Add<Like>(like);

            if (await repo.SaveAll())
                return Ok();

            return BadRequest("Failed to like user");
        }

        private async Task<bool> AlreadyLiked(int id, int recipientId)
        {
            var like = await repo.GetLike(id, recipientId);
            return like != null;
        }

        private bool InvalidUser(int id)
        {
            return id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        }
    }
}