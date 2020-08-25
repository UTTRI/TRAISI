import { Component, Inject, OnInit, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import {
	SurveyQuestion,
	ResponseTypes,
	SurveyViewer,
	OnOptionsLoaded,
	QuestionOption,
	ResponseData,
	ResponseValidationState,
	OptionSelectResponseData,
} from 'traisi-question-sdk';

import templateString from './radio-question.component.html';
import styleString from './radio-question.component.scss';
@Component({
	selector: 'traisi-radio-question',
	template: '' + templateString,
	styles: ['' + styleString],
})
export class RadioQuestionComponent extends SurveyQuestion<ResponseTypes.OptionSelect> implements OnInit, OnOptionsLoaded, AfterViewInit {
	public options: QuestionOption[];

	public selectedOption: any;

	public customResponseValue: string;

	public customResponseOptions: Set<string>;

	@ViewChildren('input', {})
	public inputElements: QueryList<ElementRef>;

	/**
	 *
	 * @param _surveyViewerService
	 * @param _surveyResponderService
	 */
	constructor(@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewer) {
		super();
		this.options = [];
		this.customResponseOptions = new Set<string>();
	}

	/**
	 *
	 */
	public ngOnInit(): void {
		this.configuration['allowCustomResponse'] = this.configuration['allowCustomResponse'] === 'true' ? true : false;
		this._surveyViewerService.options.subscribe(() => {});
		if (this.configuration['customResponseOptions'] !== undefined) {
			const options = this.configuration['customResponseOptions'].split(',');
			this.customResponseOptions = new Set(options);
		}
	}

	/**
	 * Determines whether saved response data on
	 */
	private onSavedResponseData: (response: ResponseData<ResponseTypes.OptionSelect>[] | 'none') => void = (
		response: ResponseData<ResponseTypes.OptionSelect>[] | 'none'
	) => {
		if (response !== 'none') {
			let optionResponse = <OptionSelectResponseData>response[0];

			this.selectedOption = optionResponse.code;
			if (this.customResponseOptions.has(optionResponse.code)) {
				this.customResponseValue = optionResponse.value;
			}
			this.validationState.emit(ResponseValidationState.VALID);
		}

		this.isLoaded.next(true);
	};

	/**
	 *
	 */
	public ngAfterViewInit(): void {
		this.savedResponse.subscribe(this.onSavedResponseData);
	}

	/**
	 * Determines whether model changed on
	 */
	public onModelChanged(option: OptionSelectResponseData): void {
		if (this.customResponseOptions.has(option.code)) {
			this.onCustomModelChanged();
		} else {
			option.value = option.code;
			this.response.emit([option]);
			// this.validationState.emit(ResponseValidationState.VALID);
		}
	}

	/**
	 *
	 */
	public onCustomModelChanged(): void {
		let response = { code: this.selectedOption, value: this.customResponseValue };

		if (this.customResponseValue && this.customResponseValue.trim().length > 0) {
			this.response.emit([response]);
		} else {
			this.validationState.emit(ResponseValidationState.INVALID);
		}
	}

	/**
	 *
	 *
	 * @param {*} result
	 * @memberof TextQuestionComponent
	 */
	public onResponseSaved(): void {
	}

	/**
	 *
	 * @param options
	 */
	public onOptionsLoaded(options: QuestionOption[]): void {
		this.options = options;
	}
}
