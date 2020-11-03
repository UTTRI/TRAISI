import { Component, OnInit, ViewChild, ViewContainerRef, Inject, ViewEncapsulation, ElementRef } from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyStart } from '../../models/survey-start.model';
import { User } from 'shared/models/user.model';
import { AlertComponent } from 'ngx-bootstrap/alert';
import { TranslateService } from '@ngx-translate/core';
import { SurveyViewScreening } from 'app/models/survey-view-screening.model';
import { NgForm, FormGroup, FormControl } from '@angular/forms';
import { SurveyViewerSessionData } from 'app/models/survey-viewer-session-data.model';
import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';
import { SurveyViewerClient } from 'app/services/survey-viewer-api-client.service';
import { AuthService } from 'shared/services/auth.service';
import { TraisiValues, SurveyAnalyticsService } from 'traisi-question-sdk';

/**
 *
 *
 * @export
 * @class SurveyScreeningPageComponent
 * @implements {OnInit}
 */
@Component({
	selector: 'survey-screening-page',
	templateUrl: './survey-screening-page.component.html',
	styleUrls: ['./survey-screening-page.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class SurveyScreeningPageComponent implements OnInit {
	public screeningQuestions: SurveyViewScreening;

	public isFinishedLoading: boolean = false;

	@ViewChild('screeningForm')
	public formGroup: NgForm;

	public screeningFormGroup: FormGroup;

	public pageThemeInfo: any;

	private _session: SurveyViewerSessionData;

	private _surveyName: string;

	/**
	 *Creates an instance of SurveyScreeningPageComponent.
	 * @param {SurveyViewerService} _surveyViewerService
	 * @param {ActivatedRoute} _route
	 * @param {Router} _router
	 * @param {TranslateService} _translate
	 * @param {ElementRef} _elementRef
	 * @memberof SurveyScreeningPageComponent
	 */
	public constructor(
		@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewerService,
		private _route: ActivatedRoute,
		private _router: Router,
		private _translate: TranslateService,
		private _elementRef: ElementRef,
		private _surveySession: SurveyViewerSession,
		private _viewerClient: SurveyViewerClient,
		private _authService: AuthService,
		@Inject(TraisiValues.SurveyAnalytics) private _analytics: SurveyAnalyticsService
	) {}

	/**
	 *
	 *
	 * @memberof SurveyScreeningPageComponent
	 */
	public ngOnInit(): void {
		this._surveyViewerService.screeningQuestionsModel.subscribe((model) => {
			this._surveyViewerService.pageThemeInfo.subscribe((info) => {
				this.pageThemeInfo = info;
				this.screeningQuestions = model;
				this.isFinishedLoading = true;

				this.screeningFormGroup = new FormGroup({});

				for (let i = 0; i < model.questionsList.length; i++) {
					this.screeningFormGroup.addControl('' + i, new FormControl(''));
				}
			});
		});

		this._surveySession.data.subscribe((data) => {
			this._session = data;
		});

		this._route.parent.params.subscribe((params) => {
			this._surveyName = params['surveyName'];
		});
	}

	/**
	 *
	 */
	public onSubmitScreeningQuestions(): void {
		if (this.formGroup.submitted && this.formGroup.valid) {
			// determine if all responses are yes
			let allYes: boolean = true;
			for (let value of Object.keys(this.screeningFormGroup.value)) {
				if (!this.screeningFormGroup.value[value]) {
					allYes = false;
					break;
				}
			}
			if (allYes) {
				// navigate to viewer since all screening questions were answered 'yes'
				this._router.navigate([this._session.surveyCode, 'viewer']);
				return;
			} else {
				// navigate to rejection link
				this._analytics.sendEvent('Survey Navigation Event', 'survey_rejected', undefined).subscribe({
					complete: () => {
						this._viewerClient
							.surveyReject(
								this._surveyViewerService.surveyId,
								this._authService.currentSurveyUser.shortcode
							)
							.subscribe(() => {
								this._viewerClient
									.getSurveyRejectionLink(this._surveyViewerService.surveyId)
									.subscribe((x: any) => {
										if (x.successLink) {
											setTimeout(() => {
												window.location.href = x.successLink;
											});
										} else {
											// this._router.navigate([this._session.surveyCode, 'thankyou']);
										}
									});
							});
					},
				});
			}
		}
	}
}
