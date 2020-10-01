import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
	SurveyQuestion,
	ResponseTypes,
	SurveyViewer,
	ResponseData,
	DecimalResponseData,
	ResponseValidationState,
	TraisiValues,
	NumberResponseData,
} from 'traisi-question-sdk';
import { NumberQuestionConfiguration } from './number-question.configuration';
import templateString from './number-question.component.html';
import styles from './number-question.component.scss';
import { debounceTime } from 'rxjs/operators';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

const numberMask = createNumberMask({
	prefix: '',
	suffix: '',
	allowDecimal: true,
});

@Component({
	selector: 'traisi-number-question',
	template: '' + templateString,
	styles: ['' + styles],
})
export class NumberQuestionComponent extends SurveyQuestion<ResponseTypes.Number> implements OnInit {
	public model: string = '';

	private _numberModel: number;

	public numberMask: any;

	public mask = { mask: numberMask };

	@ViewChild('f', { static: true })
	public inputForm: NgForm;

	/**
	 *
	 * @param surveyViewerService
	 */
	constructor(@Inject(TraisiValues.Configuration) public configuration: NumberQuestionConfiguration) {
		super();
	}

	/**
	 * Models changed
	 */
	public modelChanged($event): void {}

	/**
	 *
	 *
	 * @param {*} result
	 * @memberof TextQuestionComponent
	 */
	public onResponseSaved(): void {
		// this.validationState.emit(ResponseValidationState.VALID);
	}

	/**
	 * Inputs blur
	 */
	public inputBlur(): void {}

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
		const format: any = this.configuration.numberFormat;

		switch (format.id) {
			case 'Integer':
				this.numberMask = {
					mask: createNumberMask({
						prefix: '',
						suffix: '',
						allowDecimal: false,
					}),
				};
				break;
			case 'Currency':
				this.numberMask = {
					mask: this.numberMask = createNumberMask({
						prefix: '$ ',
						suffix: '',
						allowDecimal: true,
					}),
				};
				break;
			case 'Decimal':
				this.numberMask = {
					mask: this.numberMask = createNumberMask({
						prefix: '',
						suffix: '',
						allowDecimal: true,
					}),
				};
				break;
			default:
				this.numberMask = {
					mask: createNumberMask({
						prefix: '',
						suffix: '',
						allowDecimal: false,
					}),
				};
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
			let decimalResponse = <NumberResponseData>response[0];
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
						let data: NumberResponseData = {
							value: this._numberModel,
						};
						this.response.emit([data]);
					} else {
						this.validationState.emit(ResponseValidationState.INVALID);
					}
				}
			}
		});
	};
}
