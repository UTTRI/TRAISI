import { Component, Input, OnInit, ChangeDetectorRef, Inject, ElementRef, ViewContainerRef, ViewChild } from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { SurveyStartPageComponent } from '../survey-start-page/survey-start-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SurveyViewGroupcodePage } from '../../models/survey-view-groupcode-page.model';
import { SurveyStart } from 'app/models/survey-start.model';
import { find as _find } from 'lodash';
import { FormGroup, FormControl } from '@angular/forms';
import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';

@Component({
	selector: 'traisi-survey-groupcode-page',
	templateUrl: './survey-groupcode-page.component.html',
	styleUrls: ['./survey-groupcode-page.component.scss']
})
export class SurveyGroupcodePageComponent implements OnInit {
	public startPageComponent: SurveyStartPageComponent;
	public isFinishedLoading: boolean = false;
	public model: SurveyViewGroupcodePage;
	public surveyStartModel: SurveyStart;
	public pageThemeInfo: any;
	private _surveyName: string;
	public groupcodeFormGroup: FormGroup;
	private _surveyId: number;

	@ViewChild('shortcodeDisplayComponent', { read: ViewContainerRef })
	public shortcodeDisplayComponent: ViewContainerRef;

	/**
	 *Creates an instance of SurveyGroupcodePageComponent.
	 * @param {SurveyViewerService} _surveyViewerService
	 * @param {ActivatedRoute} _route
	 * @param {Router} _router
	 * @param {TranslateService} _translate
	 * @param {ElementRef} _elementRef
	 * @memberof SurveyGroupcodePageComponent
	 */
	public constructor(
		@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewerService,
		private _route: ActivatedRoute,
		private _router: Router,
		private _translate: TranslateService,
		private _elementRef: ElementRef,
		public session: SurveyViewerSession
	) {
		this.isFinishedLoading = false;
		this.model = {};
	}

	/**
	 *
	 */
	public ngOnInit(): void {
		this._surveyViewerService.pageThemeInfo.subscribe(info => {
			this.pageThemeInfo = info;

			this._surveyViewerService.welcomeModel.subscribe((surveyStartModel: SurveyStart) => {
				this.surveyStartModel = surveyStartModel;

				let m = JSON.parse(this.surveyStartModel.welcomeText);

				this.model.header1 = _find(m, x => x.sectionType === 'header1');
				this.model.header2 = _find(m, x => x.sectionType === 'header2');
				this.model.footer1 = _find(m, x => x.sectionType === 'footer1');

				this.groupcodeFormGroup = new FormGroup({});
				this.groupcodeFormGroup.addControl('groupcode', new FormControl(''));

				this._surveyViewerService.activeSurveyId.subscribe((surveyId: number) => {
					this._surveyId = surveyId;
				});

				this.checkSurveyUserLoginStatus();
				this.isFinishedLoading = true;
			});
		});
		return;
	}

	/**
	 *
	 *
	 * @private
	 * @type {void}
	 * @memberof SurveyGroupcodePageComponent
	 */
	private checkSurveyUserLoginStatus(): void {}

	public showShortcodeDisplay(): void {}

	/**
	 *
	 *
	 * @memberof SurveyGroupcodePageComponent
	 */
	public onGroupcodeSubmit(): void {
		// this.groupcodeFormGroup.reset();
		this._surveyViewerService.validateSurveyGroupcode(this._surveyId, this.groupcodeFormGroup.value.groupcode).subscribe(result => {
			if (result) {
				this.startPageComponent.groupcodeStartSurvey(this.groupcodeFormGroup.value.groupcode);
			} else {
				this.groupcodeFormGroup.setErrors({
					invalid: true
				});

				console.log(this.groupcodeFormGroup);
				// show error message
			}
		});
		//
	}
}
