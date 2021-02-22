import {
	Component,
	EventEmitter,
	Inject,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	SurveyQuestion,
	ResponseTypes,
	QuestionConfiguration,
	SurveyViewer,
	DateResponseData,
	ResponseValidationState,
	SurveyRespondentService
} from 'traisi-question-sdk';
import {
	BsDatepickerDirective,
	BsDatepickerConfig
} from 'ngx-bootstrap/datepicker';
import { DateQuestionConfiguration } from './date-question.configuration';

import templateString from './date-question.component.html';
import styleString from './date-question.component.scss';

@Component({
	selector: 'traisi-date-question',
	template: ''+{templateString},
	styles: [''+styleString]
})
export class DateQuestionComponent extends SurveyQuestion<ResponseTypes.Date>
	implements OnInit {
	@ViewChild('dateInput', {static: true})
	public dateInput: BsDatepickerDirective;

	public dateData: Date;

	public bsConfig: Partial<BsDatepickerConfig>;

	public configuration: DateQuestionConfiguration;
	/**
	 *
	 * @param _surveyViewerService
	 * @param _surveyResponderService
	 */
	constructor(
		@Inject('SurveyViewerService')
		private _surveyViewerService: SurveyViewer,
		@Inject('SurveyResponderService')
		private _surveyResponderService: SurveyRespondentService
	) {
		super();

		this.configuration = {
			minDate: new Date(),
			maxDate: new Date()
		};
	}

	public ngOnInit(): void {
		this.savedResponse.subscribe(this.onSavedResponseData);

		this.bsConfig = Object.assign(
			{},
			{
				containerClass: 'theme-default',
				dateInputFormat: 'MMMM DD YYYY'
			}
		);

		this.configuration.maxDate = new Date(
			(<string>this.configuration.maxDate).replace(/"/g, '')
		);
		this.configuration.minDate = new Date(
			(<string>this.configuration.minDate).replace(/"/g, '')
		);
	}

	/**
	 * Determines whether value change on
	 * @param value
	 */
	public onValueChange(value: Date): void {
		let data: DateResponseData = {
			value: value
		};

		let valid: boolean = true;

		if (value !== null) {
			this.response.emit(data);
			this.validationState.emit(ResponseValidationState.VALID);
		} else {
			// this.validationState.emit(ResponseValidationState.INVALID);
		}
	}

	/**
	 * Determines whether saved response data on
	 */
	private onSavedResponseData: (
		response: DateResponseData[] 
	) => void = (response: DateResponseData[]) => {
		if (response.length > 0) {
			let dateValue = new Date(response[0].value);

			this.dateData = dateValue;
		}
	};
}
