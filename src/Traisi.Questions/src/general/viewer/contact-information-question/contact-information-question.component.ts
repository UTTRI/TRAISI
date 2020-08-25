import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
	ResponseData,
	ResponseValidationState,
	OptionSelectResponseData,
	SurveyRespondent,
	SurveyRespondentService,
} from 'traisi-question-sdk';
import { SurveyQuestion, ResponseTypes, QuestionConfiguration, SurveyViewer, QuestionOption } from 'traisi-question-sdk';

import templateString from './contact-information-question.component.html';
import styleString from './contact-information-question.component.scss';
import { NgForm, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
/**
 *
 * @export
 * @class LikertQuestionComponent
 * @extends {SurveyQuestion<ResponseTypes.List>}
 * @implements {OnInit}
 */
@Component({
	selector: 'traisi-contact-information-question',
	template: '' + templateString,
	styles: ['' + styleString],
})
export class ContactInformationQuestionComponent extends SurveyQuestion<ResponseTypes.None> implements OnInit {

	@ViewChild('contactForm', { static: true })
	public contactForm: NgForm;

	@ViewChild('emailInput', { static: false })
	public emailInput: FormControl;

	public contactRespondent: SurveyRespondent = {
		email: '',
		id: 0,
		phoneNumber: '',
		name: '',
		relationship: '',
	};

	/**
	 *
	 * @param _respondentService
	 */
	public constructor(@Inject('SurveyRespondentService') private _respondentService: SurveyRespondentService) {
		super();
	}

	public traisiOnLoaded(): void {
		this.isLoaded.next(true);
	}

	public ngOnInit(): void {
		this.contactRespondent = Object.assign({}, this._respondentService['_primaryRespondent']);
		this.contactForm.valueChanges.pipe(debounceTime(1000)).subscribe((v) => {
			if (this.contactForm.status === 'VALID') {
				this._respondentService.updateSurveyGroupMember(this.contactRespondent).subscribe(
					(value) => {
						this.validationState.emit(ResponseValidationState.VALID);
					},
					(error) => {
						console.error(error);
					}
				);
			} else {
				this.validationState.emit(ResponseValidationState.INVALID);
			}
		});
	}

	public onSubmit() { }
}
