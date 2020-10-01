import { Component, OnInit, Inject, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { SurveyViewTermsModel } from '../../models/survey-view-terms.model';
import { TranslateService } from '@ngx-translate/core';
import { flatMap } from 'rxjs/operators';
import { forkJoin, combineLatest, zip } from 'rxjs';
import { SurveyViewScreening } from 'app/models/survey-view-screening.model';
import { SurveyViewerSessionData } from 'app/models/survey-viewer-session-data.model';
import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';
@Component({
	selector: 'app-survey-terms-page',
	templateUrl: './survey-terms-page.component.html',
	styleUrls: ['./survey-terms-page.component.scss']
})
export class SurveyTermsPageComponent implements OnInit {
	private surveyName: string;

	private surveyId: number;

	public model: SurveyViewTermsModel;

	public hasScreeningQuestions: boolean;

	public finishedLoading: boolean = false;

	public pageThemeInfo: any = {};

	public session: SurveyViewerSessionData;

	/**
	 *Creates an instance of SurveyTermsPageComponent.
	 * @param {ActivatedRoute} route
	 * @param {SurveyViewerService} surveyViewerService
	 * @param {Router} router
	 * @param {TranslateService} translate
	 * @memberof SurveyTermsPageComponent
	 */
	constructor(
		@Inject('SurveyViewerService') private surveyViewerService: SurveyViewerService,
		private router: Router,
		private translate: TranslateService,
		private elementRef: ElementRef,
		private _surveySession: SurveyViewerSession
	) {
		this.model = {} as SurveyViewTermsModel;
	}

	/**
	 *
	 *
	 * @memberof SurveyTermsPageComponent
	 */
	public begin(): void {
		if (!this.hasScreeningQuestions) {
			this.router.navigate([this.surveyName, 'viewer']);
		} else {
			this.router.navigate([this.surveyName, 'screening']);
		}
	}

	/**
	 *
	 */
	public ngOnInit(): void {
		zip(
			this._surveySession.data,
			this.surveyViewerService.termsModel,
			this.surveyViewerService.screeningQuestionsModel,
			this.surveyViewerService.pageThemeInfoJson
		).subscribe(
			(value: [SurveyViewerSessionData, SurveyViewTermsModel, SurveyViewScreening, any]) => {
				this.surveyId = value[0].surveyId;
				this.model = value[1];
				this.hasScreeningQuestions = value[2].questionsList.length > 0;
				this.pageThemeInfo = value[3];
				// this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = this.pageThemeInfo.pageBackgroundColour;
				this.finishedLoading = true;
				this.surveyName = value[0].surveyCode;
				console.log(this.model);
			},
			(error) => {
				console.log(error);
			}
		);
	}
}
