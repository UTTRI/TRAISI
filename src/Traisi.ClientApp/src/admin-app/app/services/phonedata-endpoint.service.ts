import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { Observable } from 'rxjs';
import { EndpointFactory } from '../../../shared/services/endpoint-factory.service';
import { PhoneData } from '../models/phonedata.model';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({ providedIn: 'root'})
export class PhoneDataEndpointService extends EndpointFactory {
    private readonly _smartphonedataUrl: string = '/api/smartphonedata';
    	
	get smartphonedataUrl() {
		return this.configurations.baseUrl + this._smartphonedataUrl;
	}
	
	/**
	 * @param  {HttpClient} http
	 * @param  {ConfigurationService} configurations
	 * @param  {Injector} injector
	 */
	constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
		super(http, configurations, injector);
	}

	public getListPhoneDataEndPoint<T>(page?: number, pageSize?: number): Observable<T> {
		const endpointUrl = page && pageSize ? `${this.smartphonedataUrl}/${page}/${pageSize}` : this.smartphonedataUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListPhoneDataEndPoint(page, pageSize));
			})
		);
	}
		
	/**
	 * Generates the endpoint and URL for retrieving a sample object by id
	 * @param  {any} phoneData
	 * @returns Observable
	 */
	public getPhoneDataEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.smartphonedataUrl}/${id}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getPhoneDataEndpoint(id));
			})
		);
	}
	
}
