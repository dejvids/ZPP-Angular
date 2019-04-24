import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ProfileComponent } from './profile/profile.component';
import { LecturesComponent } from './lectures/lectures.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LogoutComponent } from './sign-in/logout';
import { SignInExternal } from './sign-in/sign-in-external';
import {LectureComponent} from './lecture/lecture.component';

const appRoutes: Routes =
[
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'logowanie', component: SignInComponent },
  { path: 'profil', component: ProfileComponent },
  { path: 'zajecia', component: LecturesComponent },
  { path: 'rejestracja', component: SignUpComponent },
  { path: 'wyloguj', component: LogoutComponent },
  { path: 'signin-external', component: SignInExternal },
  { path: 'kursy', component: LecturesComponent},
  { path: 'zajecia/:id', component: LectureComponent},
  { path: '**', component: HomeComponent}
];
@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}