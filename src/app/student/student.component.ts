import { Component, OnInit, Inject } from '@angular/core';
import { User } from '../Models/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { JsonWebToken } from '../Models/JsonWebToken';
import { UserLecture } from '../Models/UserLecture';
import { LectureService } from '../lecture-service.service';
import {LectureTab} from '../enums/LectureTab';
import { Opinion } from '../Models/opinion';


@Component({
  selector: 'app-profile',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})

export class StudentComponent implements OnInit {
  lectureService: LectureService;
  UserLectures: UserLecture[];
  FutureLectures: UserLecture[];
  ActiveLectures: UserLecture[];
  PastLectures: UserLecture[];

  LoadedLectures: boolean;
  SelectedTab: LectureTab = LectureTab.current;
  DeleteConfVisible: boolean;
  SetPresentVisible: boolean;
  SetMarkVisible: boolean;
  SetOpinionVisible: boolean;
  ConfirmationCode: string;
  SelectedLecture: UserLecture = new UserLecture();

  subjectMark: number;
  lecturerMark: number;
  recomendation: number;
  comment: string;

  user: User;
  roter: Router;
  http: HttpClient;
  baseUrl: string;
  httpHeaders: HttpHeaders;
  constructor(router: Router, http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.roter = router;
    this.http = http;
    this.user = new User();
    this.baseUrl = baseUrl;
  }

  /**
* Handle Http operation that failed.
* Let the app continue.
* @param operation - name of the operation that failed
* @param result - optional value to return as the observable result
*/
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      if (error.status === 400) {
        console.log(`${operation} failed: ${error.error.message}`);
      }

      if (error.status === 401) {
        this.roter.navigateByUrl('/logowanie');
        return;
      }

      if(error.status == 404) {
        console.log('Not found');
        return;
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token == null) {
      this.roter.navigateByUrl('/logowanie');
      return;
    }

    const tokenObj = JSON.parse(token);
    const jwt = tokenObj.accessToken;
    this.httpHeaders =
      new HttpHeaders()
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Authorization', 'Bearer ' + jwt);
    this.http.get<User>(this.baseUrl + "/api/me", { headers: this.httpHeaders })
      .pipe(
        tap(res => console.log('ok')),
        catchError(this.handleError<any>())
      ).subscribe(res => {
        this.user = res;
      });
    this.LoadUseLectures();
  }

  LoadUseLectures() {
    try {
      this.http.get<UserLecture[]>(this.baseUrl + '/api/lectures/mine', { headers: this.httpHeaders })
        .pipe(
          tap(res => console.log('ok')),
          catchError(this.handleError<any>())
        ).subscribe(res => {
          this.UserLectures = res;
          console.log('Futere lectures ' + this.UserLectures.length);
          this.ActiveLectures = this.UserLectures.filter(x => new Date(x.date).getTime() <= Date.now() && new Date(x.date).getTime() >= Date.now() - (30 * 24 * 3600 * 1000) && x.present == false);
          this.FutureLectures = this.UserLectures.filter(x => new Date(x.date).getTime() > Date.now());
          this.PastLectures = this.UserLectures.filter(x => new Date(x.date).getTime() < Date.now() && !this.ActiveLectures.find(l=>l.id == x.id));
          this.LoadedLectures = true;
        });
    } catch (ex) {
      console.log(ex.Message);

    }
  }

  CloseDialog(){
    this.DeleteConfVisible = false;
    this.SetOpinionVisible = false;
    this.SetPresentVisible = false;
  }

  QuitLecture() {
    console.log("Quti " + this.SelectedLecture);

    const content = JSON.stringify(this.SelectedLecture.id);
    const url = this.baseUrl + "/api/lecture/quit";
    try {
      const response = this.http.put(url, content, { headers: this.httpHeaders })
        .pipe(
          tap(res => console.log('ok')),
          catchError(this.handleError<any>())
        )
        .subscribe(res => {
          const index = this.FutureLectures.map(x => x.id).indexOf(this.SelectedLecture.id);
          if (index > -1) {
            this.FutureLectures.splice(index, 1);
          }
        });
    }
    catch (ex) {
      console.log(ex.Message);
    }
    finally {
      this.DeleteConfVisible = false;
    }
  }
  ShowActive() {
    this.SelectedTab = LectureTab.current;
    console.log(this.SelectedTab);
  }

  ShowFuture() {
    this.SelectedTab = LectureTab.future;
    console.log(this.SelectedTab);
  }
  ShowPast(){
    this.SelectedTab = LectureTab.past;
    console.log(this.SelectedTab);
  }

  ShowDeleteConfirmation(lecture: UserLecture) {
    this.SelectedLecture = lecture;
    this.DeleteConfVisible = true;
  }

  ShowSetPresentDialog(lecture: UserLecture) {
    console.log('Potwierdzenie obecności');
    this.SelectedLecture = lecture;
    this.SetPresentVisible = true;
  }

  ShowSetOpinionDialog(lecture: UserLecture) {
    console.log('Opening opinion dialog');
    this.SelectedLecture = lecture;
    this.SetOpinionVisible = true;
  }

  SetPresent() {
    console.log('present is set');
    this.SetPresentVisible = false;
  }

  SaveOpinion() {
    console.log('Opinion set');
    this.SetOpinionVisible = false;

    console.log(this.subjectMark);
    console.log(this.lecturerMark);
    console.log(this.recomendation);
    console.log(this.comment);

    const opinion = new Opinion();
    opinion.lectureId = this.SelectedLecture.id;
    opinion.lecturerMark = this.lecturerMark;
    opinion.subjectMark = this.subjectMark;
    opinion.recommendationChance = this.recomendation;
    opinion.comment = this.comment;

    const url = this.baseUrl + '/api/opinions';
    const content = JSON.stringify(opinion);

    this.http.post(url,content, {headers: this.httpHeaders})
    .pipe(catchError(this.handleError()))
    .subscribe(res =>{ 
      console.log('set opinion success');
      this.LoadUseLectures();
    });

  }
}