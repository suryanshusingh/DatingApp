import { PhotoService } from './../../_services/photo.service';
import { AlertifyService } from "./../../_services/alertify.service";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Photo } from "src/app/_models/photo";
import { FileUploader } from "ng2-file-upload";

@Component({
  selector: "app-photo-editor",
  templateUrl: "./photo-editor.component.html",
  styleUrls: ["./photo-editor.component.css"]
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>();

  uploader: FileUploader;
  hasBaseDropZoneOver: boolean = false;
  currentMain: Photo;

  constructor(
    private alertify: AlertifyService,
    private photoService: PhotoService
  ) {}

  ngOnInit() {
    //create Uploader and add photo to photos array
    this.uploader = this.photoService.getFileUploader(this.photos);
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  //On Main button Click
  setMainPhoto(photo: Photo) {
    this.photoService.setMainPhoto(photo, this.currentMain, this.photos);
  }

  deletePhoto(photoId: number) {
    this.alertify.confirm("Are you sure you want to delete this photo?", () => {
      this.photoService.deletePhoto(photoId, this.photos);
    });
  }
}
