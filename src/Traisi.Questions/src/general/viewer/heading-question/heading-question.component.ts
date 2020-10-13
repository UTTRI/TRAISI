import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SurveyQuestion, ResponseTypes, ResponseValidationState, ResponseData } from 'traisi-question-sdk';
import templateString from './heading-question.component.html';
import styleString from './heading-question.component.scss';
@Component({
	selector: 'traisi-heading-question',
	template: '' + templateString,
	styles: ['' + styleString],
	encapsulation: ViewEncapsulation.None
})
export class HeadingQuestionComponent extends SurveyQuestion<ResponseTypes.None> implements OnInit {



	public constructor() {
		super();
		this.displayClass = 'heading-question';
	}

	public ngOnInit(): void {}

	public traisiOnInit(): void {
		this.validationState.emit(ResponseValidationState.VALID);
	}

	public onResponseSaved(): void {
		this.validationState.emit(ResponseValidationState.VALID);
	}

	public ngAfterViewInit(): void {
		this.savedResponse.subscribe(this.onSavedResponseData);
		this.validationState.emit(ResponseValidationState.VALID);
	}
	private onSavedResponseData: (response: ResponseData<ResponseTypes.OptionSelect>[] | 'none') => void = (
		response: ResponseData<ResponseTypes.OptionSelect>[] | 'none'
	) => {
		this.validationState.emit(ResponseValidationState.VALID);
		this.isLoaded.next(true);
	};
}
