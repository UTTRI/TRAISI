import { Component, OnInit, ViewChild, ViewContainerRef, Inject, ViewEncapsulation, ElementRef } from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyStart } from '../../models/survey-start.model';
import { User } from 'shared/models/user.model';
import { AlertComponent } from 'ngx-bootstrap/alert';
import { TranslateService } from '@ngx-translate/core';
import { SurveyViewThankYouModel } from '../../models/survey-view-thankyou.model';
import { flatMap } from 'rxjs/operators';
import { SurveyViewType } from '../../models/survey-view-type.enum';
import { SurveyViewerClient } from 'app/services/survey-viewer-api-client.service';
import { AuthService } from 'shared/services/auth.service';

@Component({
	selector: 'traisi-survey-thankyou-page',
	templateUrl: './survey-thankyou-page.component.html',
	styleUrls: ['./survey-thankyou-page.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class SurveyThankYouPageComponent implements OnInit {
	private surveyId: number;

	public model: SurveyViewThankYouModel;

	public finishedLoading: boolean = false;
	public pageThemeInfo: any = {};

	/**
	 *Creates an instance of SurveyThankYouPageComponent.
	 * @param {SurveyViewerService} _surveyViewerService
	 * @param {TranslateService} _translate
	 * @memberof SurveyThankYouPageComponent
	 */
	constructor(
		@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewerService,
		private _viewerClient: SurveyViewerClient,
		private _translate: TranslateService,
		private _authService: AuthService
	) {}

	/**
	 *
	 *
	 * @memberof SurveyThankYouPageComponent
	 */
	public ngOnInit(): void {
		this._surveyViewerService.activeSurveyId
			.pipe(
				flatMap((id) => {
					this.surveyId = id;
					return this._surveyViewerService.getSurveyViewerThankYou(
						this.surveyId,
						SurveyViewType.RespondentView,
						'en'
					);
				})
			)
			.pipe(
				flatMap((thankyouPageModel) => {
					this.model = thankyouPageModel;
					if (this.model.hasSuccessLink) {
						// window.location.href = this.model.successLink;
						return null;
					} else {
						return this._surveyViewerService.pageThemeInfoJson;
					}
				})
			)
			.subscribe((value) => {
				if (value) {
					this.pageThemeInfo = value;
				}

				this.finishedLoading = true;
			});

		this._viewerClient.getSurveySuccessLink(this._surveyViewerService.surveyId).subscribe((x: any) => {
			if (x.successLink) {
				window.location.href = x.successLink;
			}
		});

		this._viewerClient.surveyComplete(
			this._surveyViewerService.surveyId,
			this._authService.currentSurveyUser.shortcode
		);
	}
}
