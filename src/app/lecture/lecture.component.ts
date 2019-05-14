import { Component, OnInit, Inject } from '@angular/core';
import { Lecture } from '../Models/Lecture';
import { JsonWebToken } from '../Models/JsonWebToken';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs';
import { UserLecture } from '../Models/UserLecture';
import { Participant } from '../Models/Participant';

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
  private userLectures: UserLecture[];
  httpHeaders: HttpHeaders;
  finished: any;
  isLoaded = false;
  userIsLecturer
  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  private GetLecture(id: number) {
    this.http.get<Lecture>(this.baseUrl + '/api/lectures/' + id)
      .pipe(
        tap(res => console.log('ok'))
      ).subscribe(res => {
        this.lecture = res;
        if ( this.lecture != null && new Date(this.lecture.date).getTime() < Date.now()) {
          this.finished = true;
        }
      });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    let token: JsonWebToken = JSON.parse(localStorage.getItem('token'));
    console.log(token);
    if (token == null) {
      console.log('token is null');
      this.router.navigate(['/logowanie']);
    }

    // httpOptions.headers.append('Authorization', 'Bearer ${token.accessToken}');
    this.httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer ' + token.accessToken);

    this.GetUserLectures(Number.parseInt(id));

    if (id != null) {
      this.GetLecture(parseInt(id));
    }
  }

  public join() {
    let url = this.baseUrl + '/api/lectures/participants/add-me';
    const content = new Participant(this.lecture.id);
    console.log('content ' + JSON.stringify(content));
    this.http.post(url, content, { headers: this.httpHeaders })
      .pipe(
        tap(res => console.log('join ok')),
        catchError(this.handleError<string>())
      )
      .subscribe(res => {
        console.log(res);
        this.message = 'Właśnie zapisałeś się na zajęcia';
        this.hasJoined = true;
        this.userAlreadyJoined = true;
      }
      );
  }

  private GetUserLectures(id: number) {
    try {
      this.http.get<UserLecture[]>(this.baseUrl + '/api/lectures/mine', { headers: this.httpHeaders })
        .pipe(
          tap(res => console.log('ok')),
          catchError(this.handleError<any>())
        ).subscribe(res => {
          console.log('user lectures');
          this.userLectures = res;
          console.log(res);
          if (this.userLectures && this.userLectures.filter(x => x.id == id).length > 0) {
            this.userAlreadyJoined = true;
          }
          else {
            this.userAlreadyJoined = false;
          }
          this.isLoaded = true;

        });
    }
    catch (ex) {
      console.log(ex);
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);

      if (error.status == 400) {
        console.log(`${operation} failed: ${error.error.message}`);
        this.message = error.error.message;
        this.hasError = true;
      }
      else if (error.status == 401) {
        console.log("Unathorized");
        this.router.navigate(['/logowanie']);
      }
      else if(error.status == 404){
        console.log('not found lecture');
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
