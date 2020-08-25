import { Component, OnInit } from '@angular/core';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@aspnet/signalr';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
	selector: 'app-chat-app',
	templateUrl: './chat-app.component.html',
	styleUrls: ['./chat-app.component.scss']
})
export class ChatAppComponent implements OnInit {
	private hubConnection: HubConnection;
	nick = '';
	message = '';
	messages: string[] = [];

	constructor(private authService: AuthService) {}
	ngOnInit() {
		this.nick = this.authService.currentUser.fullName.split(' ')[0];

		this.hubConnection = new HubConnectionBuilder().withUrl('/notify', { accessTokenFactory: () => this.authService.accessToken, logger: LogLevel.Trace }).build();

		this.hubConnection
			.start().then(() => this.hubConnection.invoke('getPriorMessages').catch(err => {}));

		this.hubConnection.on('sendToAll', (message) => {
			const text = `${message.userName}: ${message.message}`;
			this.messages.push(text);
		});


	}

	public sendMessage(): void {
		this.hubConnection.invoke('sendToAll', this.message).catch(err => console.error(err));
	}
}
