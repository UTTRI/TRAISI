import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-survey-analyze',
  templateUrl: './survey-analyze.component.html',
  styleUrls: ['./survey-analyze.component.scss']
})
export class SurveyAnalyzeComponent implements OnInit {

  constructor() { }

  //Sample Distribution Analysis
	public daysInField: number = 10;
	public avgResponsePerDay = 40;
	public completed = 245;

	public responses: any = [
		{ region: "Toronto", resCount: 201, totalSurveys: 430, percentage: 0, colorClass: "progress-bar bg-success" },
		{ region: "Durham", resCount: 6, totalSurveys: 100, percentage: 0, colorClass: "progress-bar bg-info" },
		{ region: "Halton", resCount: 3, totalSurveys: 90, percentage: 0, colorClass: "progress-bar bg-warning" },
		{ region: "Peel", resCount: 13, totalSurveys: 220, percentage: 0, colorClass: "progress-bar bg-danger" },
		{ region: "York", resCount: 20, totalSurveys: 170, percentage: 0, colorClass: "progress-bar bg-primary" },
		{ region: "Hamilton", resCount: 10, totalSurveys: 100, percentage: 0, colorClass: "progress-bar bg-warning" },
		{ region: "Mississauga", resCount: 25, totalSurveys: 150, percentage: 0, colorClass: "progress-bar bg-info" },
		{ region: "Brampton", resCount: 55, totalSurveys: 200, percentage: 0, colorClass: "progress-bar bg-danger" }
	];


  public ngOnInit(): void {
    //Sample distribution data calculation
		for (let i = 0; i < this.responses.length; i++) {
			let rC = this.responses[i].resCount;
			let tS = this.responses[i].totalSurveys;
			let rPercent = (rC / tS) * 100;
			this.responses[i].percentage = Math.round(rPercent) + "%";
		}
		//console.log(this.responses);
  }
}
