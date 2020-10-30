import { setTheme } from 'ngx-bootstrap/utils';
import { Component, Inject } from '@angular/core';
import { SurveyAnalyticsService, TraisiValues } from 'traisi-question-sdk';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent {
	public title: string = 'traisi-survey-viewer';

	constructor() {
		setTheme('bs4');
	}
}
