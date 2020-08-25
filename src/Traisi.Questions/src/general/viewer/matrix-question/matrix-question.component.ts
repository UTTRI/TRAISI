import { Component, OnInit, ViewChild } from '@angular/core';
import {
	SurveyQuestion,
	ResponseTypes,
	QuestionConfiguration,
	SurveyViewer,
	QuestionOption,
	ResponseValidationState,
	ResponseData,
} from 'traisi-question-sdk';
import templateString from './matrix-question.component.html';
import styleString from './matrix-question.component.scss';
import { NgForm } from '@angular/forms';
@Component({
	selector: 'traisi-matrix-question',
	template: '' + templateString,
	styles: ['' + styleString],
})
export class MatrixQuestionComponent extends SurveyQuestion<ResponseTypes.Json> implements OnInit {
	data: QuestionConfiguration[];

	/**
	 *
	 * @param surveyViewerService
	 */
	constructor() {
		super();
	}

	public rowLabels: string[] = [];
	public columnLabels: string[] = [];

	public ngOnInit(): void {}

	public model = {};

	@ViewChild('matrixForm')
	public form: NgForm;

	private onSavedResponseData: (response: ResponseData<ResponseTypes.Json>[] | 'none') => void = (
		response: ResponseData<ResponseTypes.Json>[] | 'none'
	) => {
		if (response !== 'none') {
			console.log(response);
			let model = JSON.parse(response[0]['value']);
			console.log(model);
			this.model = model[0];
		}
	};

	public onOptionsLoaded(options: QuestionOption[]): void {
		// this.options = options;
		for (let i of options) {
			if (i['name'] === 'Row Options') {
				this.rowLabels.push(i['label']);
			} else {
				this.columnLabels.push(i['label']);
			}
		}
		this.savedResponse.subscribe(this.onSavedResponseData);
	}

	/**
	 * @param {*} event
	 * @param {*} id
	 */
	public changed(event, id): void {
		if (this.form.valid) {
			this.response.emit(this.model);
		}
	}

	public traisiOnInit(): void {
		this.validationState.emit(ResponseValidationState.VALID);
	}
}
