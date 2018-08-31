import { Component, OnInit } from '@angular/core';
import { SurveyViewer, QuestionConfiguration } from 'traisi-question-sdk';

@Component({
	selector: 'traisi-likert-question',
	template: require('./likert-question.component.html').toString(),
	styles: [require('./likert-question.component.scss').toString()]
})
export class LikertQuestionComponent implements OnInit {
	readonly QUESTION_TYPE_NAME: string = 'Likert Question';

	typeName: string;
	icon: string;
	constructor(private surveyViewerService: SurveyViewer) {
		this.typeName = this.QUESTION_TYPE_NAME;
		this.icon = 'likert';

		this.surveyViewerService.configurationData.subscribe(this.loadConfigurationData);
	}

	/**
	 * Loads configuration data once it is available.
	 * @param data
	 */
	loadConfigurationData(data: QuestionConfiguration[]){

		console.log(data);
	}

	ngOnInit() {
	}
}
