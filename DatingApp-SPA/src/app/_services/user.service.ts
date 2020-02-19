import { map } from 'rxjs/operators';
import { PaginatedResult } from './../_models/pagination';
import { User } from "./../_models/user";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "./../../environments/environment";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { Message } from '../_models/message';
import { NgxGalleryThumbnailsComponent } from 'ngx-gallery';

@Injectable({
  providedIn: "root"
})
export class UserService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(page?, itemsPerPage?, userParams?, likesParam?): Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
console.log('check');
    let params = new HttpParams();
    if (page != null && itemsPerPage != null){
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }
     
    if (userParams !=null) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }

    if (likesParam === 'Likers') {
      params = params.append('likers', 'true');
    }

    if (likesParam === 'Likees') {
      params = params.append('likees', 'true');
    }

    return this.http.get<User[]>(this.baseUrl + "users", { observe: 'response', params})
    .pipe(
      map(response => {
        paginatedResult.result = response.body;
        if(response.headers.get('Pagination') != null ) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    )
  }
  
  getUser(id: number): Observable<User> {
    return this.http.get<User>(this.baseUrl + "users/" + id);
  }

  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + "users/" + id, user);
  }

  setMainPhoto(userId: number, photoId: number) {
    return this.http.post(this.baseUrl + 'users/' + userId + '/photos/' + photoId + '/setMain', {})
  }

  deletePhoto(userId:number, photoId: number) {
    return this.http.delete(this.baseUrl + 'users/' + userId + '/photos/' + photoId);
  }

  sendLike(id:number, recipientId: number) {
    return this.http.post(this.baseUrl + 'users/' + id + '/like/' + recipientId, {});
  }

  getMessages(id: number, page?, itemsPerPage?, messageContainer?): Observable<PaginatedResult<Message[]>> {
    const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();

    let params = new HttpParams();

    params = params.append('MessageContainer', messageContainer);

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    return this.http.get<Message[]>(this.baseUrl + 'users/' + id + '/messages', {observe: 'response', params})
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
          }

          return paginatedResult;
        })
      );
  }

  getMessageThread(id: number, recipientId: number) {
    return this.http.get<Message[]>(this.baseUrl + 'users/' + id + '/messages/thread/' + recipientId);
  }

}
