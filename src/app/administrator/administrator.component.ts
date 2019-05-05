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
  isSelectedLecturer: boolean = false;
  selectedCompanyId: number;
  deleteConfirmationVisible: boolean;

  private loadUsers(page: number) {
    try {
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

      const url = this.baseUrl + '/api/users/page/' + page;
      this.http.get<UserDetail[]>(url, { headers: this.httpHeaders })
        .pipe(catchError(this.handleError<any>()))
        .subscribe(res => {
          console.log('Loaded users ' + res.length);
          this.users = res;
          this.selectedUser = this.users.pop();
          if (this.selectedUser.roleId === 3) {
            this.selectedCompanyId = this.selectedUser.companyId;
          }
        });
    } catch (ex) {
      console.log(ex.message);
    }
  }

  loadCompanies() {
    const url = this.baseUrl + '/api/companies';
    this.http.get<Company[]>(url, { headers: this.httpHeaders })
      .pipe(catchError(this.handleError<any>()))
      .subscribe(res => {
        console.log('Loaded companies' + res.length);
        this.companies = res;
        this.loaded = true;
      });
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
        console.log('Unathorized');
        this.router.navigate(['/']);
      }
      else if (error.status == 404) {
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
    this.loadCompanies();
  }

  hideDialog() {
    this.showUserRole = false;
    this.deleteConfirmationVisible = false;
  }

  setRole() {
    console.log('set user role');
    const url = this.baseUrl + '/api/users/set-role';
    const grant = new GrantRole();
    grant.companyId = this.selectedCompanyId;
    grant.userId = this.selectedUser.id;
    grant.roleId = this.selectedRole;
    const content = JSON.stringify(grant);
    this.http.put(url, content, { headers: this.httpHeaders })
      .pipe(catchError(this.handleError<any>()))
      .subscribe(res => {
        console.log('role changed successfully');
        this.hideDialog();
        this.loadUsers(1);
      });
  }

  showSelectRoleDialog(user: UserDetail) {
    if(user.roleId !== Role.Student && user.roleId !== Role.Wykładowca) {
      return;
    }
    this.selectedUser = user;
    this.selectedRole = user.roleId;
    if (this.selectedRole === Role.Wykładowca) {
      this.isSelectedLecturer = true;
      this.selectedCompanyId = user.companyId;
    } else {
      this.isSelectedLecturer = false;
    }
    console.log(this.selectedRole.toString());
    this.showUserRole = true;
  }

  showDeleteConfirmation(user: UserDetail) {
    this.deleteConfirmationVisible = true;
    this.selectedUser = user;
    console.log('delete user');
  }

  companyChanged() {
    console.log('company changed');
  }

  deleteUser() {
    const url = this.baseUrl + '/api/users/' + this.selectedUser.id;
    this.http.delete(url, {headers: this.httpHeaders})
    .pipe(catchError(this.handleError<any>()))
    .subscribe(res => {
      console.log('user deleted');
      this.deleteConfirmationVisible = false;
      this.loadUsers(1);
    });
  }
  getRoleName(id: number) {
    return Role[id].toString();
  }

  seStudentRole() {
    this.selectedRole = Role.Student;
    this.isSelectedLecturer = false;
    console.log('student');
  }

  setLecturerRole() {
    this.selectedRole = Role.Wykładowca;
    this.isSelectedLecturer = true;
    console.log('wykładowca');
  }

}

class GrantRole {
  userId: number;
  roleId: number;
  companyId: number;
}
