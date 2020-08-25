import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { Observable } from 'rxjs';
import { EndpointFactory } from '../../../shared/services/endpoint-factory.service';
import { Survey } from '../models/survey.model';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({ providedIn: 'root'})
export class SurveyEndpointService extends EndpointFactory {
	private readonly _surveysUrl: string = '/api/survey';
	private readonly _groupSurveysUrl: string = '/api/survey/group';
	private readonly _sharedSurveysUrl: string = '/api/survey/shared';

	get surveysUrl() {
		return this.configurations.baseUrl + this._surveysUrl;
	}
	get groupSurveysUrl() {
		return this.configurations.baseUrl + this._groupSurveysUrl;
	}
	get sharedSurveysUrl() {
		return this.configurations.baseUrl + this._sharedSurveysUrl;
	}

	/**
	 * @param  {HttpClient} http
	 * @param  {ConfigurationService} configurations
	 * @param  {Injector} injector
	 */
	constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
		super(http, configurations, injector);
	}

	public getListSurveysEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
		const endpointUrl = page && pageSize ? `${this.surveysUrl}/${page}/${pageSize}` : this.surveysUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListSurveysEndpoint(page, pageSize));
			})
		);
	}

	public getListGroupSurveysEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.groupSurveysUrl}/${id}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListSurveysEndpoint(id));
			})
		);
	}

	public getListSharedSurveysEndpoint<T>(): Observable<T> {
		const endpointUrl = this.sharedSurveysUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListSurveysEndpoint());
			})
		);
	}

	/**
	 * @param  {Survey} survey
	 * @returns Observable
	 */
	public getCreateSurveyEndpoint<T>(survey: Survey): Observable<T> {
		const endpointUrl = this.surveysUrl;

		return this.http.post<T>(endpointUrl, JSON.stringify(survey), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getCreateSurveyEndpoint(survey));
			})
		);
	}

	/**
	 * @param  {Survey} survey
	 * @returns Observable
	 */
	public getEditSurveyEndpoint<T>(survey: Survey): Observable<T> {
		const endpointUrl = this.surveysUrl;

		return this.http.put<T>(endpointUrl, JSON.stringify(survey), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getEditSurveyEndpoint(survey));
			})
		);
	}

	/**
	 * @param  {number} id
	 * @returns Observable
	 */
	public getDeleteSurveyEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.surveysUrl}/${id}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getDeleteSurveyEndpoint(id));
			})
		);
	}

	/**
	 * Generates the endpoint and URL for retrieving a survey object by id
	 * @param  {any} survey
	 * @returns Observable
	 */
	public getSurveyEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.surveysUrl}/${id}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyEndpoint(id));
			})
		);
	}

	public getExportSurveyEndpoint<T>(surveyId: number): Observable<T> {
		const endpointUrl = `${this.surveysUrl}/${surveyId}/Export`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders('text')).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getExportSurveyEndpoint(surveyId));
			})
		);
	}
}
