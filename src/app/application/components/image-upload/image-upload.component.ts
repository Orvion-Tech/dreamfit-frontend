import { Component, ViewChild, ElementRef } from '@angular/core';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  imageChangedEvent: Event | null = null;
  croppedImage: unknown;
  setCroppedImage: unknown;
  showCropPopup = false;
  constructor(private sanitizer: DomSanitizer) {}
  hideCropPopup() {
    this.showCropPopup = false;
    this.resetFileInput();
  }
  resetFileInput() {
    if (this.fileInput) {
      // Reset the input value to an empty string
      this.fileInput.nativeElement.value = '';
    }
  }
  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.showCropPopup = true;
  }
  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl ?? '');
    // event.blob can be used to upload the cropped image
  }
  setCropImage() {
    this.setCroppedImage = this.croppedImage;
    this.hideCropPopup();
  }
  imageLoaded(image: LoadedImage) {
    console.log(image);
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
}
