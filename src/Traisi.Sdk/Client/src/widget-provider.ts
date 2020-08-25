import { Type, InjectionToken } from '@angular/core';
import { SurveyQuestion } from './survey-question';

export class WidgetProvider {
	name: string;
	id: string;
	component: Type<SurveyQuestion<any>>;

	public constructor(name: string, id: string, component: Type<SurveyQuestion<any>>) {
		this.name = name;
		this.id = id;
		this.component = component;
	}
}
