import { Component, ComponentFactoryResolver, OnInit, ViewEncapsulation, Inject, TemplateRef } from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { QuestionLoaderService } from '../../services/question-loader.service';
import { SurveyErrorComponent } from '../survey-error/survey-error.component';
import { SurveyStartPageComponent } from '../survey-start-page/survey-start-page.component';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'traisi-survey-navigator',
	templateUrl: './survey-navigator.component.html',
	styleUrls: ['./survey-navigator.component.scss'],
	entryComponents: [SurveyErrorComponent, SurveyStartPageComponent],
})
export class SurveyNavigatorComponent implements OnInit {
	public constructor(public navigator: SurveyNavigator) {}
	public ngOnInit(): void {
		throw new Error('Method not implemented.');
	}

	public navigateNext(): void {
		this.navigator.navigateNext().subscribe((state) => {});
	}

	public navigatePrevious(): void {
		this.navigator.navigatePrevious().subscribe((state) => {});
	}
}
