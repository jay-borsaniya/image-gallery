import { Component } from '@angular/core';
import { GalleryService, ImageData } from '../gallery/gallery.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  selectedSort: string;
  form: FormGroup;

  constructor(private galleryService: GalleryService) {
    this.form = new FormGroup({
      search: new FormControl(null, [Validators.required]),
    });
  }

  onSort(value: string) {
    this.galleryService.sortData(value);
    this.selectedSort = value;
  }

  onSearch() {
    const imagesData = this.galleryService.records;
    const searchedData = imagesData.filter((record) =>
      record.tags.some((tag) =>
        tag.toLowerCase().includes(this.form.value.search.toLowerCase())
      )
    );
    this.galleryService.realtimeData.next(searchedData);
    this.form.reset();
  }

  onReset() {
    this.galleryService.realtimeData.next(this.galleryService.records);
    this.galleryService.sortData(this.galleryService.selectedSort);
    this.form.reset();
  }
}
