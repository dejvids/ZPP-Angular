import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OpinionsService } from '../opinions.service';
import { LectureService } from '../lecture-service.service';
import { Opinion } from '../Models/opinion';
import { JsonWebToken } from '../Models/JsonWebToken';
import { Lecture } from '../Models/Lecture';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-opinions',
  templateUrl: './opinions.component.html',
  styleUrls: ['./opinions.component.css']
})
export class OpinionsComponent implements OnInit {
  opinions: Opinion[];
  selectedLecture: Lecture;


  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private opinionsService: OpinionsService, private lectureService: LectureService, @Inject('BASE_URL') private baseUrl: string) {
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token == null) {
      this.router.navigateByUrl('/logowanie');
      return;
    }
    const tokenObj: JsonWebToken = JSON.parse(token);
    if (tokenObj.role != 'lecturer') {
      this.router.navigateByUrl('/profil');
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    const lectureId: number = Number.parseInt(id);
    this.GetLecture(lectureId);
    this.getOpinions(lectureId);
  }

  private GetLecture(id: number) {
    this.http.get<Lecture>(this.baseUrl + '/api/lectures/' + id)
      .pipe(
        tap(res => console.log('ok'))
      ).subscribe(res => {
        this.selectedLecture = res;
      }
      );
  }
  getOpinions(lectureId: number) {
    this.http.get<Opinion[]>(this.baseUrl + '/api/opinions/lecture/' + lectureId, { headers: this.GetDefaultHeaders() })
      .pipe(
        tap(res => console.log('ok')),
        catchError(this.handleError<any>())
      ).subscribe(res => {
        console.log(res);
        this.opinions = res;
      });
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
