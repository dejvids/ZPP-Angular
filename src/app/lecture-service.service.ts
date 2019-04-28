import { Injectable, Inject } from '@angular/core';
import { UserLecture } from './Models/UserLecture';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LectureService {
  http: HttpClient;
  baseUrl: string;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.http = http;
    this.baseUrl = baseUrl;
  }

  GetMyLectures(): UserLecture[] {
    let lectures: UserLecture[];

    this.http.get<UserLecture[]>(this.baseUrl + '/api/me', { headers: this.GetDefaultHeaders() })
      .pipe(
        tap(res => console.log('ok')),
        catchError(this.handleError<any>())
      ).subscribe(res => {
        lectures = res;
      });
    return lectures;
  }

  private GetDefaultHeaders() {
    const jwt = this.ExtractAccessToken();
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer ' + jwt);
    return httpHeaders;
  }

  DeleteLecture(lectureId: number) {
    const url = this.baseUrl + '/api/lectures/' + lectureId;
    return new Promise((resolve) => {
      try {
        this.http.delete(url, { headers: this.GetDefaultHeaders() })
          .pipe(
            catchError(this.handleError())
          ).subscribe(res => {
            resolve();
          });
      } catch (ex) {
        console.log(ex.message);
        throw ex;
      }
    });
  }

  private ExtractAccessToken() {
    const token = localStorage.getItem('token');
    const tokenObj = JSON.parse(token);
    const jwt = tokenObj.accessToken;
    return jwt;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      if (error.status === 400) {
        console.log(`${operation} failed: ${error.error.message}`);
      }

      if (error.status === 401) {
        //this.roter.navigateByUrl('/logowanie');
        return;
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
