import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SurveyViewer } from 'traisi-question-sdk';
import { GeoLocation } from '../models/geo-location.model';

@Injectable()
export class MapEndpointService {
	private readonly _reverseGeocodeUrl: string = '/api/geoservice/reversegeo';

	private token: string;

	/**
	 * @param  {HttpClient} http
	 */
	constructor(private http: HttpClient, @Inject('SurveyViewerService') private surveyViewerService: SurveyViewer) {
		this.token = surveyViewerService.accessToken;
	}

	/**
	 *
	 * @param latitude
	 * @param longitude
	 */
	public reverseGeocode(latitude: number, longitude: number): Observable<GeoLocation> {
		const endpointUrl = `${this._reverseGeocodeUrl}/${latitude}/${longitude}`;

		return this.http.get<GeoLocation>(endpointUrl, this.getRequestHeaders());
	}

	/**
	 *
	 * @param rType
	 */
	protected getRequestHeaders(
		rType: any = 'json'
	): { headers: HttpHeaders | { [header: string]: string | string[] }; responseType: any } {
		const headers = new HttpHeaders({
			Authorization: 'Bearer ' + this.token,
			'Content-Type': 'application/json',
			Accept: `application/vnd.iman.v1+json, application/json, text/plain, */*`,
			'App-Version': '2.0.0'
		});

		return { headers: headers, responseType: rType };
	}
}
