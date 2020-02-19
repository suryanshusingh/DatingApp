using System;
using System.Collections.Generic;
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
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    public class MessagesController : Controller
    {
        private readonly IMapper mapper;
        private readonly IDatingRepository repo;

        public MessagesController(IDatingRepository repo, IMapper mapper)
        {
            this.mapper = mapper;
            this.repo = repo;
        }
        [HttpGet("{id}", Name ="GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int id)
        {
            if (ValidateUser(userId))
                return Unauthorized();

            var messageFromRepo = await repo.GetMessage(id);

            if (messageFromRepo == null)
                return NotFound();

            return Ok(messageFromRepo);
        }

        [HttpGet]
        public async Task<IActionResult> GetMessagesForUser(int userId, [FromQuery]MessageParams messageParams)
        {
            if (ValidateUser(userId))
                return Unauthorized();
            messageParams.UserId = userId;

            var messagesFromRepo = await repo.GetMessagesForUser(messageParams);

            var messages = mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);

            Response.AddPagination(messagesFromRepo.CurrentPage, messagesFromRepo.PageSize,
                messagesFromRepo.TotalCount, messagesFromRepo.TotalPages);

            return Ok(messages);
        }

        [HttpGet("thread/{recipientId}")]
        public async Task<IActionResult> GetMessageThread(int userId, int recipientId)
        {
            if (ValidateUser(userId))
                return Unauthorized();

            var messageFromRepo = await repo.GetMessageThread(userId, recipientId);

            var messageThread = mapper.Map<IEnumerable<MessageToReturnDto>>(messageFromRepo);

            return Ok(messageThread);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, MessageForCreationDto messageForCreationDto)
        {
            if (ValidateUser(userId))
                return Unauthorized();

            messageForCreationDto.SenderId = userId;

            var recipient = await repo.GetUser(messageForCreationDto.RecipientId);

            if (recipient == null)
                return BadRequest("Could not find user");

            var message = mapper.Map<Message>(messageForCreationDto);

            repo.Add(message);

            var messageToReturn = mapper.Map<MessageForCreationDto>(message);

            if (await repo.SaveAll())
                return CreatedAtRoute("GetMessage", new { id = message.Id }, messageToReturn);

            throw new Exception("Creating the message failed on save");
            
        }
        private bool ValidateUser(int userId)
        {
            return userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        }
    }
}