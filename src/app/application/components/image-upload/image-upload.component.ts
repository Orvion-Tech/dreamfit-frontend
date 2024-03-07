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
import heic2any from 'heic2any';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imageChangedEvent: any = null;
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
    this.showCroppedImage = false;
    this.croppedImage = null;
    this.selectedFile = null;
    this.croppedImageLink = '';
    this.showCropPopup = false;
    this.imageChangedEvent = null;

    this.resetFileInput();
  }
  deleteFile() {
    this.showCroppedImage = false;
    this.croppedImage = null;
    this.selectedFile = null;
    this.croppedImageLink = '';
    this.imageChangedEvent = null;

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
  convertHeicToJpg(heicDataUrl: File): Promise<File> {
    return new Promise((resolve, reject) => {
      heic2any({
        blob: heicDataUrl,
        toType: 'image/jpeg',
      })
        .then(function (resultBlob) {
          const blob = Array.isArray(resultBlob) ? new Blob(resultBlob) : resultBlob;
          const file = new File([blob], 'converted.jpg', { type: 'image/jpeg' });
          resolve(file);
        })
        .catch(function (error) {
          alert('Error converting HEIC to JPG:');
          reject(error);
        });
    });
  }

  async fileChangeEvent(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    // Check if files are selected
    if (inputElement.files && inputElement.files.length > 0) {
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      let selectedFile;
      let imageEvent;
      if (inputElement.files[0].size > maxSizeInBytes) {
        this.fileSizeError = '上傳的文件不能超過5MB, 請重新上傳';
        this.imageChangedEvent = null;
        this.showCropPopup = false;
        this.selectedFile = null;
        return;
      }
      if (
        inputElement.files[0].name.includes('.heic') ||
        inputElement.files[0].name.includes('.HEIC')
      ) {
        selectedFile = await this.convertHeicToJpg(inputElement.files[0]);
        imageEvent = {
          target: {
            files: [selectedFile],
          },
        };
      } else {
        selectedFile = inputElement.files[0];
        imageEvent = event;
      }
      if (selectedFile) {
        if (!selectedFile.type.startsWith('image/')) {
          this.fileSizeError = '只允許上傳圖片文件，請重新上傳';
          this.imageChangedEvent = null;
          this.showCropPopup = false;
          this.selectedFile = null;
          return;
        }
      }
      this.fileSizeError = '';
      // this.imageChangedEvent = event;
      this.imageChangedEvent = imageEvent;
      this.showCropPopup = true;
      this.selectedFile = selectedFile;
    }
  }
  // convertHeicToJpg(heicDataUrl: File) {
  //   heic2any({
  //     blob: heicDataUrl,
  //     toType: 'image/jpeg',
  //   })
  //     .then(function (resultBlob) {
  //       const blob = Array.isArray(resultBlob) ? new Blob(resultBlob) : resultBlob;
  //       const file = new File([blob], 'converted.jpg', { type: 'image/jpeg' });
  //       console.log('Converted image file:', file);
  //       return file;
  //     })
  //     .catch(function (error) {
  //       console.error('Error converting HEIC to JPG:', error);
  //     });
  // }
  // async fileChangeEvent(event: Event) {
  //   const inputElement = event.target as HTMLInputElement;
  //   // Check if files are selected
  //   if (inputElement.files && inputElement.files.length > 0) {
  //     let selectedFile = inputElement.files[0];
  //     const maxSizeInBytes = 5 * 1024 * 1024; // 1MB
  //     console.log(selectedFile);
  //     if (selectedFile) {
  //       try {
  //         selectedFile = await this.convertHeicToJpg(selectedFile);
  //       } catch (error) {
  //         console.error('Error converting HEIC to JPG:', error);
  //         // Handle conversion error
  //         return;
  //       }
  //     }
  //     if (!selectedFile.type.startsWith('image/')) {
  //       this.fileSizeError = '只允許上傳圖片文件，請重新上傳';
  //       this.imageChangedEvent = null;
  //       this.showCropPopup = false;
  //       this.selectedFile = null;
  //       return;
  //     }
  //     if (selectedFile.size > maxSizeInBytes) {
  //       this.fileSizeError = '上傳的文件不能超過5MB, 請重新上傳';
  //       this.imageChangedEvent = null;
  //       this.showCropPopup = false;
  //       this.selectedFile = null;
  //       return;
  //     }
  //     this.fileSizeError = '';
  //     this.imageChangedEvent = event;
  //     this.showCropPopup = true;
  //     this.selectedFile = selectedFile;
  //   }
  // }
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
