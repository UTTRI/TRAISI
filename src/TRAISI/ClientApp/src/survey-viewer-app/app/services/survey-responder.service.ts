import { Injectable } from '@angular/core';
import { SurveyResponder, TRAISI, OnSaveResponseStatus } from '../../../../../../TRAISI.SDK/Module/src';
import { SurveyResponderEndpointService } from './survey-responder-endpoint.service';
import { Observable } from 'rxjs';
import { SurveyViewerService } from './survey-viewer.service';

@Injectable({
	providedIn: 'root'
})
export class SurveyResponderService implements SurveyResponder {
	id: number;
	/**
	 *
	 *
	 * @private
	 * @param {*} data
	 * @param {number} surveyId
	 * @param {number} questionId
	 * @returns
	 * @memberof SurveyResponderService
	 */
	private saveResponse(data: any, surveyId: number, questionId: number): Observable<{}> {
		return this._surveyResponseEndpointService.getSaveResponseUrlEndpoint(surveyId, questionId, data);
	}



	/**
	 *
	 *
	 * @param {TRAISI.SurveyQuestion<any>} questionComponent
	 * @param {number} surveyId
	 * @param {number} questionId
	 * @memberof SurveyResponderService
	 */
	public registerQuestion(questionComponent: TRAISI.SurveyQuestion<any>, surveyId: number, questionId: number) {


		questionComponent.response.subscribe(
			(value: TRAISI.ResponseData<any>) => {
				this.handleResponse(questionComponent, value, surveyId, questionId);
			},
			error => {
				console.log('An error occurred subscribing to ' + questionComponent + ' responses');
			}
		);
	}

	/**
	 *
	 *
	 * @private
	 * @param {*} respone
	 * @memberof SurveyResponderService
	 */
	private handleResponse(
		questionComponent: TRAISI.SurveyQuestion<TRAISI.ResponseTypes.String> | OnSaveResponseStatus,
		response: TRAISI.ResponseData<any>,
		surveyId: number,
		questionId: number
	) {


		this.saveResponse(<string>response, surveyId, questionId).subscribe(
			value => {
				if (Object.getPrototypeOf(questionComponent).hasOwnProperty('onResponseSaved')) {
					(<OnSaveResponseStatus>questionComponent).onResponseSaved(value);
				}
			},
			error => {
				console.log(error);
			}
		);
	}

	/**
	 *Creates an instance of SurveyResponderService.
	 * @param {SurveyResponderEndpointService} _surveyResponseEndpointService
	 * @memberof SurveyResponderService
	 */
	constructor(private _surveyResponseEndpointService: SurveyResponderEndpointService) {}
}
