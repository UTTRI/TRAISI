import { Component, OnInit, NgModule } from '@angular/core';
import { fadeInOut } from '../services/animations';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
	selector: 'app-survey-analyze',
	templateUrl: './survey-analyze.component.html',
	styleUrls: ['./survey-analyze.component.scss'],
	animations: [fadeInOut]
})

@NgModule({
	imports: [
		NgSelectModule,
	]
})

export class SurveyAnalyzeComponent implements OnInit {

	public surveyId: number;

	constructor(private httpObj: HttpClient, private route: ActivatedRoute) {

		this.route.params.subscribe(params => this.surveyId = params['id']);
	};

	//Sample Distribution Analysis
	public daysInField: number = 10;
	public avgResponsePerDay = 40;
	public completed = 0;
	public incomplete: number = 0;

	public colorClasses: string[] = ["progress-bar bg-success", "progress-bar bg-info", "progress-bar bg-warning", "progress-bar bg-primary"];
	public responses: any = [];
	public serverData: any = {};
	public actualResponses: any = [];

	public questions: any = [];
	public questionResults: any = [];
	public questionOptionLabels: any = [];

	public selectedRegion: string = "";
	public selectedQuestion: string = "1";

	public matrixResults: any = [];
	
	//question type tables
	public x:boolean = false;
	public y:boolean = false;
	
	public ngOnInit(): void {
		//Load Question names				
		//api analytics controller url
		let url = "/api/SurveyAnalytics/" + this.surveyId;
		this.httpObj.get(url).subscribe((resData: any[]) => {
			this.questions = resData;
		});
		this.filterByQuestion();
	}

	public filterByCity() {
		if (this.selectedRegion == "")
			this.responses = this.actualResponses;
		else
			this.responses = this.actualResponses.filter(item => item.city == this.selectedRegion);

		this.handleResponses();
	}

	public filterByQuestion() {
		//api analytics controller url
		let url = "/api/SurveyAnalytics/" + this.surveyId + "/" + this.selectedQuestion;
		this.httpObj.get(url).subscribe((resData: any) => {
			//Radio, Checkbox question type results
			if (resData.questionTypeResults != undefined) {
				this.x = true;
				this.y = false;
				this.serverData = resData;
				this.responses = resData.completedResponses;
				this.actualResponses = resData.completedResponses;
				this.completed = resData.totalComplete;
				this.incomplete = resData.totalIncomplete;
				this.questionResults = resData.questionTypeResults;
				this.handleResponses();
			}
			//Matrix question type results
			else  if (resData.matrixResults != undefined) {
				this.x = false;
				this.y = true;
				this.matrixResults = resData.matrixResults;
			} 
			//I'll remove once all question-type responses code 
			//added to SurveyAnalyticsController 
			else {
				alert("No question type results found in server");
				this.serverData = [];
				this.responses = [];
				this.actualResponses = [];
				this.completed = 0;
				this.incomplete = 0;
				this.questionResults = [];				
			}
		});
	}

	public handleResponses() {
		for (let i = 0, j = 0; i < this.responses.length; i++) {
			let compSurveyByCity = this.responses[i].surveyCompleted;
			let incompSurveyByCity = this.serverData.incompletedResponses.find(item => item.city == this.responses[i].city).surveyIncompleted;
			let rPercent = (compSurveyByCity / incompSurveyByCity) * 100;

			this.responses[i].compSurveyByCity = compSurveyByCity;
			this.responses[i].incompSurveyByCity = incompSurveyByCity;
			this.responses[i].percentage = Math.round(rPercent) + "%";
			this.responses[i].pending = (100 - Math.round(rPercent)) + "%";

			j++;
			if (j >= this.colorClasses.length) j = 0;
		}
		//Question type/options results count
		var total = 0;
		for (let i = 0; i < this.questionResults.length; i++) {
			total += this.questionResults[i].count;
		}
		//Percentage calculation
		for (let i = 0; i < this.questionResults.length; i++) {
			let rPercent = (this.questionResults[i].count / total) * 100;
			this.questionResults[i].percentage = Math.round(rPercent) + "%";
		}
	}
}
