import { Component, OnInit, Inject } from '@angular/core';
import { Lecture} from '../Models/Lecture';
import {JsonWebToken } from '../Models/JsonWebToken';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.component.html',
  styleUrls: ['./lecture.component.css']
})
export class LectureComponent implements OnInit {

  public lecture: Lecture = new Lecture();
  public userAlreadyJoined: boolean;
  public hasJoined: boolean;
  public hasError: boolean;
  public message: string;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  private GetLecture(id: number)
  {
    this.http.get<Lecture>(this.baseUrl + '/api/lectures/' + id)
    .pipe(
      tap(res => console.log('ok'))
    ).subscribe(res => {
      this.lecture = res;
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id != null) {
      this.GetLecture(parseInt(id));
    }
  }

  public join() {
    //var response = await Http.PostAsync("/api/lectures/participants/add-me", content);
    let url = this.baseUrl + '/api/lectures/participants/add-me';
    let content = {lecturerId: this.lecture.id};
    let token:JsonWebToken = JSON.parse(localStorage.getItem('token'));
    if(token == null){
      this.router.navigate(['/logowanie']);
    }
    
   // httpOptions.headers.append('Authorization', 'Bearer ${token.accessToken}');
    httpOptions.headers.set('Authorization', 'Bearer ' + token.accessToken);
    console.log('Bearer ${token.accessToken}');
    this.http.post<string>(url, content, httpOptions)
      .pipe(
        tap(res => console.log('join ok')),
        catchError(this.handleError<string>())
      )
      .subscribe((res: string) => {
        this.message = 'Właśnie zapisałeś się na zajęcia';
        this.hasJoined = true;
        }
      );
  }
  
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      if (error.status == 400) {
        console.log(`${operation} failed: ${error.error.message}`);
        this.message = error.error.message;
        this.hasError = true;
      }
      else if(error.status == 401) {
        this.router.navigate(['/logowanie']);
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
