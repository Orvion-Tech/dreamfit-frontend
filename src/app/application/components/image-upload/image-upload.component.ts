import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  Input,
  OnChanges,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent implements OnChanges {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  // @Output() fileSelected: EventEmitter<File> = new EventEmitter<File>();
  @Output() fileSelected: EventEmitter<{ file: File; side: string }> = new EventEmitter<{
    file: File;
    side: string;
  }>();
  @Output() deleteLastFile = new EventEmitter<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() uploadedFiles: any;
  @Input() index: number = 0;
  @Input() childLabel: string = '';
  imageChangedEvent: Event | null = null;
  croppedImage: Blob | null = null;
  selectedFile: File | null = null;
  croppedImageLink: string = '';
  showCroppedImage = false;
  // setCroppedImage: unknown;
  showCropPopup = false;
  fileSizeError!: string;
  constructor(private sanitizer: DomSanitizer) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['uploadedFiles']) {
      setTimeout(() => {
        this.updateDisplayedImage();
      }, 100);
    }
  }

  updateDisplayedImage() {
    let side = '';
    if (this.index === 0) {
      side = 'front';
    }
    if (this.index === 1) {
      side = 'side';
    }
    if (this.index === 2) {
      side = 'back';
    }
    if (
      this.uploadedFiles &&
      this.uploadedFiles.length > 0 &&
      this.uploadedFiles.filter((data: { side: string }) => data.side == side).length > 0
    ) {
      if (
        typeof this.uploadedFiles.filter((data: { side: string }) => data.side == side)[0]
          .selectedFile === 'string'
      ) {
        this.croppedImageLink = this.uploadedFiles.filter(
          (data: { side: string }) => data.side == side,
        )[0].selectedFile;
        this.showCroppedImage = true;
      }
    } else {
      // Handle case where there is no image for the current index
      this.showCroppedImage = false;
      this.croppedImageLink = '';
    }
    console.log(this.croppedImageLink);
  }
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
      let side = '';
      if (this.index === 0) {
        side = 'front';
      }
      if (this.index === 1) {
        side = 'side';
      }
      if (this.index === 2) {
        side = 'back';
      }
      this.deleteLastFile.emit(side);
    }
  }
  resetFileInput() {
    if (this.fileInput) {
      // Reset the input value to an empty string
      this.fileInput.nativeElement.value = '';
    }
  }
  fileChangeEvent(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    // Check if files are selected
    if (inputElement.files && inputElement.files.length > 0) {
      const selectedFile = inputElement.files[0];

      // Check file size (1MB = 1024 * 1024 bytes)
      const maxSizeInBytes = 5 * 1024 * 1024; // 1MB
      if (selectedFile.size > maxSizeInBytes) {
        // Set the error message
        this.fileSizeError = '上傳的文件不能超過5MB, 請重新上傳';

        // Clear other properties to prevent further actions
        this.imageChangedEvent = null;
        this.showCropPopup = false;
        this.selectedFile = null;

        return;
      }

      // Continue with the cropping process
      this.fileSizeError = ''; // Clear the error message
      this.imageChangedEvent = event;
      this.showCropPopup = true;
      this.selectedFile = selectedFile;
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
      let side = '';
      if (this.index === 0) {
        side = 'front';
      }
      if (this.index === 1) {
        side = 'side';
      }
      if (this.index === 2) {
        side = 'back';
      }
      // Emit the File
      this.fileSelected.emit({ file, side });
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
