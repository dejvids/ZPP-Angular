import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';
import { Opinion } from './Models/opinion';
import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OpinionsService {
  http: HttpClient;
  baseUrl: string;
  router: any;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, router: Router) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.router = router;
  }

  getOpinions(lectureId: number) {
    let opinions: Opinion[];

    this.http.get<Opinion[]>(this.baseUrl + '/api/me', { headers: this.GetDefaultHeaders() })
      .pipe(
        tap(res => console.log('ok')),
        catchError(this.handleError<any>())
      ).subscribe(res => {
        opinions = res;
      });
    return opinions;
  }
  
  private GetDefaultHeaders() {
    const jwt = this.ExtractAccessToken();
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer ' + jwt);
    return httpHeaders;
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
        this.router.navigateByUrl('/logowanie');
        return;
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
