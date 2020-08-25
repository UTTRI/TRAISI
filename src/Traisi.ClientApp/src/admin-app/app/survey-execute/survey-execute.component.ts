import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UserGroupService } from '../services/user-group.service';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../services/survey.service';
import { Survey } from '../models/survey.model';

@Component({
	selector: 'app-survey-execute',
	templateUrl: './survey-execute.component.html',
	styleUrls: ['./survey-execute.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SurveyExecuteComponent implements OnInit {

	public surveyId: number;
	public survey: Survey;

	public executionType: string = '';

	constructor(private userGroupService: UserGroupService, private surveyService: SurveyService, private route: ActivatedRoute) {
		this.route.params.subscribe(params => this.surveyId = params['id']);
		this.survey = new Survey();
	}

	ngOnInit() {
		this.survey = this.surveyService.getLastSurvey();
		if (!this.survey || this.survey === null || this.survey.id !== this.surveyId)
		{
			this.survey = new Survey();
			this.surveyService.getSurvey(this.surveyId).subscribe(result =>
				{
					this.survey = result;
				}, error => {});
		}
	}

	public executeTest(): void {
		this.executionType = 'Test';
	}

	public executeLive(): void {
		this.executionType = 'Live';
	}

	public executeSettings(): void {
		this.executionType = 'Settings';
	}

}
