import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const BUILDER_SERVICE: string = 'BUILDER_SERVICE';
export const QUESTION_ID: string = 'QUESTION_ID';
export const SURVEY_ID: string = 'SURVEY_ID';

export const SURVEY_BUILDER = new InjectionToken("builder.service");

export abstract class TraisiSurveyBuilder {
	public abstract setQuestionPartOption(surveyId: number, questionPartId: number, optionInfo: QuestionOptionValue): Observable<any>;
	public abstract getQuestionPartOptions(surveyId: number, questionPartId: number, language: string): Observable<any>;
}

export interface QuestionOptionLabel {
	id?: number;
	value: string;
	language: string;
	questionOptionId?: number;
}

export interface QuestionOptionValue {
	id?: number;
	code: string; 
	name: string;
	optionLabel: QuestionOptionLabel;
	order: number;
}
