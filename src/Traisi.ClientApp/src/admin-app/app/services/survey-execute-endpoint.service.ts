import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { Observable } from 'rxjs';
import { EndpointFactory } from '../../../shared/services/endpoint-factory.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { CodeGenerator } from '../models/code-generator.model';

@Injectable({ providedIn: 'root' })
export class SurveyExecuteEndpointService extends EndpointFactory {
	private readonly _surveyExecuteUrl: string = '/api/surveyexecution';
	private readonly _surveyExecuteGroupCodeUrl: string = '/api/surveyexecution/groupcode';

	get surveyExecuteUrl() {
		return this.configurations.baseUrl + this._surveyExecuteUrl;
	}
	get groupExecuteGroupCodeUrl() {
		return this.configurations.baseUrl + this._surveyExecuteGroupCodeUrl;
	}

	/**
	 * @param  {HttpClient} http
	 * @param  {ConfigurationService} configurations
	 * @param  {Injector} injector
	 */
	constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
		super(http, configurations, injector);
	}

	public getSurveyShortCodesEndpoint<T>(id: number, mode: string, page?: number, pageSize?: number): Observable<T> {
		const endpointUrl =
			page && pageSize
				? `${this.surveyExecuteUrl}/${id}/${mode}/${page - 1}/${pageSize}`
				: `${this.surveyExecuteUrl}/${id}/${mode}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyShortCodesEndpoint(id, mode, page, pageSize));
			})
		);
	}

	public getCountOfSurveyShortCodesEndpoint<T>(id: number, mode: string): Observable<T> {
		const endpointUrl = `${this.surveyExecuteUrl}/${id}/${mode}/count`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getCountOfSurveyShortCodesEndpoint(id, mode));
			})
		);
	}

	public getSurveyGroupCodesEndpoint<T>(id: number, mode: string, page?: number, pageSize?: number): Observable<T> {
		const endpointUrl =
			page && pageSize
				? `${this.surveyExecuteUrl}/${id}/groupcode/${mode}/${page - 1}/${pageSize}`
				: `${this.surveyExecuteUrl}/${id}/groupcode/${mode}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSurveyGroupCodesEndpoint(id, mode, page, pageSize));
			})
		);
	}

	public getCountOfSurveyGroupCodesEndpoint<T>(id: number, mode: string): Observable<T> {
		const endpointUrl = `${this.surveyExecuteUrl}/${id}/groupcode/${mode}/count`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getCountOfSurveyShortCodesEndpoint(id, mode));
			})
		);
	}

	public getCreateSurveyShortCodesEndpoint<T>(codeGenParams: CodeGenerator): Observable<T> {
		const endpointUrl = this.surveyExecuteUrl;

		return this.http.post<T>(endpointUrl, JSON.stringify(codeGenParams), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getCreateSurveyShortCodesEndpoint(codeGenParams));
			})
		);
	}

	/**
	 * @param  {Survey} survey
	 * @returns Observable
	 */
	public getCreateSurveyGroupCodesEndpoint<T>(codeGenParams: CodeGenerator): Observable<T> {
		const endpointUrl = `${this.surveyExecuteUrl}/groupcode`;

		return this.http.post<T>(endpointUrl, JSON.stringify(codeGenParams), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getCreateSurveyGroupCodesEndpoint(codeGenParams));
			})
		);
	}

	public getDownloadSurveyShortCodesEndpoint<T>(id: number, mode: string): Observable<T> {
		const endpointUrl = `${this.surveyExecuteUrl}/${id}/${mode}/download`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders('text')).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getDownloadSurveyShortCodesEndpoint(id, mode));
			})
		);
	}

	public getDownloadSurveyGroupCodesEndpoint<T>(id: number, mode: string): Observable<T> {
		const endpointUrl = `${this.surveyExecuteUrl}/${id}/groupcode/${mode}/download`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders('text')).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getDownloadSurveyGroupCodesEndpoint(id, mode));
			})
		);
	}
}
