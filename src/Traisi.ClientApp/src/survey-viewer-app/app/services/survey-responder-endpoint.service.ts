import { EndpointFactory } from '../../../shared/services/endpoint-factory.service';
import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs';
import { SurveyQuestion, SurveyRespondent, ResponseTypes } from 'traisi-question-sdk';
import { SurveyViewerEndpointFactory } from './survey-viewer-endpoint-factory.service';

/**
 *
 *
 * @export
 * @class SurveyResponderEndpointService
 * @extends {EndpointFactory}
 */
@Injectable({
	providedIn: 'root'
})
export class SurveyResponderEndpointService extends SurveyViewerEndpointFactory {
	private readonly _surveyResponseUrl: string = '/api/Responder';

	get surveyResponseUrl(): string {
		return this.configurations.baseUrl + this._surveyResponseUrl;
	}

	get responderSaveResponseUrl(): string {
		return this.configurations.baseUrl + this._surveyResponseUrl;
	}

	get responderSavedResponseUrl(): string {
		return this.configurations.baseUrl + this._surveyResponseUrl;
	}

	get responderAddSurveyGroupmemberUrl(): string {
		return this.configurations.baseUrl + this._surveyResponseUrl;
	}

	get endpointUrlPrefix(): string {
		return this.configurations.baseUrl + this._surveyResponseUrl;
	}

	/**
	 *
	 *
	 * @template T
	 * @param {number} surveyId
	 * @param {number} questionId
	 * @param {number} respondentId
	 * @param {*} responseData
	 * @param {number} [repeat]
	 * @returns {Observable<T>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getSaveResponseUrlEndpoint<T>(
		surveyId: number,
		questionId: number,
		respondentId: number,
		responseData: any,
		repeat?: number
	): Observable<T> {
		let endpointUrl = `${
			this.responderSaveResponseUrl
			}/surveys/${surveyId}/questions/${questionId}/respondents/${respondentId}/${repeat}`;

		let headers = this.getRequestHeaders(respondentId);
		headers.headers = (<HttpHeaders>headers.headers).set('Respondent-Id', respondentId.toString());
		return this.http.post<T>(endpointUrl, JSON.stringify(responseData), headers).pipe(
			catchError(error => {
				return this.handleError(error, () =>
					this.getSaveResponseUrlEndpoint(surveyId, questionId, respondentId, responseData, repeat)
				);
			})
		);
	}

	/**
	 * Returns the endpoint for retrieving survey questions of a particular survey view
	 * @param {number} surveyId
	 * @returns {Observable<T>}
	 */
	public getSavedResponseUrlEndpoint<T>(
		surveyId: number,
		questionId: number,
		respondentId: number,
		repeat: number
	): Observable<T> {
		let endpointUrl = `${
			this.responderSaveResponseUrl
			}/surveys/${surveyId}/questions/${questionId}/respondents/${respondentId}/${repeat}`;
		let headers = this.getRequestHeaders(respondentId);
		headers.headers = (<HttpHeaders>headers.headers).set('Respondent-Id', respondentId.toString());
		return this.http.get<T>(endpointUrl, headers).pipe(
			catchError(error => {
				return this.handleError(error, () =>
					this.getSavedResponseUrlEndpoint(surveyId, questionId, respondentId, repeat)
				);
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {number[]} questionIds
	 * @param {number} respondentId
	 * @returns {Observable<T>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getListResponsesForQuestionsUrlEndpoint<T>(questionIds: number[], respondentId: number): Observable<T> {
		const endpointUrl = `${this.responderSaveResponseUrl}/questions/respondents/${respondentId}/responses`;

		const headers = this.getRequestHeaders(respondentId);

		headers['params'] = {
			questionIds: questionIds
		};
		return this.http.get<T>(endpointUrl, headers).pipe(
			catchError(error => {
				return this.handleError(error, () =>
					this.getListResponsesForQuestionsUrlEndpoint(questionIds, respondentId)
				);
			})
		);
	}

	/**
	 * @template T
	 * @param {string[]} questionNames
	 * @param {number} respondentId
	 * @returns {Observable<T>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getListResponsesForQuestionsByNameUrlEndpoint<T>(questionNames: string[], respondentId: number): Observable<T> {
		const endpointUrl = `${this.responderSaveResponseUrl}/questions/names/respondents/${respondentId}/responses`;

		const headers = this.getRequestHeaders(respondentId);

		headers['params'] = {
			questionNames: questionNames
		};
		return this.http.get<T>(endpointUrl, headers).pipe(
			catchError(error => {
				return this.handleError(error, () =>
					this.getListResponsesForQuestionsByNameUrlEndpoint(questionNames, respondentId)
				);
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {SurveyRespondent} respondent
	 * @returns {Observable<T>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getAddSurveyGroupMemberUrlEndpoint<T>(respondent: SurveyRespondent): Observable<T> {
		let endpointUrl = `${this.responderAddSurveyGroupmemberUrl}/respondents/groups`;

		return this.http.post<T>(endpointUrl, JSON.stringify(respondent), this.getRequestHeaders(respondent.id)).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getAddSurveyGroupMemberUrlEndpoint(respondent));
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {SurveyRespondent} respondent
	 * @returns {Observable<T>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getUpdateSurveyGroupMemberUrlEndpoint<T>(respondent: SurveyRespondent): Observable<T> {
		let endpointUrl = `${this.responderAddSurveyGroupmemberUrl}/respondents/groups`;

		return this.http.put<T>(endpointUrl, JSON.stringify(respondent), this.getRequestHeaders(respondent.id)).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getAddSurveyGroupMemberUrlEndpoint(respondent));
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @returns {Observable<T>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getSurveyGroupMembersUrlEndpoint<T>(respondent: SurveyRespondent): Observable<T> {
		let endpointUrl = `${this.responderAddSurveyGroupmemberUrl}/groups/respondents/${respondent.id}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyGroupMembersUrlEndpoint(respondent));
			})
		);
	}

	/**
 *
 *
 * @template T
 * @returns {Observable<T>}
 * @memberof SurveyResponderEndpointService
 */
	public getSurveyPrimaryRespondentUrlEndpoint<T>(surveyId: number): Observable<T> {
		let endpointUrl = `${this.endpointUrlPrefix}/surveys/${surveyId}/respondents/primary`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyPrimaryRespondentUrlEndpoint(surveyId));
			})
		);
	}



	/**
	 *
	 *
	 * @template T
	 * @param {SurveyRespondent} respondent
	 * @returns {Observable<T>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getRemoveSurveyGroupMemberUrlEndpoint<T>(respondent: SurveyRespondent): Observable<T> {
		let endpointUrl = `${this.responderAddSurveyGroupmemberUrl}/groups/respondents/${respondent.id}/groups`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders(respondent.id)).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getRemoveSurveyGroupMemberUrlEndpoint(respondent));
			})
		);
	}

	/**
	 * Gets delete all responses endpoint
	 * @template T
	 * @param surveyId
	 * @param respondent
	 * @returns delete all responses endpoint
	 */
	public getDeleteAllResponsesEndpoint<T>(surveyId: number, respondent: SurveyRespondent): Observable<T> {
		let endpointUrl = `${this.surveyResponseUrl}/surveys/${surveyId}/respondents/${respondent.id}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders(respondent.id)).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getDeleteAllResponsesEndpoint(surveyId, respondent));
			})
		);
	}

	/**
	 *
	 *
	 * @param {number} surveyId
	 * @param {ResponseTypes} type
	 * @returns {Observable<any>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getListSurveyResponsesOfType(surveyId: number, type: ResponseTypes): Observable<any> {
		// surveys/{surveyId}/responses/types/{type}
		let endpointUrl = `${this.surveyResponseUrl}/surveys/${surveyId}/responses/types/${type}`;

		return this.http.get(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListSurveyResponsesOfType(surveyId, type));
			})
		);
	}

	/**
	 * Service constructor
	 * @param http
	 * @param configurations
	 * @param injector
	 */
	constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
		super(http, configurations, injector);
	}
}
