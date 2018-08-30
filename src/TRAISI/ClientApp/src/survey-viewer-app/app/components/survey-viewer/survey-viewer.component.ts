import {
	Component,
	OnInit,
	ViewChild,
	ViewContainerRef,
	ComponentFactory,
	SystemJsNgModuleLoader
} from '@angular/core';
import {SurveyViewerService} from '../../services/survey-viewer.service';
import {QuestionLoaderService} from '../../services/question-loader.service';
import {NextObserver} from 'rxjs';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {SurveyViewPage} from '../../models/survey-view-page.model';
import {SurveyHeaderDisplayComponent} from '../survey-header-display/survey-header-display.component';

@Component({
	selector: 'traisi-survey-viewer',
	templateUrl: './survey-viewer.component.html',
	styleUrls: ['./survey-viewer.component.scss']
})
export class SurveyViewerComponent implements OnInit {


	public questions: any[];

	public surveyId: number;

	@ViewChild(SurveyHeaderDisplayComponent) headerDisplay: SurveyHeaderDisplayComponent;

	/**
	 *
	 * @param surveyViewerService
	 * @param questionLoaderService
	 * @param route
	 */
	constructor(
		private surveyViewerService: SurveyViewerService,
		private questionLoaderService: QuestionLoaderService,
		private route: ActivatedRoute
	) {


	}

	/**
	 * Initialization
	 */
	ngOnInit() {
		// this.surveyViewerService.getWelcomeView()

		console.log(this.headerDisplay);

		this.route.queryParams.subscribe((value: Params) => {

			this.surveyId = value['surveyId'];

			this.surveyViewerService.getSurveyViewPages(this.surveyId).subscribe((pages: SurveyViewPage[]) => {

				this.headerDisplay.pages = pages;
				this.loadPageQuestions(pages[0]);

			});

		});

		this.surveyViewerService.getDefaultSurveyView(this.surveyViewerService.activeSurveyId).subscribe(value => {

			//console.log(value);
		});


		/*this.surveyViewerService.getSurveyViewPages(this.surveyViewerService.activeSurveyId).subscribe(value => {

		}); */

		this.route.params.subscribe(value => {
			let page: number = value['page'];



			this.surveyViewerService.getSurveyViewerRespondentPageQuestions(this.surveyViewerService.activeSurveyId,
				page, 'en').subscribe(value => {
				//this.questions = value.questions;
			});
		});
	}

	/**
	 *
	 * @param page
	 */
	private loadPageQuestions(page: SurveyViewPage) {
		this.questions = page.questions;
	}
}