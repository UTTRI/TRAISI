import { Component, OnInit, Inject } from '@angular/core';
import { ResponseData, ResponseValidationState, OptionSelectResponseData } from 'traisi-question-sdk';
import { SurveyQuestion, ResponseTypes, QuestionConfiguration, SurveyViewer, QuestionOption } from 'traisi-question-sdk';

import templateString from './likert-question.component.html';
import styleString from './likert-question.component.scss';
/**
 *
 * @export
 * @class LikertQuestionComponent
 * @extends {SurveyQuestion<ResponseTypes.List>}
 * @implements {OnInit}
 */
@Component({
	selector: 'traisi-likert-question',
	template: '' + templateString,
	styles: ['' + styleString],
})
export class LikertQuestionComponent extends SurveyQuestion<ResponseTypes.OptionSelect> implements OnInit {
	public readonly QUESTION_TYPE_NAME: string = 'Likert Question';

	public selectedOption: any;

	constructor() {
		super();
		this.selectedOption = { id: -1 };
	}

	/**
	 * Angular ngOnInit()
	 */
	public ngOnInit(): void {
		this.savedResponse.subscribe(this.onSavedResponseData);
		this.configuration = {
			options: ['A', 'B', 'C', 'D', 'E'],
		};
	}

	/**
	 * @private
	 * @memberof LikertQuestionComponent
	 */
	private onSavedResponseData: (response: ResponseData<ResponseTypes.String>[] | 'none') => void = (
		response: ResponseData<ResponseTypes.String>[] | 'none'
	) => {
		if (response !== 'none') {
			this.selectedOption = response[0];
			this.validationState.emit(ResponseValidationState.VALID);
		}
	};

	/**
	 *
	 * @param option
	 */
	public onModelChanged(option: OptionSelectResponseData): void {
		option.value = option.code;
		this.response.emit([option]);
	}

	/**
	 * Response saved callback.
	 * @param result
	 */
	public onResponseSaved(): void {
		this.validationState.emit(ResponseValidationState.VALID);
		// this.autoAdvance.emit(500);
	}
}
