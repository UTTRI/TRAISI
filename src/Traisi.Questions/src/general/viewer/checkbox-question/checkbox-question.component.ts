import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import {
	SurveyQuestion,
	ResponseTypes,
	QuestionConfiguration,
	SurveyViewer,
	OnOptionsLoaded,
	QuestionOption,
	OptionSelectResponseData,
	ResponseValidationState,
	TraisiValues,
	QuestionOptionLabel,
} from 'traisi-question-sdk';
import { CheckboxQuestionConfiguration } from './checkbox-question-configuration.model';
import templateString from './checkbox-question.component.html';
import styleString from './checkbox-question.component.scss';
@Component({
	selector: 'traisi-checkbox-question',
	template: '' + templateString,
	styles: ['' + styleString],
})
export class CheckboxQuestionComponent extends SurveyQuestion<ResponseTypes.OptionSelect[]>
	implements OnInit, OnOptionsLoaded {
	public model: {};
	public options: QuestionOption[];

	public notaOption: QuestionOption;

	/**
	 *
	 * @param surveyViewerService
	 */
	constructor(
		@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer,
		@Inject(TraisiValues.Configuration) public configuration: CheckboxQuestionConfiguration
	) {
		super();

		this.options = [];
		this.model = {};
		this.surveyViewerService.configurationData.subscribe(this.loadConfigurationData);
	}

	/**
	 *
	 * @param $event
	 * @param option
	 */
	public modelChanged($event, option: QuestionOption): void {
		let responses: Array<OptionSelectResponseData> = Array<OptionSelectResponseData>();

		if (option === this.notaOption && this.model[option.code]) {
			this._clearAllChecked();
			this.model[option.code] = $event.srcElement.checked;
		} else if (option !== this.notaOption && this.model[this.notaOption.code]) {
			this.model[this.notaOption.code] = false;
		}

		for (let key in this.model) {
			if (this.model[key] === true) {
				responses.push({
					value: key,
					name: key,
					code: key,
				});
			}
		}

		if (responses.length > 0) {
			this.response.emit(responses);
			this.validationState.emit(ResponseValidationState.VALID);
		} else {
			this.validationState.emit(ResponseValidationState.INVALID);
		}
	}

	/**
	 * Clears the model
	 */
	private _clearAllChecked(): void {
		for (let key in this.model) {
			this.model[key] = false;
		}
	}

	/**
	 * Determines whether load saved response on
	 */
	private onLoadSavedResponse: (responses: OptionSelectResponseData[] | 'none') => void = (
		responses: OptionSelectResponseData[] | 'none'
	) => {
		if (responses !== 'none') {
			responses.forEach((response) => {
				this.model[response.value] = true;
			});

			this.validationState.emit(ResponseValidationState.VALID);
		}
	};

	/**
	 * Loads configuration data once it is available.
	 * @param data
	 */
	public loadConfigurationData(data: QuestionConfiguration[]): void {
		this.data = data;
	}

	/** */
	public ngOnInit(): void {
		this.savedResponse.subscribe(this.onLoadSavedResponse);
	}

	/**
	 *
	 * @param options
	 */
	public onOptionsLoaded(options: QuestionOption[]): void {
		this.options = options;

		options.forEach((option) => {
			if (this.model[option['code']] === undefined) {
				this.model[option['code']] = false;
			}
		});

		this.notaOption = {
			code: 'nota',
			id: this.options.length + 1,
			label: 'None of the above',
			name: 'None of the above',
			order: this.options.length + 1,
		};

		if (this.configuration.isShowNoneOfTheAbove) {
			this.options.push(this.notaOption);
		}
	}
}
