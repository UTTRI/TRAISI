import { Component, Input, OnInit, ChangeDetectorRef, Inject, ElementRef } from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SurveyStart } from 'app/models/survey-start.model';
import { SurveyStartPageComponent } from '../survey-start-page/survey-start-page.component';
import { SurveyViewGroupcodePage } from 'app/models/survey-view-groupcode-page.model';
import { find as _find } from 'lodash';
import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';
import { SurveyViewerSessionData } from 'app/models/survey-viewer-session-data.model';
@Component({
	selector: 'traisi-survey-shortcode-display-page',
	templateUrl: './survey-shortcode-display-page.component.html',
	styleUrls: ['./survey-shortcode-display-page.component.scss']
})
export class SurveyShortcodeDisplayPageComponent implements OnInit {
	public startPageComponent: SurveyStartPageComponent;

	public isFinishedLoading: boolean;
	public model: SurveyViewGroupcodePage & { shortcode?: string };
	public surveyStartModel: SurveyStart;
	public pageThemeInfo: any;
	private _surveyName: string;
	private _surveyId: number;
	public session: SurveyViewerSessionData;

	/**
	 *Creates an instance of SurveyShortcodeDisplayPageComponent.
	 * @param {SurveyViewerService} _surveyViewerService
	 * @param {ActivatedRoute} _route
	 * @param {Router} _router
	 * @param {TranslateService} _translate
	 * @param {ElementRef} _elementRef
	 * @param {SurveyViewerSession} _surveySession
	 * @memberof SurveyShortcodeDisplayPageComponent
	 */
	public constructor(
		@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewerService,
		private _route: ActivatedRoute,
		private _router: Router,
		private _translate: TranslateService,
		private _elementRef: ElementRef,
		private _surveySession: SurveyViewerSession
	) {
		this.isFinishedLoading = false;
		this.model = {};
	}

	public ngOnInit(): void {
		this._surveySession.data.subscribe(session => {
			this.session = session;
			console.log(session);
		});

		this._surveyViewerService.pageThemeInfo.subscribe(info => {
			this.pageThemeInfo = info;
			this.isFinishedLoading = true;
			this._surveyViewerService.welcomeModel.subscribe((surveyStartModel: SurveyStart) => {
				this.surveyStartModel = surveyStartModel;
				this.isFinishedLoading = true;

				let m = JSON.parse(this.surveyStartModel.welcomeText);
				this.model.header1 = _find(m, x => x.sectionType === 'header1');
				this.model.header2 = _find(m, x => x.sectionType === 'header2');
				this.model.footer1 = _find(m, x => x.sectionType === 'footer1');

				this._surveyViewerService.activeSurveyId.subscribe((surveyId: number) => {
					this._surveyId = surveyId;
				});

				this._route.queryParamMap.subscribe(params => {
					this.model.shortcode = params.get('shortcode');
				});
			});
		});
		return;
	}

	/**
	 *
	 *
	 * @memberof SurveyShortcodeDisplayPageComponent
	 */
	public onStartSurvey(): void {
		this.startPageComponent.surveyLogin(this.model.shortcode);
	}
}
