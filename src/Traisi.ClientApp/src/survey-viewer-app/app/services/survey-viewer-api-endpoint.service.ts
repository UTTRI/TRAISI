import { Inject, Injectable } from '@angular/core';
import { SurveyViewerEndpointFactory } from './survey-viewer-endpoint-factory.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Params } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Injectable(
	{
		providedIn: 'root'
	}
)
export class SurveyViewerApiEndpointService extends SurveyViewerEndpointFactory {

	private readonly _geoServiceUrl: string = '/api/GeoService';

	/**
	 * Retrieves the distance matrix from the passed origins and destinations.
	 *
	 * @param {Array<string>} origins
	 * @param {Array<string>} destinations
	 * @returns {Observable<any>}
	 * @memberof SurveyViewerApiEndpointService
	 */
	public getDistanceMatrixEndpoint(origins: Array<string>, destinations: Array<string>): Observable<any> {


		let params: HttpParams = new HttpParams();
		for (let origin of origins) {
			params = params.append('origins', origin);
		}

		for (let destination of destinations) {
			params = params.append('destinations', destination);
		}

		let endpointUrl = `${this._geoServiceUrl}/distancematrix?${params.toString()}`;

		console.log(endpointUrl);
		// let headers = this.getRequestHeaders(respondentId);
		// headers.headers = (<HttpHeaders>headers.headers).set('Respondent-Id', respondentId.toString());
		return this.http.get(endpointUrl).pipe(
			catchError(error => {
				return this.handleError(error, () =>
					this.getDistanceMatrixEndpoint(origins, destinations)
				);
			})
		);
	}
}
