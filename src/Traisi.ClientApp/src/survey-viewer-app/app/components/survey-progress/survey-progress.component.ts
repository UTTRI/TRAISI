import { Component, OnInit } from '@angular/core';
import { SurveyViewerStateService } from 'app/services/survey-viewer-state.service';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
import { NavigationState } from 'app/models/navigation-state.model';
import { SurveyViewScreening } from 'app/models/survey-view-screening.model';
import { SurveyViewerState } from 'app/models/survey-viewer-state.model';
import { SurveyViewPage, SurveyViewSection, ResponseValidationState } from 'traisi-question-sdk';

@Component({
	selector: 'traisi-survey-progress',
	templateUrl: './survey-progress.component.html',
	styleUrls: ['./survey-progress.component.scss'],
})
export class SurveyProgressComponent implements OnInit {
	public pages: SurveyViewPage[];
	public validationStates: typeof ResponseValidationState = ResponseValidationState;
	public constructor(public viewerStateService: SurveyViewerStateService, public navigator: SurveyNavigator) {}
	public ngOnInit(): void {}

	public get viewerState(): SurveyViewerState {
		return this.viewerStateService.viewerState;
	}

	/**
	 *
	 * @param page
	 */
	public navigateToPage(page: SurveyViewPage): void {
		this.navigator.navigateToPage(page.id).subscribe();
	}

	/**
	 *
	 * @param section
	 * @param page
	 */
	public navigateToSection(section: SurveyViewSection, page: SurveyViewPage): void {
		this.navigator.navigateToSection(page, section).subscribe();
	}
}
