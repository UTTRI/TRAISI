import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs';
import { share, map } from 'rxjs/operators';
import { SurveyViewType } from '../models/survey-view-type.enum';
import { ConfigurationService } from '../../../shared/services/configuration.service';

import { SurveyViewerEndpointFactory } from './survey-viewer-endpoint-factory.service';
import { Params } from '@angular/router';
import { query } from '@angular/animations';

@Injectable()
export class SurveyViewerEndpointService extends SurveyViewerEndpointFactory {
	private readonly _surveyViewQuestionsUrl: string = '/api/SurveyViewer';
	private readonly _surveyViewerUrl: string = '/api/SurveyViewer';

	public get surveyViewQuestionsUrl(): string {
		return this.configurations.baseUrl + '/' + this._surveyViewQuestionsUrl;
	}

	get surveyViewQuestionConfiguration(): string {
		return this.configurations.baseUrl + '/' + this._surveyViewQuestionsUrl;
	}

	get surveyViewerUrl(): string {
		return this.configurations.baseUrl + '/' + this._surveyViewerUrl;
	}

	private get getSurveyViewerWelcomeViewUrl(): string {
		return this.configurations.baseUrl + '' + this._surveyViewerUrl + '/welcome';
	}

	private get getSurveyViewerStartSurveyUrl(): string {
		return this.configurations.baseUrl + '' + this._surveyViewerUrl + '/start';
	}

	private get getSurveyViewerTermsAndConditionsUrl(): string {
		return this.configurations.baseUrl + '' + this._surveyViewerUrl;
	}

	private get getSurveyViewerThankYouUrl(): string {
		return this.configurations.baseUrl + '' + this._surveyViewerUrl;
	}

	private get getSurveyCompleteUrl(): string {
		return this.configurations.baseUrl + this.surveyViewerUrl + '/complete';
	}

	private get getDefaultSurveyViewUrl(): string {
		return this.configurations.baseUrl + '' + this._surveyViewerUrl + '/view';
	}

	private get getSurveyViewerRespondentPageQuestionsUrl(): string {
		return this.configurations.baseUrl + '' + this._surveyViewerUrl + '/viewer';
	}

	private get getSurveyViewPagesUrl(): string {
		return this.configurations.baseUrl + this._surveyViewerUrl + '/surveys';
	}

	private get getSurveyViewQuestionOptionsUrl(): string {
		return this.configurations.baseUrl + this._surveyViewerUrl + '/surveys';
	}

	private get getSurveyIdFromCodeUrl(): string {
		return this.configurations.baseUrl + this._surveyViewerUrl + '/codes';
	}

	private get getSurveyStylesUrl(): string {
		return this.configurations.baseUrl + this._surveyViewerUrl + '/styles';
	}

	/**
	 *
	 * @param surveyId
	 */
	public getSurveyCompleteEndpoint<T>(surveyId: number): Observable<T> {
		let endpointUrl = `${this.getSurveyCompleteUrl}/${surveyId}`;

		let headers = this.getSurveyViewerRequestHeaders();

		return this.http.put<T>(endpointUrl, headers).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyCompleteEndpoint(surveyId));
			})
		);
	}

	/**
	 *
	 * @param surveyId
	 * @param shortcode
	 */
	public getSurveyIdFromCodeEndpoint<T>(code: string): Observable<T> {
		let endpointUrl = `${this.getSurveyIdFromCodeUrl}/${code}`;

		let headers = this.getSurveyViewerRequestHeaders();

		return this.http.get<T>(endpointUrl, headers).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyIdFromCodeEndpoint(code));
			})
		);
	}

	public getSurveyAuthenticationModeEndpoint(code: string): Observable<any> {
		let endpointUrl = `${this.configurations.baseUrl}/api/SurveyAuthentication/authentication-mode/${code}`;
		return this.http.get(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyAuthenticationModeEndpoint(code));
			})
		);
	}

	/**
	 *
	 * @param surveyId
	 * @param pageNumber
	 * @param language
	 */
	// tslint:disable-next-line:no-shadowed-variable
	public getSurveyViewPagesEndpoint<SurveyViewPage>(surveyId: number, viewType?: SurveyViewType): Observable<SurveyViewPage> {
		let endpointUrl = `${this.getSurveyViewPagesUrl}/${surveyId}?viewType=${viewType}`;

		return this.http.get<SurveyViewPage[]>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewPagesEndpoint(surveyId, viewType));
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {number} surveyId
	 * @param {string} groupcode
	 * @returns {Observable<T>}
	 * @memberof SurveyResponderEndpointService
	 */
	public getValidateSurveyGroupcodeUrlEndpoint<T>(surveyId: number, groupcode: string): Observable<any> {
		let endpointUrl = `${this.getSurveyViewPagesUrl}/${surveyId}/groupcodes/${groupcode}/validate`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getValidateSurveyGroupcodeUrlEndpoint(surveyId, groupcode));
			})
		);
	}

	/**
	 *
	 * @param surveyId
	 * @param pageNumber
	 * @param language
	 */
	public getSurveyViewerRespondentPageQuestionsEndpoint<T>(surveyId: number, pageNumber: number, language?: string): Observable<T> {
		let endpointUrl = `${this.getSurveyViewerRespondentPageQuestionsUrl}/${surveyId}/page/${pageNumber}?language=${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewerRespondentPageQuestionsEndpoint(surveyId, pageNumber, language));
			})
		);
	}

	public getSurveyStylesEndpoint<T>(surveyId: number): Observable<T> {
		let endpointUrl = `${this.getSurveyStylesUrl}/${surveyId}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyStylesEndpoint(surveyId));
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {number} surveyId
	 * @param {SurveyViewType} [viewType]
	 * @param {string} [language]
	 * @returns {Observable<T>}
	 * @memberof SurveyViewerEndpointService
	 */
	public getSurveyViewerTermsAndConditionsEndpoint<T>(surveyId: number, viewType?: SurveyViewType, language?: string): Observable<T> {
		let endpointUrl = `${this.getSurveyViewerTermsAndConditionsUrl}/${surveyId}/terms/${viewType}/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewerTermsAndConditionsEndpoint(surveyId, viewType, language));
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {number} surveyId
	 * @param {string} [language]
	 * @returns {Observable<T>}
	 * @memberof SurveyViewerEndpointService
	 */
	public getSurveyViewerScreeningQuestionsEndpoint<T>(surveyId: number, language?: string): Observable<T> {
		let endpointUrl = `${this.getSurveyViewerTermsAndConditionsUrl}/${surveyId}/screening/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewerScreeningQuestionsEndpoint(surveyId, language));
			})
		);
	}

	public getSurveyViewerThankYouEndpoint<T>(surveyId: number, viewType?: SurveyViewType, language?: string): Observable<T> {
		let endpointUrl = `${this.getSurveyViewerThankYouUrl}/${surveyId}/thankyou/${viewType}/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewerThankYouEndpoint(surveyId, viewType, language));
			})
		);
	}

	/**
	 *
	 * @param surveyName
	 */
	public getSurveyViewerWelcomeViewEndpoint<T>(surveyName: string): Observable<T> {
		let endpointUrl = `${this.getSurveyViewerWelcomeViewUrl}/${surveyName}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewerWelcomeViewEndpoint(surveyName));
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {number} surveyId
	 * @param {string} [shortcode=null]
	 * @param {string} [userAgent]
	 * @returns {Observable<T>}
	 * @memberof SurveyViewerEndpointService
	 */
	public getSurveyViewerStartSurveyEndpoint<T>(surveyId: number, shortcode: string = null, queryParams?: Params): Observable<T> {
		let endpointUrl = `${this.getSurveyViewerStartSurveyUrl}/${surveyId}/${shortcode}`;

		return this.http.post<T>(endpointUrl, queryParams === undefined ? '' : queryParams, this.getRequestHeaders()).pipe(
			share(),
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewerStartSurveyEndpoint(surveyId, shortcode, queryParams));
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {number} surveyId
	 * @param {string} [shortcode=null]
	 * @param {string} groupcode
	 * @returns {Observable<T>}
	 * @memberof SurveyViewerEndpointService
	 */
	public getSurveyViewerStartSurveyWithGroupcodeEndpoint<T>(surveyId: number, groupcode: string, queryParams?: Params): Observable<T> {
		let endpointUrl = `${this.getSurveyViewerStartSurveyUrl}/${surveyId}/groupcode/${groupcode}`;
		return this.http.post<T>(endpointUrl, queryParams === undefined ? '' : queryParams, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () =>
					this.getSurveyViewerStartSurveyWithGroupcodeEndpoint(surveyId, groupcode, queryParams)
				);
			})
		);
	}

	/**
	 *
	 * @param surveyId
	 * @param language
	 */
	public getDefaultSurveyViewEndpoint<T>(surveyId: number, language: string = 'en'): Observable<T> {
		let endpointUrl = `${this.getDefaultSurveyViewUrl}/${surveyId}/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getDefaultSurveyViewEndpoint(surveyId, language));
			})
		);
	}

	/**
	 *
	 * @param questionId
	 * @param query
	 */
	public getQuestionOptionsEndpoint<T>(questionId: number, query: string = null): Observable<T> {
		let endpointUrl = `${this.surveyViewQuestionConfiguration}/question-options/${questionId}/query`;
		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getQuestionOptionsEndpoint(questionId, query));
			})
		);
	}

	/**
	 *
	 * @param questionId
	 */
	public getSurveyViewQuestionConfigurationEndpoint<T>(questionId: number): Observable<T> {
		let endpointUrl = `${this.surveyViewQuestionConfiguration}/${questionId}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewQuestionsEndpoint(questionId));
			})
		);
	}

	/**
	 *
	 * @param surveyId
	 * @param questionId
	 * @param language
	 * @param query
	 */
	public getSurveyViewQuestionOptionsEndpoint<SurveyViewQuestionOption>(
		surveyId: number,
		questionId: number,
		language?: string,
		query?: string
	): Observable<SurveyViewQuestionOption[]> {
		let endpointUrl = `${this.getSurveyViewQuestionOptionsUrl}/${surveyId}/questions/${questionId}/options?language=${language}&query=${query}`;

		return this.http.get<SurveyViewQuestionOption>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewQuestionOptionsEndpoint(surveyId, questionId, language, query));
			})
		);
	}

	/**
	 * Returns the endpoint for retrieving survey questions of a particular survey view
	 * @param {number} surveyId
	 * @returns {Observable<T>}
	 */
	public getSurveyViewQuestionsEndpoint<T>(surveyId: number): Observable<T> {
		let endpointUrl = `${this.surveyViewQuestionsUrl}/${surveyId}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewQuestionsEndpoint(surveyId));
			})
		);
	}

	/**
	 * Returns a particular question specified by the passed index of a particular survey view.
	 * @param {number} surveyId
	 * @param {number} questionIndex
	 * @returns {Observable<T>}
	 */
	public getSurveyViewQuestionEndpoint<T>(surveyId: number, questionIndex: number): Observable<T> {
		let endpointUrl = `${this.surveyViewQuestionsUrl}/${surveyId}/${questionIndex}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyViewQuestionEndpoint(surveyId, questionIndex));
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
