import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { Observable } from 'rxjs';
import { EndpointFactory } from '../../../shared/services/endpoint-factory.service';
import { Sample } from '../models/sample.model';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({ providedIn: 'root'})
export class SampleEndpointService extends EndpointFactory {
    private readonly _samplesUrl: string = '/api/sample';
    private readonly _activateSamplesUrl: string = '/api/sample/activate';
	private readonly _distributionSamplesUrl: string = '/api/sample/distribution';
	private readonly _queueSamplesUrl: string = '/api/sample/queue';

	get samplesUrl() {
		return this.configurations.baseUrl + this._samplesUrl;
	}
	get activateSamplesUrl() {
		return this.configurations.baseUrl + this._activateSamplesUrl;
	}
	get distributionSamplesUrl() {
		return this.configurations.baseUrl + this._distributionSamplesUrl;
    }
    get queueSamplesUrl() {
		return this.configurations.baseUrl + this._queueSamplesUrl;
	}

	/**
	 * @param  {HttpClient} http
	 * @param  {ConfigurationService} configurations
	 * @param  {Injector} injector
	 */
	constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
		super(http, configurations, injector);
	}

	public getListSamplesEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
		const endpointUrl = page && pageSize ? `${this.samplesUrl}/${page}/${pageSize}` : this.samplesUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListSamplesEndpoint(page, pageSize));
			})
		);
	}

	public getListDistributionSamplesEndpoint<T>(): Observable<T> {
		const endpointUrl = this.distributionSamplesUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListDistributionSamplesEndpoint());
			})
		);
	}

	public getListQueueSamplesEndpoint<T>(): Observable<T> {
		const endpointUrl = this.queueSamplesUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListQueueSamplesEndpoint());
			})
		);
	}

	/**
	 * @param  {Sample} sample
	 * @returns Observable
	 */
	public getCreateSampleEndpoint<T>(sample: Sample): Observable<T> {
		const endpointUrl = this.samplesUrl;

		return this.http.post<T>(endpointUrl, JSON.stringify(sample), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getCreateSampleEndpoint(sample));
			})
		);
	}

	/**
	 * @param  {Sample} sample
	 * @returns Observable
	 */
	public getEditSampleEndpoint<T>(sample: Sample): Observable<T> {
		const endpointUrl = this.samplesUrl;

		return this.http.put<T>(endpointUrl, JSON.stringify(sample), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getEditSampleEndpoint(sample));
			})
		);
	}

	/**
	 * @param  {number} id
	 * @returns Observable
	 */
	public getDeleteSampleEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.samplesUrl}/${id}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getDeleteSampleEndpoint(id));
			})
		);
	}	

	/**
	 * Generates the endpoint and URL for retrieving a sample object by id
	 * @param  {any} sample
	 * @returns Observable
	 */
	public getSampleEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.samplesUrl}/${id}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getSampleEndpoint(id));
			})
		);
	}
	
}
