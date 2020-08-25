import { Injectable } from '@angular/core';

import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { EndpointFactory } from '../../../shared/services/endpoint-factory.service';

@Injectable({
	providedIn: 'root'
})
export class SurveyEndpointFactoryService extends EndpointFactory {
	private _surveyLoginUrl: string = '/survey/';

	/**
	 *
	 */
	protected get loginUrl(): string {
		return this.configurations.baseUrl + this._surveyLoginUrl;
	}

	/**
	 *
	 * @param error
	 * @param continuation
	 */
	protected handleError(error: any, continuation: () => Observable<any>): Observable<any> {
		if (error.status === 401 && this.lastCall !== error.url) {
			this.lastCall = error.url;
			if (this.isRefreshingLogin) {
				return this.pauseTask(continuation);
			}

			this.isRefreshingLogin = true;

			return this.authService.refreshLogin().pipe(
				mergeMap(data => {
					this.isRefreshingLogin = false;
					this.resumeTasks(true);

					return continuation();
				}),
				catchError(refreshLoginError => {
					this.isRefreshingLogin = false;
					this.resumeTasks(false);

					if (
						refreshLoginError.status === 401 ||
						(refreshLoginError.url && refreshLoginError.url.toLowerCase().includes(this.loginUrl.toLowerCase()))
					) {
						this.authService.reLogin();
						return observableThrowError('session expired');
					} else {
						return observableThrowError(refreshLoginError || 'server error');
					}
				})
			);
		}

		if (error.url && error.url.toLowerCase().includes(this.loginUrl.toLowerCase())) {
			this.authService.reLogin();

			return observableThrowError(
				error.error && error.error.error_description ? `session expired (${error.error.error_description})` : 'session expired'
			);
		} else {
			return observableThrowError(error);
		}
	}
}
