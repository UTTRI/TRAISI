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
  public fileFormat: string = "Excel";

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

  public exportSurveyResponses(): void 
  {
		  window.open(`/api/Survey/${this.surveyId}/exportresponses/${this.fileFormat}`);		
  } 
  
}
