import { Component, OnInit, OnDestroy, Inject, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import {
	SurveyQuestion,
	ResponseTypes,
	SurveyResponder,
	QuestionConfiguration,
	SurveyViewer,
	OnSurveyQuestionInit,
	OnVisibilityChanged,
	OnSaveResponseStatus,
	OnOptionsLoaded,
	QuestionOption,
	ResponseData,
	StringResponseData,
	ResponseValidationState,
	CustomBuilderOnInit,
	CustomBuilderOnHidden,
	CustomBuilderOnShown
} from 'traisi-question-sdk';

/**
 * Base question component definition for the question type "Stated Preference"
 *
 * @export
 * @class StatedPreferenceQuestionComponent
 * @extends {SurveyQuestion<ResponseTypes.String>}
 * @implements {OnInit}
 * @implements {OnVisibilityChanged}
 * @implements {OnSaveResponseStatus}
 */
@Component({
	selector: 'traisi-stated-preference-builder',
	template: './stated-preference-builder.component.html',
	styles: ['./stated-preference-builder.component.scss']
})
export class StatedPreferenceBuilderComponent implements CustomBuilderOnInit, CustomBuilderOnHidden, CustomBuilderOnShown {
	public constructor() {}

	/**
	 *
	 *
	 * @memberof StatedPreferenceBuilderComponent
	 */
	public customBuilderInitialized(): void {
		console.log('custom builder init called from stated preference builder component.');
	}

	public customBuilderHidden(): void {
		console.log('SP hidden was called');
	}
	public customBuilderShown(): void {
		console.log('SP shown was called');
	}
}
