import { Component, OnInit, Inject } from '@angular/core';
import { throws } from 'assert';
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

	public selectedIndex: number = -1;

	public optionIndex: number = -1;

	public options;

	private startTime: Date;

	private elapsedTime: number;

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

	public onResponseChanged($event, index: number): void {
		this.selectedIndex = index;
		let endTime = new Date();
		let elapsedTime = endTime.getTime() - this.startTime.getTime();
		this.response.emit([{ index: this.selectedIndex, optionIndex: this.optionIndex, selectionTime: this.elapsedTime ?? elapsedTime }]);
	}

	public onModelChanged($event): void {
		this.onResponseChanged($event, $event);
	}

	/**
	 * @private
	 * @memberof LikertQuestionComponent
	 */
	private onSavedResponseData: (response: ResponseData<ResponseTypes.Json>[]) => void = (
		response: ResponseData<ResponseTypes.Json>[]
	) => {

		this.questionOptions.subscribe(options => {

			let data = JSON.parse(options[0].label);

			if (response.length > 0) {
				// this.selectedOption = response[0];
				this.validationState.emit(ResponseValidationState.VALID);
				let responseData = JSON.parse(response[0]['value'])[0];
				this.selectedOption = data[responseData.optionIndex];
				this.optionIndex = responseData.optionIndex;
				this.selectedIndex = responseData.index;
				this.elapsedTime = responseData.selectionTime;
			}
			else {
				if (options.length == 0) {
					this.error = true;
					return;
				}
				let data = JSON.parse(options[0].label);
				let optionIndex = Math.floor(Math.random() * data.length);
				this.selectedOption = data[optionIndex];
				this.optionIndex = optionIndex;
				this.startTime = new Date();
			}
		});

	};

	/**
	 * Response saved callback.
	 * @param result
	 */
	public onResponseSaved(): void {
		// this.validationState.emit(ResponseValidationState.VALID);
		// this.autoAdvance.emit(500);
	}

	public onOptionsLoaded(options: QuestionOption[]): void {
		this.options = options;
	}

}
