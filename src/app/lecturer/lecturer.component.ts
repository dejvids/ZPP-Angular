import { Component, OnInit, Inject } from '@angular/core';
import { User } from '../Models/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { JsonWebToken } from '../Models/JsonWebToken';
import { UserLecture } from '../Models/UserLecture';
import { LectureService } from '../lecture-service.service';
import { LectureTab } from '../enums/LectureTab';
import { Lecture } from '../Models/Lecture';

@Component({
  selector: 'app-lecturer',
  templateUrl: './lecturer.component.html',
  styleUrls: ['./lecturer.component.css']
})
export class LecturerComponent implements OnInit {

  lectureService: LectureService;
  UserLectures: UserLecture[];
  FutureLectures: UserLecture[];
  ActiveLectures: UserLecture[];
  PastLectures: UserLecture[];

  LoadedLectures: boolean;
  SelectedTab: LectureTab = LectureTab.current;
  DeleteConfVisible: boolean;
  CheckAbsenceDialogVisible: boolean;
  SetPresentVisible: boolean;
  SetMarkVisible: boolean;
  SetOpinionVisible: boolean;
  ConfirmationCode: string;
  SelectedLecture: UserLecture = new UserLecture();

  user: User;
  roter: Router;
  http: HttpClient;
  baseUrl: string;
  httpHeaders: HttpHeaders;

  constructor(router: Router, http: HttpClient, @Inject('BASE_URL') baseUrl: string, lectureService: LectureService) {
    this.roter = router;
    this.http = http;
    this.user = new User();
    this.baseUrl = baseUrl;
    this.lectureService = lectureService;
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
    this.http.get<User>(this.baseUrl + '/api/me', { headers: this.httpHeaders })
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
          this.ActiveLectures = this.UserLectures.filter(x => new Date(x.date).getTime() <= Date.now() && new Date(x.date).getTime() >= Date.now() - (30 * 24 * 3600 * 1000) && x.present == false);
          this.FutureLectures = this.UserLectures.filter(x => new Date(x.date).getTime() > Date.now());
          this.PastLectures = this.UserLectures.filter(x => new Date(x.date).getTime() < Date.now() && !this.ActiveLectures.find(l => l.id == x.id));
          this.LoadedLectures = true; 
        });
    } catch (ex) {
      console.log(ex.Message);

    }
  }

  DeleteLecture() {
    try {
      this.lectureService.DeleteLecture(this.SelectedLecture.id).then( (res) => {
        console.log('deleted');
        this.DeleteConfVisible = false;
        this.LoadUseLectures();
      });

    } catch (ex) {
      console.log(ex.message);
    }
  }

  ShowActive() {
    this.SelectedTab = LectureTab.current;
  }

  ShowFuture() {
    this.SelectedTab = LectureTab.future;
  }
  ShowPast() {
    this.SelectedTab = LectureTab.past;
  }

  ShowDeleteConfirmation(lecture: UserLecture) {
    this.SelectedLecture = lecture;
    this.DeleteConfVisible = true;
  }

  CloseDialog() {
    this.DeleteConfVisible = false;
    this.CheckAbsenceDialogVisible = false;
  }
  CheckAbsence(lecture: UserLecture) {
    this.SelectedLecture = lecture;
    if(!lecture.code){
      lecture.code = this.generateCode();
      this.SaveLectureCode(lecture);
    }
    else {
      this.ShowAbsenceDialog();
    }
  }
  ShowAbsenceDialog() {
    this.CheckAbsenceDialogVisible = true;
  }
  SaveLectureCode(lecture: UserLecture){
    const url = this.baseUrl + '/api/presence/code';
    return new Promise((resolve) => {
      try{
        var expirationDate = new Date ( lecture.date );
        expirationDate.setMinutes ( expirationDate.getMinutes() + 30 );

        this.http.post(url, JSON.stringify(
          {
          "id": this.user.id,
          "lectureId": lecture.id,
          "code": lecture.code,
          "validTo": expirationDate,
        }), {headers: this.httpHeaders})
        .pipe(
          catchError(err => new function() {
              lecture.code = null}
            )
        ).subscribe(
          suc => {
            this.ShowAbsenceDialog();
          });
      } catch(ex){
        throw ex;
      }
    })
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
        this.roter.navigateByUrl('/logowanie');
        return;
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  generateCode() {
    return 'xxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  }

  showOpinions(lecture: UserLecture) {
    console.log('Show opinions - not implemented');
  }

}
