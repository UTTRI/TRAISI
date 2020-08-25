import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Observable, Subject, ReplaySubject } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@aspnet/signalr';
import { DownloadNotification } from '../models/download-notification';
import { SurveyNotification } from '../models/survey-notification';

@Injectable({ providedIn: 'root' })
export class RealTimeNotificationServce {
	private hubConnection: HubConnection;
	private channels: Map<string, ReplaySubject<any>> = new Map<string, ReplaySubject<any>>();
	private connectionmade: ReplaySubject<boolean>;

	constructor(private authService: AuthService) {

		/*Object.defineProperty(WebSocket, 'OPEN', { value: 1, });
		this.connectionmade = new ReplaySubject<boolean>();
		this.hubConnection = new HubConnectionBuilder()
			.withUrl('/notify', { accessTokenFactory: () => this.authService.accessToken, logger: LogLevel.None })
			.build();
		this.hubConnection.start().then(() => this.connectionmade.next(true));

		this.hubConnection.on('DownloadUpdate', (downloadInfo: DownloadNotification) => {
			let subject = this.channels.get(downloadInfo.id);
			if (subject) {
				subject.next(downloadInfo);
			}
		});

		this.hubConnection.on('RefreshBuilderSurvey', (surveyInfo: SurveyNotification) => {
			let subject = this.channels.get(`survey-${surveyInfo.surveyId}`);
			if (subject) {
				subject.next(surveyInfo);
			}
		});*/
	}

	public registerChannel<T>(channelId: string): ReplaySubject<T> {
		let notifier: ReplaySubject<T> = new ReplaySubject<T>();
		//this.channels.set(channelId, notifier);
		return notifier;
	}

	public deRegisterChannel(channelId: string): void {
		//this.channels.delete(channelId);
	}

	public surveyStatus(surveyId: number, working: boolean): void {
		//this.connectionmade.subscribe(connected => {
			// TO DO: DISABLED
			//this.hubConnection.invoke('surveyStatus', surveyId, working).catch(err => console.error(err));
		//});
	}

	public indicateSurveyChange(surveyId: number): void {
		// TO DO: DISABLED
		// this.hubConnection.invoke('indicateSurveyChange', surveyId);
	}
}
