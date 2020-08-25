
import { ComponentFactory } from '@angular/core';

export interface SurveyQuestionComponent
{
	surveyModule: any;
	componentFactory: ComponentFactory<any>;
	questionType: string;

}
