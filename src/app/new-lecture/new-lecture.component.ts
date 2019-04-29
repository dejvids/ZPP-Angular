import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LectureService } from '../lecture-service.service';
import { Lecture } from '../Models/Lecture';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-lecture',
  templateUrl: './new-lecture.component.html',
  styleUrls: ['./new-lecture.component.css']
})
export class NewLectureComponent implements OnInit {

  Name: string;
  Description: string;
  Place: string;
  Date: string;
  Time: string;
  Message: string;

  ShowDialog: boolean;
  IsAlertVisible: boolean;
  http: HttpClient;
  lectureService: LectureService;
  router: Router;
  constructor(httpClient: HttpClient, @Inject('BASE_URL') baseUrl: string, lectureService: LectureService, router: Router) {
    this.lectureService = lectureService;
    this.router = router;
  }

  ngOnInit() {
  }

  save() {
    this.IsAlertVisible = false;
    if (!this.validateForm()) {
      this.IsAlertVisible = true;
      return;
    }
    const newLecture = new Lecture();
    newLecture.name = this.Name;
    newLecture.description = this.Description;
    newLecture.place = this.Place;
    newLecture.date = this.getDateObj();
    this.lectureService.CreateLecture(newLecture)
      .catch(ex => {
        this.Message = ex.Message;
        this.IsAlertVisible = true;
      })
      .then(res => {
        this.ShowDialog = true;
      }
      );


  }

  private validateForm() {
    if (this.Name == null || this.Name.length === 0) {
      this.Message = 'Nazwa jest wymagana';
      return false;
    }
    if (this.Description == null || this.Description.length === 0) {
      this.Message = 'Opis jest wymagany';
      return false;
    }

    if (this.Place == null || this.Place.length === 0) {
      this.Message = 'Miejsce jest wymagane';
      return false;
    }

    if (this.Date == null) {
      this.Message = 'Niepoprawna data';
      return false;
    }

    if (this.Time == null) {
      this.Message = 'Niepoprawna godzina zajęć';
      return false;
    }


    const tommorow = new Date();
    tommorow.setDate(tommorow.getDate() + 1);
    tommorow.setHours(0);
    tommorow.setMinutes(0);
    const date = this.getDateObj();
    console.log(date + '' + date.getTime());
    console.log(tommorow + '' + tommorow.getTime());
    if (date.getTime() < tommorow.getTime()) {
      this.Message = 'Niepoprawna data';
      return false;
    }

    return true;
  }

  navigateToList(){
    this.router.navigateByUrl('/wykladowca');
  }

  private getDateObj() {
    let date = new Date(this.Date)
    const time = this.Time.split(':');
    const hours = Number.parseInt(time[0]);
    const minutes = Number.parseInt(time[1]);

    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  }

}
