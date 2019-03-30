import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import 'src/app/Models/User'
import { Observable, of } from 'rxjs';
import { User } from 'src/app/Models/User';
import { Router } from '@angular/router';
import { NavbarService } from '../navbar.service';
import { SignInResult } from '../Models/SignInResult';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  http: HttpClient;
  baseUrl: string;
  router: Router;

  login = '';
  password: string = '';
  isAlertVisible: boolean;
  errorMessage: string;

  constructor(private navbarService: NavbarService, router: Router, http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.router = router;
  }


  public signIn() {
    console.log('Logowanie');

    if (!this.login || this.login.length == 0 || !this.password || this.password.length == 0) {
      this.errorMessage = 'Podaj login i hasło';
      this.isAlertVisible = true;
      console.log('Podaj login i hasło');

      return;
    }
    let url = this.baseUrl + "/api/sign-in";
    console.log(url);
    let user = new User();
    user.login = this.login;
    user.password = this.password;
    console.log(user);
    this.http.post<SignInResult>(url, user, httpOptions)
      .pipe(
        tap(res => console.log('login ok')),
        catchError(this.handleError<SignInResult>())
      )
      .subscribe((res: SignInResult) => {
        if (res.success) {
          localStorage.setItem('token', JSON.stringify(res.token));
          this.navbarService.setSignedIn();
          this.router.navigateByUrl('/profil');
        }
      });
  }

  public signInFacebook() {
    console.log('sign in by facebook');
    location.assign(this.baseUrl + '/sign-in-facebook/angular');
  }

  public signInGoogle() {
    console.log('sign in by google');
    location.assign(this.baseUrl + '/sign-in-google/angular');
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
      if (error.status == 400) {
        console.log(`${operation} failed: ${error.error.message}`);
        this.errorMessage = error.error.message;
        this.isAlertVisible = true;
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  ngOnInit() {
    let token = localStorage.getItem('token');
    console.log('menu ' + token);
    if (token != null) {
      let jwt = JSON.parse(token);
      console.log(jwt.expires);
      if (jwt.expires > new Date().getTime()) {
        this.router.navigateByUrl('/profil');
      }
    }
  }
}
