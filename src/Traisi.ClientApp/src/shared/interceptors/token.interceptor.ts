import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { AuthService } from '../services/auth.service';
import { ConfigurationService } from '../services/configuration.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
	public readonly apiVersion: string = '1';
	constructor(private _authService: AuthService) {}
	public intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		if (this._authService.isLoggedIn) {
			request = request.clone({
				setHeaders: {
					Authorization: `Bearer ${this._authService.accessToken}`
				}
			});
			return next.handle(request);
		} else {
			return next.handle(request);
		}
	}

	protected getRequestHeaders(
		rType: any = 'json'
	): {
		headers: HttpHeaders | { [header: string]: string | string[] };
		responseType: any;
	} {
		if (
			this._authService.currentUser != null &&
			this._authService.currentUser.roles.includes('respondent')
		) {
			let headers = new HttpHeaders({
				Authorization: 'Bearer ' + this._authService.accessToken,
				'Content-Type': 'application/json',
				Accept: `application/vnd.iman.v${this.apiVersion}+json, application/json, text/plain, */*`,
				'App-Version': ConfigurationService.appVersion,
				'Survey-Id': String(
					this._authService.currentSurveyUser.surveyId
				),
				Shortcode: this._authService.currentSurveyUser.shortcode,
				'Respondent-Id': this._authService.currentSurveyUser.id
			});

			return { headers: headers, responseType: rType };
		} else {
			let headers = new HttpHeaders({
				Authorization: 'Bearer ' + this._authService.accessToken,
				'Content-Type': 'application/json',
				Accept: `application/vnd.iman.v${this.apiVersion}+json, application/json, text/plain, */*`,
				'App-Version': ConfigurationService.appVersion
			});

			return { headers: headers, responseType: rType };
		}
	}
}
