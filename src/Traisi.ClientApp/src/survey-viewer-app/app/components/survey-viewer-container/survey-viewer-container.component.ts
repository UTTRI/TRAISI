import { Component, ComponentFactoryResolver, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { SurveyErrorComponent } from '../survey-error/survey-error.component';
import { SurveyStartPageComponent } from '../survey-start-page/survey-start-page.component';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { TraisiValues, SurveyAnalyticsService } from 'traisi-question-sdk';
declare var Modernizr;
@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'app-survey-viewer-container',
	templateUrl: './survey-viewer-container.component.html',
	styleUrls: ['./survey-viewer-container.component.scss'],
	entryComponents: [SurveyErrorComponent, SurveyStartPageComponent],
})
export class SurveyViewerContainerComponent implements OnInit {
	private surveyName: string;
	public hasGeneratedShortcode: boolean;

	/**
	 *
	 * @param surveySession
	 * @param _titleService
	 * @param _toastr
	 * @param surveyViewer
	 */
	constructor(
		public surveySession: SurveyViewerSession,
		private _titleService: Title,
		private _toastr: ToastrService,
		public surveyViewer: SurveyViewerService,
		private _router: Router,
		@Inject(TraisiValues.SurveyAnalytics) private _analytics: SurveyAnalyticsService
	) {
		this.hasGeneratedShortcode = false;
	}

	/**
	 *
	 */
	public ngOnInit(): void {
		this.surveySession.data.subscribe((data) => {
			this._titleService.setTitle('TRAISI - ' + data.surveyTitle);
		});
		this._router.events.subscribe(this._onRouterEvent);
	}

	/**
	 *
	 * @param event
	 */
	private _onRouterEvent = (event: RouterEvent): void => {
		if (event instanceof NavigationEnd) {
			this._analytics.setPage(this._titleService.getTitle(), event.urlAfterRedirects, undefined);
		}
	};
}
