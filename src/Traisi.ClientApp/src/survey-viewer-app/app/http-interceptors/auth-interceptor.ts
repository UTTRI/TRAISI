import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';
import { AuthService } from '../../../shared/services/auth.service';
import { SurveyViewerSessionData } from 'app/models/survey-viewer-session-data.model';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	public readonly apiVersion: string = '1';
	constructor(private _authService: AuthService) {}
	public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (this._authService.isLoggedIn) {
			request = request.clone({
				setHeaders: this.getRequestHeaders(),
			});
			return next.handle(request);
		} else {
			return next.handle(request);
		}
	}

	/**
	 *
	 * @param rType
	 */
	protected getRequestHeaders(rType: any = 'json'): { [header: string]: string | string[] } {
		if (this._authService.currentUser != null && this._authService.currentUser.roles.includes('respondent')) {
			let headers: { [header: string]: string | string[] } = {
				Authorization: 'Bearer ' + this._authService.accessToken,
				'Content-Type': 'application/json',
				Accept: `application/vnd.iman.v${this.apiVersion}+json, application/json, text/plain, */*`,
				'Survey-Id': String(this._authService.currentSurveyUser.surveyId),
				Shortcode: this._authService.currentSurveyUser.shortcode,
				'Respondent-Id': this._authService.currentSurveyUser.id,
				Language: 'en',
			};

			return headers;
		} else {
			let headers: { [header: string]: string | string[] } = {
				Authorization: 'Bearer ' + this._authService.accessToken,
				'Content-Type': 'application/json',
				Accept: `application/vnd.iman.v${this.apiVersion}+json, application/json, text/plain, */*`,
				Language: 'en',
			};

			return headers;
		}
	}
}
