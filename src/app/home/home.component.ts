import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { Lecture } from '../Models/Lecture';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  PromotingLectures: Lecture[];
  Lectures: Lecture[];
  searchedPhrase: string = '';
  router: Router;
  @Output() openedHome = new EventEmitter<boolean>();
  httpHeaders: HttpHeaders;

  constructor(private http: HttpClient, router: Router,  @Inject('BASE_URL') private baseUrl: string) {
    this.router = router;
  }

  ngOnInit() { 
    this.PromotingLectures = [];
    this.httpHeaders =
    new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
    this.getPromotingLectures();
  }

  private getLectures(){
    //todo do it in service
    let params = new HttpParams().set("phrase", this.searchedPhrase); //Create new HttpParams
    this.http.get<Lecture[]>(this.baseUrl + '/api/lectures', 
    { headers: this.httpHeaders, params })
    .pipe(
      tap(res => console.log('ok')),
      catchError(this.handleError<any>())
    ).subscribe(res => {
      this.Lectures = res;
      this.PromotingLectures = [this.Lectures[0], this.Lectures[1], this.Lectures[2]];
    });
  }

  public NavigateToDetails(id: number)
  {
    this.router.navigateByUrl("/zajecia/"+id);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      if (error.status == 400) {
        console.log(`${operation} failed: ${error.error.message}`);
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private getPromotingLectures() {
    this.http.get<Lecture[]>(this.baseUrl + '/api/lectures/promoting', 
    { headers: this.httpHeaders })
    .pipe(
      tap(res => console.log('ok - get promoting')),
      catchError(this.handleError<any>())
    ).subscribe(res => {
      this.PromotingLectures = res;
    });
  }

}
