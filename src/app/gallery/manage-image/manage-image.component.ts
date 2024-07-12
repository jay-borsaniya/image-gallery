import { Component, Inject, Optional } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.css', '../gallery.component.css'],
})
export class ManageImageComponent {
  tags: string[] = [];
  errorMessage: string;
  form: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  file: File;
  imageData: any;

  constructor(
    @Optional() public dialogRef: MatDialogRef<ManageImageComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() public bottomSheetRef: MatBottomSheetRef<ManageImageComponent>,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public bottomSheetData: any
  ) {
    if (bottomSheetData) {
      this.imageData = bottomSheetData;
    } else {
      this.imageData = data;
    }

    if (this.imageData.imageData) {
      this.imagePreview = this.imageData.imageData.imageData.image;
      this.tags = this.imageData.imageData.imageData.tags;
      this.form = new FormGroup({
        title: new FormControl(this.imageData.imageData.imageData.title, [
          Validators.required,
        ]),
        imageFile: new FormControl(null),
        tags: new FormControl(null),
      });
    } else {
      this.form = new FormGroup({
        title: new FormControl(null, [Validators.required]),
        imageFile: new FormControl(null, [Validators.required]),
        tags: new FormControl(null),
      });
    }
  }

  onFileSelect(event: Event): void {
    this.file = (event.target as HTMLInputElement).files[0];

    if (
      this.file &&
      (this.file.type === 'image/png' || this.file.type === 'image/jpeg')
    ) {
      this.errorMessage = null;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.file);
    } else {
      this.errorMessage = 'Please Enter Valid Image (.png/.jpg/.jpeg)';
    }
  }

  onAddTag() {
    const tagMatch = this.form.get('tags').value.trim();
    if (
      this.tags.filter((tag) => tag.toLowerCase() === tagMatch.toLowerCase())
        .length === 0
    ) {
      this.tags.push(tagMatch);
      this.form.get('tags').reset();
    } else {
      this.form.get('tags').reset();
    }
  }

  onRemoveTag(index: number) {
    this.tags.splice(index, 1);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.form.patchValue({ tags: this.tags });
      const response = this.form.value;

      response.encodedFile = this.imagePreview;
      response.id = this.imageData?.imageData?.index;
      response.date = this.imageData?.imageData?.imageData.date;
      if (this.file) {
        response.imageName = this.file.name;
        response.size = this.file.size;
      } else {
        response.imageName = this.imageData?.imageData?.imageData.name;
        response.size = this.imageData?.imageData?.imageData.size;
      }

      if (this.imageData?.isDialog) {
        this.dialogRef.close(response);
      } else {
        this.bottomSheetRef.dismiss(response);
      }
    }
  }

  onCancel(): void {
    if (this.imageData?.isDialog) {
      this.dialogRef.close();
    } else {
      this.bottomSheetRef.dismiss();
    }
  }
}
