import { QuestionLoaderEndpointService } from './question-loader-endpoint.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SurveyViewQuestion } from 'traisi-question-sdk';

@Injectable({
	providedIn: 'platform',
})
export class QuestionConfigurationService {
	private _configurations: { [type: string]: any } = {};

	constructor() {}

	public setQuestionServerConfiguration(question: SurveyViewQuestion, configuration: any): void {
		this._configurations[question.questionType] = configuration;
	}

	public setQuestionServerConfiguratioByType(questionType: string, configuration: any): void {
		this._configurations[questionType] = configuration;
	}

	public getQuestionServerConfiguration(question: string): any {
		return this._configurations[question];
	}

	public listConfigurations(): { question: string; property: string[], value: string [] }[] {
		let result = [];
		for (let k of Object.keys(this._configurations)) {
			for (let p of Object.keys(this._configurations[k])) {
				result.push({
					question: k,
					property: p,
					value: this._configurations[k][p]
				});
			}
		}
		return result;
	}
}
