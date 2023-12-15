import { Component, ViewChild, ElementRef, Output, Input, EventEmitter } from '@angular/core';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  @Output() fileSelected: EventEmitter<File> = new EventEmitter<File>();
  @Output() deleteLastFile = new EventEmitter<number>();
  @Input() uploadedFiles: File[] = [];
  @Input() index: number = 0;
  imageChangedEvent: Event | null = null;
  croppedImage: Blob | null = null;
  selectedFile: File | null = null;
  croppedImageLink: string = '';
  showCroppedImage = false;
  // setCroppedImage: unknown;
  showCropPopup = false;
  constructor(private sanitizer: DomSanitizer) {}
  hideCropPopup() {
    this.showCropPopup = false;
    this.resetFileInput();
  }
  deleteFile() {
    console.log(this.uploadedFiles);
    this.showCroppedImage = false;
    this.croppedImage = null;
    this.selectedFile = null;
    this.croppedImageLink = '';
    if (this.uploadedFiles.length > 0) {
      // Notify the parent component to delete the last file
      this.deleteLastFile.emit(this.index);
    }
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
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFile = inputElement.files[0];
    }
  }
  imageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedImage = event.blob;
    }
    if (event.objectUrl) {
      this.croppedImageLink = event.objectUrl;
    }
    // event.blob can be used to upload the cropped image
  }
  setCropImage() {
    this.showCroppedImage = true;

    // Ensure both selectedFile and croppedImage are available
    if (this.selectedFile && this.croppedImage) {
      const fileName = this.selectedFile.name;
      const file = new File([this.croppedImage], fileName, {
        type: this.croppedImage.type,
        lastModified: Date.now(),
      });

      // Emit the File
      this.fileSelected.emit(file);
      this.hideCropPopup();
    }
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
