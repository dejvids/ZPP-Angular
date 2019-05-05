import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JsonWebToken } from '../Models/JsonWebToken';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  router: Router;

  constructor(router: Router) { 
    this.router = router;
  }

  ngOnInit() {
    const tokenString = localStorage.getItem('token');
    if(tokenString == null){
      this.router.navigateByUrl('/logowanie');
    }

    const token: JsonWebToken = JSON.parse(tokenString);

    if(token.role.toLowerCase() === 'student'){
      this.router.navigateByUrl('/student');
      return;
    }
    else if (token.role.toLowerCase() === 'lecturer') {
      this.router.navigateByUrl('/wykladowca');
      return;
    }

    else if (token.role.toLowerCase() === 'admin') {
      this.router.navigateByUrl('/admin');
      return;
    }

    this.router.navigateByUrl('/');
  }

}
