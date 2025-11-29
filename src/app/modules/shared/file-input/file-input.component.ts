import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-input',
  imports: [],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.css',
})
export class FileInputComponent {
  @Input() accept: string = 'image/*';
  @Output() filechanged: EventEmitter<string> = new EventEmitter<string>();

  loadImageFromFile(event: Event): void {
    console.log('load file event', event);
    let files = (event.target as HTMLInputElement).files as FileList;

    for (let x = 0; x < files.length; x++) {
      if (this.validateImage(files[0])) {
        this.previewImage(files[0]);
      }
    }
  }
  validateImage(image: File): Boolean {
    const validtypes = ['image/jpeg', 'image/png'];
    const maxSizeInBytes = 5e6; // 10MB
    if (!validtypes.includes(image.type)) {
      console.log('not valid haha');
      // this.snackbarService.openSnackBar('invalid image type', 'ok', true);
      return false;
    }
    if (image.size > maxSizeInBytes) {
      // this.snackbarService.openSnackBar('image size too large', 'ok', true);
      return false;
    }
    return true;
  }

  previewImage(image: File) {
    // read the image...
    var reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const imageUrl = e?.target?.result;
      this.filechanged.emit(imageUrl as string)
    };
    reader.readAsDataURL(image);
  }
}
