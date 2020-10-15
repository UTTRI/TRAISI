import {
	Component,
	ComponentFactoryResolver,
	OnInit,
	ViewEncapsulation,
	Inject,
	TemplateRef,
	ViewChild,
	HostListener,
	ElementRef,
} from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { QuestionLoaderService } from '../../services/question-loader.service';
import { SurveyErrorComponent } from '../survey-error/survey-error.component';
import { SurveyStartPageComponent } from '../survey-start-page/survey-start-page.component';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
import { SurveyViewerStateService } from 'app/services/survey-viewer-state.service';
import { SurveyViewerState } from 'app/models/survey-viewer-state.model';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { QuestionInstance } from 'app/models/question-instance.model';
import { NgxPopper, PopperComponent } from 'angular-popper';
@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'traisi-survey-navigator',
	templateUrl: './survey-navigator.component.html',
	styleUrls: ['./survey-navigator.component.scss'],
	entryComponents: [SurveyErrorComponent, SurveyStartPageComponent],
})
export class SurveyNavigatorComponent implements OnInit {
	@ViewChild('validationPopperContent')
	public validationPopperContent: PopperComponent;

	@ViewChild('validationPopperContent', { read: ElementRef })
	public validationPopperContentRef: ElementRef;

	@ViewChild('navigateNextButton', { read: ElementRef })
	public navigateNextButtonRef: ElementRef;

	public invalidQuestions: BehaviorSubject<QuestionInstance[]>;

	public get viewerState(): SurveyViewerState {
		return this._viewerStateService.viewerState;
	}

	public constructor(
		public navigator: SurveyNavigator,
		private _viewerStateService: SurveyViewerStateService,
		private _router: Router,
		@Inject(DOCUMENT) private _document: Document
	) {
		this.invalidQuestions = new BehaviorSubject<QuestionInstance[]>([]);
	}

	public ngOnInit(): void {}

	public navigateCompleteSurvey(): void {
		// this._router.navigate([this.surveyName, 'thankyou']);
	}

	@HostListener('document:click', ['$event'])
	public clickout(event: Event): void {
		if (
			!this.validationPopperContentRef.nativeElement.contains(event.target) &&
			!this.navigateNextButtonRef.nativeElement.contains(event.target)
		) {
			(<any>this.validationPopperContent)['hide']();
		} else {
			//
		}
	}

	public navigateNext(): void {
		(<any>this.validationPopperContent)['hide']();
		let invalidQuestions = this.navigator.getInvalidQuestions();
		this.invalidQuestions.next(invalidQuestions);
		if (invalidQuestions.length === 0) {
			this.navigator.navigateNext().subscribe({
				complete: () => {
					(<any>this.validationPopperContent)['hide']();
				},
			});
		} else {
			(<any>this.validationPopperContent)['show']();
			// this.validationPopperContent.show = true;
		}
	}

	public navigatePrevious(): void {
		(<any>this.validationPopperContent)['hide']();
		this.navigator.navigatePrevious().subscribe((state) => {});
	}
}
