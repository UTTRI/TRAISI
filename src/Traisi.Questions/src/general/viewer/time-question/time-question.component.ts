import { Component, Inject, OnInit } from '@angular/core';
import {
	QuestionConfiguration,
	ResponseTypes,
	SurveyQuestion,
	SurveyViewer,
	TimeResponseData,
	ResponseValidationState,
	SurveyRespondentService,
	TraisiValues
} from 'traisi-question-sdk';

import { Time } from '@angular/common';

import templateString from './time-question.component.html';
import styleString from './time-question.component.scss';

@Component({
	selector: 'traisi-time-question',
	template: ''+templateString,
	styles: [''+styleString]
})
export class TimeQuestionComponent extends SurveyQuestion<ResponseTypes.Time> implements OnInit {
	public readonly QUESTION_TYPE_NAME: string = 'Time Question';

	public typeName: string;
	public icon: string;

	public hours: number;

	public minutes: number;

	public am: boolean;

	public inputTime: Date;

	constructor(
		@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer,
		@Inject(TraisiValues.SurveyRespondentService) private _respondentService: SurveyRespondentService
	) {
		super();
		this.typeName = this.QUESTION_TYPE_NAME;
		this.icon = 'time';
		this.inputTime = new Date();
		this.inputTime.setHours(0);
		this.inputTime.setMinutes(0);
		this.inputTime.setSeconds(0);
		this.surveyViewerService.configurationData.subscribe(this.loadConfigurationData);
	}

	/**
	 * Loads configuration data once it is available.
	 * @param data
	 */
	public loadConfigurationData(data: QuestionConfiguration[]) {
	}

	public ngOnInit(): void {
		this.hours = 12;
		this.minutes = 0;
		this.am = true;

		this.savedResponse.subscribe(this.onSavedResponseData);
	}

	/**
	 *
	 * @param timeValue
	 */
	public ngModelChange(timeValue): void {
		let data = {
			value: timeValue
		};
		if (timeValue !== null) {
			this.response.emit(data);
			this.validationState.emit(ResponseValidationState.VALID);
		} else {
			// this.validationState.emit(ResponseValidationState.INVALID);
		}
	}

	private onSavedResponseData: (response: TimeResponseData[] | 'none') => void = (response: TimeResponseData[] | 'none') => {
		if (response !== 'none') {
			let timeValue = new Date(response[0].value);
			this.inputTime = timeValue;
		}
	};
}
