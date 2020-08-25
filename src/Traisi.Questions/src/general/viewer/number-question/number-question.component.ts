import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
	SurveyQuestion,
	ResponseTypes,
	SurveyViewer,
	ResponseData,
	DecimalResponseData,
	ResponseValidationState,
} from 'traisi-question-sdk';
import { NumberQuestionConfiguration } from './number-question.configuration';
import templateString from './number-question.component.html';
import styles from './number-question.component.scss';
import { debounceTime } from 'rxjs/operators';
import { createNumberMask } from 'text-mask-addons';

@Component({
	selector: 'traisi-number-question',
	template: '' + templateString,
	styles: ['' + styles],
})
export class NumberQuestionComponent extends SurveyQuestion<ResponseTypes.Number> implements OnInit {
	public configuration: NumberQuestionConfiguration;

	public model: string;

	private _numberModel: number;

	public numberMask: any;

	@ViewChild('f', { static: true })
	public inputForm: NgForm;

	/**
	 *
	 * @param surveyViewerService
	 */
	constructor() {
		super();
	}

	/**
	 * Models changed
	 */
	public modelChanged(): void { }

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
	 * Inputs blur
	 */
	public inputBlur(): void { }

	/**
	 * Validates input
	 * @returns true if input
	 */
	private validateInput(): boolean {
		if (this.model === undefined || this.model.length === 0) {
			return false;
		}

		if (this._numberModel >= this.configuration.min && this._numberModel <= this.configuration.max) {
			return true;
		}

		return false;
	}

	/**
	 * on init
	 */
	public ngOnInit(): void {
		const format: any = JSON.parse(this.configuration.numberFormat);

		this.configuration.max = parseInt('' + this.configuration['max'], 10);
		this.configuration.min = parseInt('' + this.configuration['min'], 10);
		switch (format.id) {
			case 'Integer':
				this.numberMask = createNumberMask({
					prefix: '',
					suffix: '',
					allowDecimal: false,
				});
				break;
			case 'Currency':
				this.numberMask = createNumberMask({
					prefix: '$ ',
					suffix: '',
					allowDecimal: true,
				});
				break;
			case 'Decimal':
				this.numberMask = createNumberMask({
					prefix: '',
					suffix: '',
					allowDecimal: true,
				});
				break;
		}

		this.savedResponse.subscribe(this.onSavedResponseData);
	}

	/**
	 * Determines whether saved response data on
	 */
	private onSavedResponseData: (response: ResponseData<ResponseTypes.Number>[] | 'none') => void = (
		response: ResponseData<ResponseTypes.Number>[] | 'none'
	) => {
		if (response !== 'none') {
			let decimalResponse = <DecimalResponseData>response[0];
			this.model = '' + decimalResponse.value;
			this._numberModel = Number(this.model.replace(/[^0-9\.]+/g, ''));
			this.validationState.emit(ResponseValidationState.VALID);
		}

		this.inputForm.valueChanges.pipe(debounceTime(1000)).subscribe((value) => {
			if (this.model !== undefined) {
				let number = Number(this.model.replace(/[^0-9\.]+/g, ''));

				if (this._numberModel !== number) {
					this._numberModel = number;
					const validated: boolean = this.validateInput();

					if (validated && this.inputForm.valid) {
						this.response.emit({ value: this._numberModel });
					} else {
						this.validationState.emit(ResponseValidationState.INVALID);
					}
				}
			}
		});
	};
}
