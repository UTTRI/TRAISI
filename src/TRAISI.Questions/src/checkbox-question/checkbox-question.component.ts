import { Component, OnInit } from '@angular/core';
import { ISurveyViewerService, IQuestionConfiguration } from 'traisi-question-sdk';
import { PartialObserver } from '../../node_modules/rxjs';
@Component({
	selector: 'traisi-checkbox-question',
	template: require('./checkbox-question.component.html').toString(),
	styles: [require('./checkbox-question.component.scss').toString()]
})
export class CheckboxQuestionComponent implements OnInit {
	readonly QUESTION_TYPE_NAME: string = 'Checkbox Question';

	typeName: string;
	icon: string;
	constructor(private surveyViewerService: ISurveyViewerService) {
		this.typeName = this.QUESTION_TYPE_NAME;
		this.icon = 'checkbox';

		this.surveyViewerService.configurationData.subscribe(this.loadConfigurationData);
	}

	/**
	 * Loads configuration data once it is available.
	 * @param data
	 */
	loadConfigurationData(data: IQuestionConfiguration[]){

		console.log(data);
	}

	ngOnInit() {
		console.log('init');
	}
}