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
import { VerificationCode } from '../Models/VerificationCode';
import { OpinionsService } from '../opinions.service';

const CODE_EXPIRES_MINUTES = 30;
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
  codeExpires: number;
  codeLoaded: boolean;
  codeValidTo: Date;
  codeIsValid: boolean;

  user: User;
  router: Router;
  http: HttpClient;
  baseUrl: string;
  httpHeaders: HttpHeaders;

  constructor (router: Router, http: HttpClient, @Inject('BASE_URL') baseUrl: string, lectureService: LectureService) {
    this.router = router;
    this.http = http;
    this.user = new User();
    this.baseUrl = baseUrl;
    this.lectureService = lectureService;
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token == null) {
      this.router.navigateByUrl('/logowanie');
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
          this.ActiveLectures = this.UserLectures.filter(x => new Date(x.date).getTime() <= Date.now() && new Date(x.date).getTime() >= Date.now() - (30 * 24 * 3600 * 1000));
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
      this.lectureService.DeleteLecture(this.SelectedLecture.id).then((res) => {
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
    this.codeLoaded = false;
    this.codeExpires = CODE_EXPIRES_MINUTES;
    this.ShowAbsenceDialog();
    this.SelectedLecture = lecture;
    this.getActiveCode()
      .then(x => {
        this.codeLoaded = true;
      });
  }
  ShowAbsenceDialog() {
    this.CheckAbsenceDialogVisible = true;
  }
  GetLectureCode() {
    const lecture = this.SelectedLecture;
    const url = this.baseUrl + '/api/presence/code';
    return new Promise((resolve) => {
      try {
        let expirationDate = new Date();
        if(this.codeExpires < 10) {
          this.codeExpires = 10;
        }
        if(this.codeExpires > 300) {
          this.codeExpires = 300;
        }
        expirationDate.setMinutes(expirationDate.getMinutes() + this.codeExpires);
        
        console.log(expirationDate);
        let newDate = new Date();
        newDate.setMinutes(newDate.getMinutes() + this.codeExpires);
        newDate.setHours(newDate.getHours() + 2);
        console.log('date ' + newDate);
        this.http.post(url, JSON.stringify(
          {
            "id": this.user.id,
            "lectureId": lecture.id,
            "validTo": newDate
            
          }), { headers: this.httpHeaders })
          .pipe(
            catchError(err => new function () {
              lecture.code = null
            }
            )
          ).subscribe(
            suc => {
              lecture.code = (<any>suc).code;
              this.codeValidTo = new Date((<any>suc).validTo);
              this.codeValidTo.setHours(this.codeValidTo.getHours() - 2);
              this.codeIsValid = this.codeValidTo.getTime() > Date.now();
              this.ShowAbsenceDialog();
            });
      } catch (ex) {
        throw ex;
      }
    });
  }

  getActiveCode() {
    return new Promise((resolve) => {
      const url = this.baseUrl + `/api/presence/code/${this.SelectedLecture.id}`;
      try {
        this.http.get<VerificationCode>(url, { headers: this.httpHeaders })
          .pipe(
            tap(res => {
              if (res != null) {
                this.SelectedLecture.code = res.code;
              }
            }),
            catchError(this.handleError()))
          .subscribe(res => {
            this.codeValidTo = new Date((<any>res).validTo);
            console.log(this.codeValidTo);
            this.codeIsValid = this.codeValidTo.getTime() > Date.now();
            resolve();
          });
      }
      catch {
        resolve();
      }
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      //  console.error(error); // log to console instead

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

  showOpinions(lecture: UserLecture) {
    this.router.navigateByUrl(`/opinie/${lecture.id}`);
    return;
  }

}
