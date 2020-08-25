import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { debounceTime, skip } from 'rxjs/operators';
import {
	OnSaveResponseStatus,
	OnVisibilityChanged,
	ResponseData,
	ResponseTypes,
	ResponseValidationState,
	StringResponseData,
	SurveyQuestion,
	SurveyViewer,
} from 'traisi-question-sdk';
import templateString from './text-question.component.html';
import styleString from './text-question.component.scss';
import { TextQuestionConfiguration } from './text-question.configuration';

@Component({
	selector: 'traisi-text-question',
	template: '' + templateString,
	styles: ['' + styleString],
})
export class TextQuestionComponent extends SurveyQuestion<ResponseTypes.String>
	implements OnInit, OnVisibilityChanged, OnSaveResponseStatus {
	public textInput: string;

	@ViewChild('inputElement', { static: true })
	private textInputElement: HTMLInputElement;

	@ViewChild('f', { static: true })
	public inputForm: NgForm;

	public configuration: TextQuestionConfiguration;

	/**
	 *
	 * @param surveyViewerService
	 */
	constructor(@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer) {
		super();
		this.textInput = null;
	}

	/**
	 *
	 */
	public ngOnInit(): void {
		this.onQuestionShown();

		this.configuration.maxLength = parseInt('' + this.configuration.maxLength, 10);
		this.configuration.multiline = '' + this.configuration.multiline === 'false' ? false : true;
		this.savedResponse.subscribe(this.onSavedResponseData);
	}

	public onQuestionShown(): void {}

	public onQuestionHidden(): void {}

	/**
	 * Determines whether saved response data on
	 */
	private onSavedResponseData: (response: ResponseData<ResponseTypes.String>[] | 'none') => void = (
		response: ResponseData<ResponseTypes.String>[] | 'none'
	) => {
		if (response !== 'none') {
			let stringResponse = <StringResponseData>response[0];
			this.textInput = stringResponse.value;
			if (this.isInputValid(this.textInput)) {
				this.validationState.emit(ResponseValidationState.VALID);
			}
		}

		this.inputForm.valueChanges.pipe(debounceTime(1000), skip(1)).subscribe((value) => {
			if (this.textInput === undefined) {
				return;
			}
			if (!this.isInputValid(value.textInput)) {
				this.validationState.emit(ResponseValidationState.INVALID);
			} else {
				let data: StringResponseData = {
					value: this.textInput,
				};

				this.response.emit([data]);
			}
		});
		this.isLoaded.next(true);
	};

	/**
	 *
	 * @param textInput
	 */
	private isInputValid(textInput: string): boolean {
		if (textInput) {
			return textInput !== null || (textInput.trim().length > 0 && textInput.trim().length <= this.configuration.maxLength);
		} else {
			return false;
		}
	}

	/**
	 *
	 *
	 * @param {*} result
	 * @memberof TextQuestionComponent
	 */
	public onResponseSaved(): void {
		this.validationState.emit(ResponseValidationState.VALID);
	}

	/**
	 * Traisis on loaded
	 */
	public traisiOnLoaded(): void {}
}
