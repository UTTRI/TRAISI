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

	public ngOnInit(): void {
		this.savedResponse.subscribe(this.onSavedResponseData);
	}

	public model = {};

	@ViewChild('matrixForm')
	public form: NgForm;

	public entryWidth: number = 0;
	public rowHeaderWidth: number = 0;

	private onSavedResponseData: (response: ResponseData<ResponseTypes.Json>[] | 'none') => void = (
		response: ResponseData<ResponseTypes.Json>[] | 'none'
	) => {
		if (response !== 'none') {
			console.log('got response ');
			console.log(response);
			let model = JSON.parse(response[0]['value']);
			this.model = model[0];
			this.validationState.emit(ResponseValidationState.VALID);
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
		
		this.calculateDimensions();
	}

	public calculateDimensions(): void {
		this.rowHeaderWidth = 10;
		this.entryWidth = (100 - this.rowHeaderWidth) / this.columnLabels.length;
	}

	/**
	 * @param {*} event
	 * @param {*} id
	 */
	public changed(event, id): void {
		if (this.form.valid) {
			this.response.emit(this.model);
			this.validationState.emit(ResponseValidationState.VALID);
		}
	}

	public traisiOnInit(): void {
		// this.validationState.emit(ResponseValidationState.VALID);
	}
}
