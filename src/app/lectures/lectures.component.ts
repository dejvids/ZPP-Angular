import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Lecture } from '../Models/Lecture';
import { Inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lectures',
  templateUrl: './lectures.component.html',
  styleUrls: ['./lectures.component.css']
})
export class LecturesComponent implements OnInit {
  orderOptions : any[] = [
    {
      id: 0,
      internalName: 'date',
      name: 'Według daty rosnąco'
    },
    {
      id: 1,
      internalName: 'date desc',
      name: 'Według daty malejąco'
    },  {
      id: 2,
      internalName: 'name',
      name: 'Alfabetycznie'
    },  {
      id: 3,
      internalName: 'name desc',
      name: 'Alfabetycznie malejąco'
    }
  ];
  Lectures: Lecture[];
  searchedPhrase: string = "";
  page: number = 1;
  numberOfLectures: number = 1;
  order = this.orderOptions[0];
  constructor(private http: HttpClient, private router: Router, @Inject('BASE_URL') private baseUrl: string) {
  }

  ngOnInit() {
    this.getNumberOfLectures();
  }
  getLectures(){
    let params = new HttpParams()
      .set("phrase", this.searchedPhrase) //Create new HttpParams
      .set("page", this.page.toString())
      .set("order", this.order.id);
    this.http.get<Lecture[]>(this.baseUrl + "/api/lectures", 
    { headers: new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8'), params })
    .pipe(
      tap(res => console.log('ok'))
    ).subscribe(res => {
      this.Lectures = res;
    });
  }
  getNumberOfLectures(){
    let params = new HttpParams()
    .set("phrase", this.searchedPhrase);
    this.http.get<number>(this.baseUrl + "/api/lectures/results", 
    { headers: new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8'), params })
    .subscribe(res => {
      this.numberOfLectures = res;
      this.getLectures();
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
  pageChange() {
    this.getLectures();
  }

  public NavigateToDetails(id: number) {
    this.router.navigateByUrl('/zajecia/' + id);
  }
}
