import { Component, Input, OnInit, ChangeDetectorRef, Inject, ElementRef, ViewChild, AfterContentInit } from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';

import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SurveyStart } from 'app/models/survey-start.model';
import { SurveyStartPageComponent } from '../survey-start-page/survey-start-page.component';
import { SpecialPageBuilderComponent } from '../special-page-builder/special-page-builder.component';

@Component({
	selector: 'traisi-survey-shortcode-page',
	templateUrl: './survey-shortcode-page.component.html',
	styleUrls: ['./survey-shortcode-page.component.scss']
})
export class SurveyShortcodePageComponent implements OnInit, AfterContentInit {
	@ViewChild('startContent')
	public startContent: SpecialPageBuilderComponent;

	public finishedLoading: boolean = false;
	public pageThemeInfo: any = {};
	public surveyName: string;
	public isLoading: boolean = false;
	public shortcode: string;
	public survey: SurveyStart;
	public isError: boolean = false;
	public startPageComponent: SurveyStartPageComponent;

	private _paramMap: ParamMap;

	/**
	 *
	 * @param _surveyViewerService
	 * @param _route
	 * @param _router
	 * @param _translate
	 * @param _elementRef
	 */
	constructor(
		@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewerService,
		private _route: ActivatedRoute,
		private _router: Router,
		private _translate: TranslateService,
		private _elementRef: ElementRef
	) {
		this._route.paramMap.subscribe(map => {
			this._paramMap = map;
		});
	}

	public ngAfterContentInit(): void {}

	/**\
	 * Sets the shortcode input to the value provided by the URL.
	 */
	public setPassedShortcode(): void {
		if (this._paramMap.has('shortcode')) {
			this.startContent.setShortcodeInput(this._paramMap.get('shortcode'));
		}
	}

	/**
	 *
	 */
	public ngOnInit(): void {
		this.survey = new SurveyStart();
		this.shortcode = '';
		this._route.params.subscribe(params => {
			this.surveyName = params['surveyName'];
			this._surveyViewerService.welcomeModel.subscribe(
				(surveyStartModel: SurveyStart) => {
					this.survey = surveyStartModel;
					// this.surveyViewerService.activeSurveyTitle = surveyStartModel.titleText;
					this._surveyViewerService.pageThemeInfoJson.subscribe(
						styles => {
							try {
								this.pageThemeInfo = styles;
								if (this.pageThemeInfo === null) {
									this.pageThemeInfo = {};
									this.pageThemeInfo.viewerTemplate = '';
								}
							} catch (e) {
								console.log(e);
							}
							// this._elementRef.nativeElement.ownerDocument.body.style.backgroundColor = this.pageThemeInfo.pageBackgroundColour;
							// this.startContent['startPageComponent'] = this.startPageComponent;

							this.finishedLoading = true;

							setTimeout(() => {
								this.setPassedShortcode();
							});
						},
						error => {
							console.error(error);
						}
					);
				},
				error => {
					console.error(error);
					this._router.navigate(['/', this.surveyName, 'error'], { relativeTo: this._route });
				}
			);
		});
	}
}
