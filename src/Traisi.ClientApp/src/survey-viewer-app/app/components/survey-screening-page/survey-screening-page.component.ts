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
	encapsulation: ViewEncapsulation.None
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
		private _surveySession: SurveyViewerSession
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
	 *
	 * @memberof SurveyScreeningPageComponent
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
				if (this.screeningQuestions.rejectionLink !== undefined || this.screeningQuestions.rejectionLink.trim() !== '') {
					window.location.href = this.screeningQuestions.rejectionLink;
				} else {
					this._router.navigate([this._session.surveyCode, 'complete']);
				}
			}
		}
	}
}
