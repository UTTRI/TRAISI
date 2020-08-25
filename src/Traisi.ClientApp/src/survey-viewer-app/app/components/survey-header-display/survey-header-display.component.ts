import { Component, Input, OnInit, ChangeDetectorRef, Inject, ElementRef, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { SurveyViewerStateService } from '../../services/survey-viewer-state.service';
import { SurveyViewerState } from '../../models/survey-viewer-state.model';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';

import SimpleBar from 'simplebar';
import { stat } from 'fs';

@Component({
	selector: 'traisi-survey-header-display',
	templateUrl: './survey-header-display.component.html',
	styleUrls: ['./survey-header-display.component.scss', './survey-header-display.component.md.scss']
})
export class SurveyHeaderDisplayComponent implements OnInit, AfterViewInit {
	public completedPages: boolean[] = [];
	public surveyComplete: boolean = false;

	public activePageIndex: number = 0;

	public get viewerState(): SurveyViewerState {
		return this._surveyViewerStateService.viewerState;
	}

	@Input() public useWhiteProgressLine: boolean;

	@Input() public pageTextColour: string;

	@ViewChild('pages', { static: true })
	public pagesElement: ElementRef;

	/**
	 * Creates an instance of survey header display component.
	 * @param _surveyViewerStateService
	 * @param _cdRef
	 * @param _surveyViewerService
	 */
	constructor(
		private _surveyViewerStateService: SurveyViewerStateService,
		private _cdRef: ChangeDetectorRef,
		public navigator: SurveyNavigator,
		public elementRef: ElementRef
	) {}

	public ngOnInit(): void {}

	/**
	 * Updates active page index
	 * @param activePageIndex
	 */
	public updateActivePageIndex(activePageIndex: number): void {
		// this.activePageIndex = activePageIndex;
		this._cdRef.markForCheck();
	}

	public setPageActive(index: number): void {}

	public ngAfterViewInit(): void {
		const simpleBar = new SimpleBar(this.pagesElement.nativeElement);
	}
}
