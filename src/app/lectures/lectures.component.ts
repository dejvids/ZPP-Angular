import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Lecture } from '../Models/Lecture';
import { Inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
@Component({
  selector: 'app-lectures',
  templateUrl: './lectures.component.html',
  styleUrls: ['./lectures.component.css']
})
export class LecturesComponent implements OnInit {

  Lectures: Lecture[];
  searchedPhrase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
  }

  ngOnInit() {
    this.getLectures();
  }
  getLectures(){
      //todo move it to LecturesController
    let params = new HttpParams().set("phrase", this.searchedPhrase); //Create new HttpParams

    this.http.get<Lecture[]>(this.baseUrl + "/api/lectures", 
    { headers: new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8'), params })
    .pipe(
      tap(res => console.log('ok'))
    ).subscribe(res => {
      this.Lectures = res;
    });
  }
  //I'm sure it can be do better
  getRange(){
    let range = [];
    if(this.Lectures){
      for (let i =0; i < this.Lectures.length; i += 3) {
        range.push(i);
      }
    }
    return range;  
  }
}
