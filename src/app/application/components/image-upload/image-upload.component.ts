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
import { NgxImageCompressService } from 'ngx-image-compress';
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
  @Input() type: string = '';
  imageChangedEvent: Event | null = null;
  croppedImage: Blob | null = null;
  selectedFile: File | null = null;
  croppedImageLink: string = '';
  showCroppedImage = false;
  // setCroppedImage: unknown;
  showCropPopup = false;
  fileSizeError!: string;

  constructor(
    private sanitizer: DomSanitizer,
    private imageCompress: NgxImageCompressService,
  ) {}
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
  }
  hideCropPopup() {
    this.showCropPopup = false;
    this.resetFileInput();
  }
  deleteFile() {
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
      console.log(selectedFile);

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
      // if (!selectedFile.type.startsWith('image/')) {
      //   // Set the error message for file type
      //   this.fileSizeError = '只允許上傳圖片文件，請重新上傳';

      //   // Clear other properties to prevent further actions
      //   this.imageChangedEvent = null;
      //   this.showCropPopup = false;
      //   this.selectedFile = null;

      //   return;
      // }
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
      // Define the target size (1MB = 1024 * 1024 bytes)
      const targetSize = 1024 * 256;

      // Compress the image iteratively until its size is less than the target size
      this.compressImageIteratively(this.croppedImage, targetSize).then(
        (result) => {
          // Create a new File object from the compressed image data
          const fileName = this.selectedFile!.name;
          const file = new File([result], fileName, {
            type: result.type,
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

          // Emit the compressed File
          this.fileSelected.emit({ file, side });
          this.hideCropPopup();
        },
        (error) => {
          console.error('Failed to compress image:', error);
          // Handle error if compression fails
        },
      );
    }
  }

  async compressImageIteratively(image: Blob, targetSize: number): Promise<Blob> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let compressedImage: any;
    // Convert Blob to Base64 string
    const reader = new FileReader();
    reader.readAsDataURL(image);
    await new Promise<void>((resolve) => {
      reader.onload = () => {
        compressedImage = reader.result;
        resolve();
      };
    });

    while ((compressedImage?.toString().length || 0) > targetSize) {
      compressedImage = await this.imageCompress.compressFile(compressedImage, -1, 50, 50);
    }

    // Convert the compressed Base64 string back to Blob
    const blob = this.dataURItoBlob(compressedImage as string);
    return blob;
  }

  // Function to convert Base64 string to Blob
  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
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
