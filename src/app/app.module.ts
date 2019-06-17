import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { StudentComponent } from './student/student.component';
import { LecturesComponent } from './lectures/lectures.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { FooterComponent } from './footer/footer.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { LogoutComponent } from './sign-in/logout';
import { SignInExternal } from './sign-in/sign-in-external';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgbModule, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {MatSelectModule} from '@angular/material/select';
import { LectureComponent } from './lecture/lecture.component';
import { UserComponent } from './user/user.component';
import { LecturerComponent } from './lecturer/lecturer.component';
import { NewLectureComponent } from './new-lecture/new-lecture.component';
import { AdministratorComponent } from './administrator/administrator.component';
import { OpinionsComponent } from './opinions/opinions.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    HomeComponent,
    StudentComponent,
    LecturesComponent,
    NavMenuComponent,
    FooterComponent,
    SignUpComponent,
    LogoutComponent,
    SignInExternal,
    LectureComponent,
    UserComponent,
    LecturerComponent,
    NewLectureComponent,
    AdministratorComponent,
    OpinionsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AngularFontAwesomeModule,
    AppRoutingModule,
    MatGridListModule,
    MatInputModule,
    MatIconModule,
    BrowserAnimationsModule,
    NgbModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
