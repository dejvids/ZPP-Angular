import { Component, OnInit, Inject } from '@angular/core';
import { UserDetail } from '../Models/userDetail';
import { Role } from '../enums/Role';
import { Company } from '../Models/Company';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.css']
})
export class AdministratorComponent implements OnInit {

  users: UserDetail[];
  loaded: boolean;
  selectedUser: UserDetail;
  showUserRole: boolean;
  avalibleRoles: Role[] = [Role.Student, Role.Wykładowca];
  selectedRole: Role;
  companies: Company[];
  selectedCompany: Company;
  http: HttpClient;
  baseUrl: string;
  httpHeaders: HttpHeaders;
  router: Router;
  message: any;
  hasError: boolean;

  private loadUsers(page: number) {
    try{
      const url = this.baseUrl + "/api/users/page/" + page;
      this.http.get<UserDetail[]>(url, {headers:  this.httpHeaders})
      .pipe( catchError(this.handleError<any>()))
      .subscribe(res=> {
          console.log('Loaded users');
        });
    } catch(ex)
    {
      console.log(ex.message);
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
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, router: Router) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.router = router;
   }

  ngOnInit() {
    this.loadUsers(1);
  }

  hideDialog(){
    this.showUserRole = false;
  }

  setRole(){
    console.log('set user role');
  }

  showSelectRoleDialog(user: UserDetail){
    this.selectedUser = user;
    this.showUserRole = true;
  }

  showDeleteConfirmation(user: UserDetail){
    console.log('delete user');
  }

}
