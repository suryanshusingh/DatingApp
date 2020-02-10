import { AlertifyService } from "./alertify.service";
import { UserService } from "./user.service";
import { AuthService } from "./auth.service";
import { Injectable } from "@angular/core";
import { FileUploader } from "ng2-file-upload";
import { environment } from "src/environments/environment";
import { Photo } from "../_models/photo";

@Injectable({
  providedIn: "root"
})
export class PhotoService {
  baseUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertify: AlertifyService
  ) {}

  getFileUploader(photos: Photo[]): FileUploader {
    var uploader = new FileUploader({
      url:
        this.baseUrl +
        "users/" +
        this.authService.decodedToken.nameid +
        "/photos",
      authToken: "Bearer " + localStorage.getItem("token"),
      isHTML5: true,
      allowedFileType: ["image"],
      removeAfterUpload: true,
      autoUpload: true,
      maxFileSize: 10 * 1024 * 1024
    });

    uploader.onAfterAddingFile = file => {
      file.withCredentials = false;
    };

    uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        photos.push(photo);
        if (photo.isMain) {
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem(
            "user",
            JSON.stringify(this.authService.currentUser)
          );
        }
      }
    };
    return uploader;
  }

  setMainPhoto(photo: Photo, currentMainPhoto: Photo, photos: Photo[]) {
    this.userService
      .setMainPhoto(this.authService.decodedToken.nameid, photo.id)
      .subscribe(
        () => {
          currentMainPhoto = photos.filter(p => p.isMain === true)[0];
          currentMainPhoto.isMain = false;
          photo.isMain = true;
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem(
            "user",
            JSON.stringify(this.authService.currentUser)
          );
        },
        error => {
          this.alertify.error(error);
        }
      );

  }

  deletePhoto(photoId: number, photos: Photo[]) {
    this.userService
        .deletePhoto(this.authService.decodedToken.nameid, photoId)
        .subscribe(
          () => {
            photos.splice(
              photos.findIndex(p => p.id === photoId),
              1
            );
            this.alertify.success("Photo has been deleted");
          },
          error => {
            this.alertify.error("Failed to delete the photo");
          }
        );
  }
}
