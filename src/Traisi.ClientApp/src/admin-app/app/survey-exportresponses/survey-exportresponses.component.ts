import { Component, OnInit } from '@angular/core';
import { UserGroupService } from '../services/user-group.service';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../services/survey.service';
import { Survey } from '../models/survey.model';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-survey-exportresponses',
  templateUrl: './survey-exportresponses.component.html',
  styleUrls: ['./survey-exportresponses.component.scss']
})
export class SurveyExportresponsesComponent implements OnInit {

  public surveyId: number;
  public survey: Survey;

  constructor(private userGroupService: UserGroupService, private surveyService: SurveyService, private route: ActivatedRoute, private http:HttpClient) {
    this.route.params.subscribe(params => this.surveyId = params['id']);
    this.survey = new Survey();
  }

  ngOnInit(): void {
    this.survey = this.surveyService.getLastSurvey();
    if (!this.survey || this.survey === null || this.survey.id !== this.surveyId) {
      this.survey = new Survey();
      this.surveyService.getSurvey(this.surveyId).subscribe(result => {
        this.survey = result;
      }, error => { });
    }
  }

  public exportSurveyResponses(): void {

		// return this.http.get('http://localhost:8080/employees/download', { responseType: ResponseContentType.Blob });
		window.open(`/api/Survey/${this.surveyId}/exportresponses`);
		
	} 

  /* public downloadResponsesZip(): void {
    //alert("Hello");
    //console.log(this.survey)
    this.http.get("http://localhost:5000/api/Survey/2/exportresponses", {
      responseType: 'arraybuffer'
    }).subscribe(data => {
      
      const blob = new Blob([data], {
        type: 'application/zip'
      });
      const url = window.URL.createObjectURL(blob);
      console.log(url);
      window.open(url);
      
     //console.log(data);
    });
  } */
}
