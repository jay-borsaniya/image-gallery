import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, catchError, Subject, take, throwError } from 'rxjs';

export interface ImageData {
  [x: string]: any;
  name: string;
  title: string;
  size: number;
  tags: string[];
  image: string;
  date: Date;
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  imagesData: ImageData[] = [];
  realtimeData = new BehaviorSubject<ImageData[]>(this.records);
  isLoading = false;
  selectedSort: string = 'date';

  constructor(private http: HttpClient) {}

  get records() {
    if (this.imagesData.length > 0) {
      return this.imagesData.slice();
    } else {
      return [];
    }
  }

  sortData(field: string) {
    let imagesData: ImageData[];
    this.realtimeData.pipe(take(1)).subscribe((data) => {
      imagesData = data;
    });  

    switch (field) {
      case 'name':
        imagesData.sort((a, b) =>
          a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
        );
        break;

      case 'size':
        imagesData.sort((a, b) => a.size - b.size);

        break;

      default:
        imagesData.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        break;
    }

    this.selectedSort = field;
    this.realtimeData.next(imagesData);
  }

  getData() {
    return this.http
      .get<ImageData[]>(`${environment.API}/image-details.json`)
      .pipe(catchError(this.handleError));
  }

  setData() {
    return this.http
      .put<ImageData[]>(
        `${environment.API}/image-details.json`,
        this.imagesData
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage: string;

    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }

    switch (errorRes.error.error.message) {
      case 'TOO_MANY_ATTEMPTS_TRY_LATER : Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.':
        errorMessage = 'Too many requests. Try later';
        break;
      default:
        errorMessage = 'Internal Server Error';
        break;
    }

    return throwError(errorMessage);
  }
}
