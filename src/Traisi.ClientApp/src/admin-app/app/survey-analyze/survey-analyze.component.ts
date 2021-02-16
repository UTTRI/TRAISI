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

	public questions : any = [];

	public selectedRegion:string = "";
	public selectedQuestion:string = "1";
	
	public ngOnInit(): void 
	{
		//Load Question names				
		//api analytics controller url
		let url = "/api/SurveyAnalytics/" + this.surveyId;
		this.httpObj.get(url).subscribe((resData: any[]) => {
			this.questions = resData;
		});
		this.filterByQuestion();
	}

	public filterByCity()
	{
		this.responses = this.actualResponses.filter(item  => item.city == this.selectedRegion);
		this.handleResponses();
	}

	public filterByQuestion()
	{
		//api analytics controller url
		let url = "/api/SurveyAnalytics/" + this.surveyId + "/" + this.selectedQuestion;
		this.httpObj.get(url).subscribe((resData: any) => {
			this.serverData  = resData;
			this.responses = resData.completedResponses;
			this.actualResponses = resData.completedResponses;
			this.completed  = resData.totalComplete;
			this.incomplete  = resData.totalIncomplete;
			this.handleResponses();			
		});
	}

	public handleResponses()
	{
		for (let i = 0, j = 0; i < this.responses.length; i++) {
			let compSurveyByCity = this.responses[i].surveyCompleted;
			let incompSurveyByCity = this.serverData.incompletedResponses.find(item => item.city == this.responses[i].city).surveyIncompleted;
			let rPercent = (compSurveyByCity / incompSurveyByCity) * 100;

			this.responses[i].compSurveyByCity = compSurveyByCity;
			this.responses[i].incompSurveyByCity = incompSurveyByCity;
			this.responses[i].percentage = Math.round(rPercent) + "%";
			this.responses[i].pending =  (100-Math.round(rPercent)) + "%";

			j++;
			if (j >= this.colorClasses.length) j = 0;
		}
	}
}
