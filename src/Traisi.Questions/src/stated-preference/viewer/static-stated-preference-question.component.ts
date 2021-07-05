import { Component, OnInit, Inject } from '@angular/core';
import { ResponseData, ResponseValidationState, OptionSelectResponseData } from 'traisi-question-sdk';
import { SurveyQuestion, ResponseTypes, QuestionConfiguration, SurveyViewer, QuestionOption } from 'traisi-question-sdk';

import templateString from './static-stated-preference-question.component.html';
import styleString from './static-stated-preference-question.component.scss';
/**
 *
 * @export
 * @class LikertQuestionComponent
 * @extends {SurveyQuestion<ResponseTypes.List>}
 * @implements {OnInit}
 */
@Component({
	selector: 'traisi-static-sp-question',
	template: '' + templateString,
	styles: ['' + styleString],
})
export class StaticStatedPreferenceQuestionComponent extends SurveyQuestion<ResponseTypes.Json> implements OnInit {
	public readonly QUESTION_TYPE_NAME: string = 'Static Stated Preference Question';


	public error: boolean = false;

	public selectedOption: {
		rowHeaders: [],
		cellData: [[]],
		columnHeaders: []
	}

	constructor() {
		super();
		// this.selectedOption = { id: -1 };
	}

	/**
	 * Angular ngOnInit()
	 */
	public ngOnInit(): void {
		this.savedResponse.subscribe(this.onSavedResponseData);

	}

	/**
	 * @private
	 * @memberof LikertQuestionComponent
	 */
	private onSavedResponseData: (response: ResponseData<ResponseTypes.String>[]) => void = (
		response: ResponseData<ResponseTypes.String>[]
	) => {
		if (response.length > 0) {
			// this.selectedOption = response[0];
			this.validationState.emit(ResponseValidationState.VALID);
		}
	};

	/**
	 *
	 * @param option
	 */
	public onModelChanged(option: OptionSelectResponseData): void {
		//option.value = option.code;
		//this.response.emit([option]);
	}

	/**
	 * Response saved callback.
	 * @param result
	 */
	public onResponseSaved(): void {
		// this.validationState.emit(ResponseValidationState.VALID);
		// this.autoAdvance.emit(500);
	}

	public onOptionsLoaded(options: QuestionOption[]): void {
		if(options.length == 0) {
			this.error = true;
			return;
		}
		let data = JSON.parse(options[0].label);
		this.selectedOption = data[Math.floor(Math.random() * data.length)];
		console.log(this.selectedOption);
	}

}
