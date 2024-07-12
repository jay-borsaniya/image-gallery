import { Component, OnInit } from '@angular/core';
import { ImageData } from './gallery.service';
import { MatDialog } from '@angular/material/dialog';
import { ManageImageComponent } from './manage-image/manage-image.component';
import { GalleryService } from './gallery.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent implements OnInit {
  imagesData: ImageData[] = [];
  isLoading = false;
  errorMsg: string;

  constructor(
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    public galleryService: GalleryService
  ) {}

  ngOnInit(): void {
    this.galleryService.realtimeData.subscribe((res) => {
      this.imagesData = res;
    });

    if (this.galleryService.imagesData.length === 0) {
      this.getData();
    }
  }

  onView(index: number) {
    const imageData: ImageData = this.imagesData[index];
    this.openDialog(imageData, index, false);
  }

  onEdit(index: number) {
    const imageData: ImageData = this.imagesData[index];
    this.openDialog(imageData, index, true);
  }

  onDelete(index: number) {
    const imageData: ImageData = this.imagesData[index];

    const res = confirm(
      `Are you sure you would like to delete ${imageData.title} image`
    );

    if (res) {
      this.imagesData.splice(index, 1);
      this.handleData();
    }
  }

  onRemoveAlert() {
    this.errorMsg = null;
  }

  openDialog(
    imageData?: ImageData,
    index?: number,
    isEditable?: boolean
  ): void {
    const displayWidth = window.innerWidth;

    if (displayWidth > 768) {
      const dialogRef = this.dialog.open(ManageImageComponent, {
        width: '500px',
        data: {
          imageData: imageData
            ? { imageData: imageData, index: index, isEditable }
            : null,
          isDialog: true,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.storeData(result);
        }
      });
    } else {
      const bottomSheetRef = this.bottomSheet.open(ManageImageComponent, {
        data: {
          imageData: imageData
            ? { imageData: imageData, index: index, isEditable }
            : null,
          isDialog: false,
        },
      });

      bottomSheetRef.afterDismissed().subscribe((result) => {
        if (result) {
          console.log(result);
          
          this.storeData(result);
        }
      });
    }
  }

  getData() {
    this.isLoading = true;
    this.galleryService.getData().subscribe((data) => {
      if (data) {
        this.galleryService.imagesData = Object.values(data);
      } else {
        this.galleryService.imagesData = [];
      }
      this.galleryService.realtimeData.next(this.galleryService.imagesData);
      this.galleryService.sortData(this.galleryService.selectedSort);
      // this.imagesData = this.galleryService.records;
      this.isLoading = false;
    });
  }

  storeData(result) {
    this.isLoading = true;
    const imageData: ImageData = {
      name: result.imageName,
      title: result.title,
      size: result.size,
      tags: result.tags,
      image: result.encodedFile,
      date: result.date ? result.date : new Date(),
    };

    this.isLoading = true;

    if (result.id || result.id === 0) {
      this.imagesData[result.id] = imageData;
    } else {
      this.imagesData.push(imageData);
    }
    this.galleryService.imagesData = this.imagesData;

    this.handleData();
  }

  handleData() {
    this.galleryService.setData().subscribe(
      (res) => {
        this.galleryService.imagesData = res ? res : [];
        // this.imagesData = this.galleryService.records;
        this.galleryService.realtimeData.next(this.galleryService.imagesData);
        this.galleryService.sortData(this.galleryService.selectedSort);
        this.isLoading = false;
      },
      (errorMessage) => {
        this.errorMsg = errorMessage;
        this.isLoading = false;
      }
    );
  }
}
