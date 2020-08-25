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
} from 'traisi-question-sdk';
import templateString from './checkbox-question.component.html';
import styleString from './checkbox-question.component.scss';
@Component({
	selector: 'traisi-checkbox-question',
	template: '' + templateString,
	styles: ['' + styleString],
})
export class CheckboxQuestionComponent extends SurveyQuestion<ResponseTypes.OptionSelect[]> implements OnInit, OnOptionsLoaded {
	public model: {};
	public options: QuestionOption[];

	/**
	 *
	 * @param surveyViewerService
	 */
	constructor(@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer) {
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
	public modelChanged($event, option): void {
		this.model[option.code] = $event.srcElement.checked;

		let responses: Array<OptionSelectResponseData> = Array<OptionSelectResponseData>();

		for (let key in this.model) {
			if (this.model[key] === true) {
				responses.push({
					value: key,
					name: key,
					code: key,
				});
			}
		}

		this.response.emit(responses);
		this.validationState.emit(ResponseValidationState.VALID);
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
	}
}
