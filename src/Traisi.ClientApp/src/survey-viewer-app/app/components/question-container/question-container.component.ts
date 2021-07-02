import {
	Component,
	ComponentRef,
	Input,
	OnInit,
	OnDestroy,
	ViewChild,
	ViewContainerRef,
	Inject,
	ElementRef,
	Renderer2,
	Injector,
	StaticProvider,
} from '@angular/core';
import { QuestionLoaderService } from '../../services/question-loader.service';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { SurveyViewQuestionOption } from '../../models/survey-view-question-option.model';
import {
	OnOptionsLoaded,
	OnSurveyQuestionInit,
	SurveyRespondent,
	SurveyQuestion,
	ResponseValidationState,
	QuestionConfigurationService,
	TraisiValues,
	SurveyViewQuestion,
} from 'traisi-question-sdk';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject, Subject, forkJoin } from 'rxjs';
import { SurveyViewerComponent } from '../survey-viewer/survey-viewer.component';
import { SurveyViewGroupMember } from '../../models/survey-view-group-member.model';
import { SurveyViewerStateService } from '../../services/survey-viewer-state.service';
import { Utilities } from 'shared/services/utilities';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SurveyViewerState } from '../../models/survey-viewer-state.model';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
import { skip, share, distinct } from 'rxjs/operators';
import { QuestionInstance } from 'app/models/question-instance.model';
import { SurveyTextTransformer } from 'app/services/survey-text-transform/survey-text-transformer.service';
import { QuestionInstanceState } from 'app/services/question-instance.service';
import { SurveyViewerResponseService } from 'app/services/survey-viewer-response.service';
import { ValidationState } from 'app/services/survey-viewer-api-client.service';
import { SurveyViewerRespondentService } from 'app/services/survey-viewer-respondent.service';
import { SurveyViewerProviders } from 'app/providers/survey-viewer.providers';
export { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export const fadeInOut = trigger('fadeInOut', [
	transition(':enter', [style({ opacity: 0 }), animate('0.4s ease-in', style({ opacity: 1 }))]),
	transition(':leave', [animate('0.4s 10ms ease-out', style({ opacity: 0 }))]),
]);

@Component({
	selector: 'traisi-question-container',
	templateUrl: './question-container.component.html',
	styleUrls: ['./question-container.component.scss'],
	animations: [fadeInOut],
	providers: [QuestionInstanceState],
})
export class QuestionContainerComponent implements OnInit, OnDestroy {
	@Input()
	public question: SurveyViewQuestion;

	@Input()
	public surveyId: number;

	@Input()
	public surveyViewer: SurveyViewerComponent;

	@Input()
	public surveyViewQuestion: SurveyViewQuestion;

	@Input()
	public respondent: SurveyViewGroupMember;

	@Input()
	public repeatNumber: number = 0;

	@Input()
	public sectionRepeatNumber: number = 0;

	@Input()
	public questionInstance: QuestionInstance;

	@Input()
	public activeQuestionIndex: number = 0;

	@Input()
	public questionSectionElement: ElementRef;

	@ViewChild('questionTemplate', { read: ViewContainerRef, static: true })
	public questionOutlet: ViewContainerRef;

	@ViewChild('section')
	public sectionElementRef: ElementRef;

	@ViewChild('headerDiv')
	public headerDivRef: ElementRef;

	@ViewChild('descriptionDiv')
	public descriptionDivRef: ElementRef;

	private _responseSaved: Subject<boolean>;

	public titleLabel: Subject<string> = new BehaviorSubject<string>('');

	public descriptionLabel: Subject<string> = new BehaviorSubject<string>('');

	private _questionInstance: SurveyQuestion<any>;

	public isLoaded: boolean = false;

	public validationStates: typeof ValidationState = ValidationState;

	// public responseValidationState: SurveyViewerResponseValidationState;

	public displayClass: string = 'view-compact';

	get surveyQuestionInstance(): SurveyQuestion<any> {
		return this._questionInstance;
	}

	public get navIndex(): number {
		return 1;
		// return this._navigator.
		// return this._viewerStateService.viewerState.questionNavIndex + 1;
	}

	public get viewerState(): SurveyViewerState {
		return this._viewerStateService.viewerState;
	}

	private alreadyNavigated: boolean = false;

	public get instanceState(): QuestionInstanceState {
		return this._instanceState;
	}

	/**
	 * Creates an instance of question container component.
	 * @param questionLoaderService
	 * @param surveyViewerService
	 * @param _viewerStateService
	 * @param _responderService
	 * @param viewContainerRef
	 * @param _navigation
	 */
	constructor(
		@Inject(TraisiValues.QuestionLoader)
		private questionLoaderService: QuestionLoaderService,
		@Inject('SurveyViewerService')
		private surveyViewerService: SurveyViewerService,
		private _viewerStateService: SurveyViewerStateService,
		public viewContainerRef: ViewContainerRef,
		private _navigator: SurveyNavigator,
		private renderer: Renderer2,
		private _questionConfigurationService: QuestionConfigurationService,
		private _textTransformer: SurveyTextTransformer,
		private _instanceState: QuestionInstanceState,
		@Inject(TraisiValues.SurveyResponseService) private _responseService: SurveyViewerResponseService,
		@Inject(TraisiValues.SurveyRespondentService) private _respondentService: SurveyViewerRespondentService,
		private _elementRef: ElementRef,
		private _injector: Injector
	) {
		console.log('in loader');
	}

	/**
	 * Calcs unique repeat number
	 * @returns unique repeat number
	 */
	private calcUniqueRepeatNumber(): number {
		return 0;
		// return this.repeatContainer.children.length * this.sectionRepeatNumber + this.repeatNumber;
	}

	/**
	 * Unregister question etc and unsubscribe certain subs
	 */
	public ngOnDestroy(): void {}

	public configurationFactory = () => {
		return {
			...this._questionConfigurationService.getQuestionServerConfiguration(this.question.questionType),
			...this.question.configuration,
		};
	};

	private createServerConfigProviders(): StaticProvider[] {
		let c = this._questionConfigurationService.listConfigurations();
		let providers: StaticProvider[] = [];
		for (let provider of c) {
			providers.push({
				provide: `${provider.question}.${provider.property}`.toLowerCase(),
				useValue: provider['value'],
			});
		}
		return providers;
	}

	private createInjector(): Injector {
		this.createServerConfigProviders();

		let questionProviders: StaticProvider[] = [];
		for (let question of Object.keys(this._viewerStateService.viewerState.questionMap)) {
			let model: SurveyViewQuestion = this._viewerStateService.viewerState.questionMap[question];
			questionProviders.push({
				provide: `question.${model.name}`,
				useValue: this._viewerStateService.viewerState.questionMap[question],
			});
		}
		let injector: Injector = Injector.create({
			providers: [
				{
					provide: TraisiValues.Configuration,
					useFactory: this.configurationFactory,
					deps: [],
				},
				{
					provide: TraisiValues.Household,
					useValue: this._respondentService.respondents,
				},
				{
					provide: TraisiValues.Respondent,
					useValue: this.respondent,
				},
				{
					provide: TraisiValues.PrimaryRespondent,
					useValue: this._respondentService.primaryRespondent,
				},
				{
					provide: TraisiValues.SurveyQuestion,
					useValue: this.question,
				},
				{
					provide: TraisiValues.RepeatSource,
					useValue: this.questionInstance.repeatSource,
				},
				{
					provide: TraisiValues.RepeatValue,
					useValue: this.questionInstance.repeatValue,
				},
				{
					provide: TraisiValues.SurveyAccessTime,
					useValue: this.viewerState.surveyAccessTime,
				},
				this.createServerConfigProviders(),
				questionProviders,
			],
			parent: this._injector,
		});
		return injector;
	}

	/**
	 *
	 */
	public ngOnInit(): void {
		this.processPipedQuestionLabel(this.question.label, this.titleLabel);
		this.processPipedQuestionLabel(this.question.descriptionLabel, this.descriptionLabel);

		console.log('in here');
		this.questionLoaderService.loadQuestionComponentFactory(this.question).subscribe(
			(componentFactoryRef) => {
				let componentRef = this.questionOutlet.createComponent(
					componentFactoryRef,
					undefined,
					this.createInjector()
				);
				let surveyQuestionInstance: SurveyQuestion<any> = <SurveyQuestion<any>>componentRef.instance;

				surveyQuestionInstance.loadConfiguration({
					...this._questionConfigurationService.getQuestionServerConfiguration(this.question.questionType),
					...this.question.configuration,
				});
				surveyQuestionInstance.questionId = this.question.questionId;
				surveyQuestionInstance.surveyId = this.surveyId;
				surveyQuestionInstance.containerHeight = 100;

				(<SurveyQuestion<any>>componentRef.instance).configuration = Object.assign(
					{},
					this.question.configuration
				);

				this._instanceState.initialize(
					this.respondent,
					this.surveyViewQuestion,
					componentRef.instance,
					this.questionInstance.repeat
				);

				this._navigator.navigationState$.getValue().activeQuestionInstances[
					this.activeQuestionIndex
				].component = surveyQuestionInstance;
				this._navigator.navigationState$.getValue().activeQuestionInstances[
					this.activeQuestionIndex
				].questionInstanceState = this._instanceState;

				surveyQuestionInstance.respondent = this.respondent;
				surveyQuestionInstance.traisiOnInit();
				// surveyQuestionInstance.serverConfiguration = questionConfiguration;
				this.surveyViewerService
					.getQuestionOptions(this.surveyId, this.question.questionId, 'en', null)
					.subscribe((options: SurveyViewQuestionOption[]) => {
						this.isLoaded = true;
						this.updateContainerHeight();
						this._questionInstance = componentRef.instance;
						if (componentRef.instance.__proto__.hasOwnProperty('onOptionsLoaded')) {
							(<OnOptionsLoaded>componentRef.instance).onOptionsLoaded(options);
						}
						(<ReplaySubject<any>>(
							(<unknown>(<SurveyQuestion<any>>componentRef.instance).questionOptions)
						)).next(options);
						if (componentRef.instance.__proto__.hasOwnProperty('onSurveyQuestionInit')) {
							(<OnSurveyQuestionInit>componentRef.instance).onSurveyQuestionInit(
								this.question.configuration
							);
						}
						(<ReplaySubject<any>>(
							(<unknown>(<SurveyQuestion<any>>componentRef.instance).configurations)
						)).next(this.question.configuration);
					});
			},
			(error) => {},
			() => {}
		);
	}

	/**
	 * Autos advance
	 */
	private autoAdvance(): void {}

	/**
	 * Retrieves household tag
	 * @returns household tag
	 */
	private retrieveHouseholdTag(): string {
		let questionId: number = +Object.keys(this._viewerStateService.viewerState.questionTypeMap).find(
			(key) => this._viewerStateService.viewerState.questionTypeMap[key] === 'household'
		);
		return Object.keys(this._viewerStateService.viewerState.questionNameMap).find(
			(key) => this._viewerStateService.viewerState.questionNameMap[key].questionId === questionId
		);
	}

	/**
	 *
	 * @param event
	 */
	public onResize(event: Event): void {
		// if (this._instanceState.questionInstance.isFillVertical) {
		this.updateContainerHeight();
		// }
	}

	/**
	 * Calculates and updates the container height for the question instance.
	 */
	private updateContainerHeight(): void {
		if (this.isLoaded) {
			let containerHeight: number = this._instanceState.questionInstance.isFillVertical
				? this.sectionElementRef.nativeElement.offsetHeight -
				  this.headerDivRef.nativeElement.offsetHeight -
				  this.descriptionDivRef.nativeElement.offsetHeight -
				  40
				: this._instanceState.questionInstance.preferredHeight;
			this._instanceState.questionInstance.containerHeight = containerHeight;
		}
	}

	/**
	 * Process piped question label
	 * @param rawLabel
	 */
	private processPipedQuestionLabel(rawLabel: string, update: Subject<string>): void {
		if (!rawLabel) {
			return;
		}
		let processedLabel = Utilities.replacePlaceholder(rawLabel, this.retrieveHouseholdTag(), this.respondent.name);
		processedLabel = Utilities.replacePlaceholder(processedLabel, 'respondentName', this.respondent.name);
		// get tag list
		let tags = Utilities.extractPlaceholders(processedLabel);
		processedLabel = this._textTransformer.transformText(processedLabel);

		if (tags && tags.length > 0) {
			let questionIdsForResponse = tags.map(
				(tag) =>
					this._viewerStateService.viewerState.questionMap[
						this._viewerStateService.viewerState.questionNameMap[tag].questionId
					]
			);

			questionIdsForResponse = questionIdsForResponse.filter((f) => {
				return f !== undefined;
			});

			if (questionIdsForResponse.length > 0) {
				this._responseService
					.loadSavedResponses(questionIdsForResponse, this.respondent)
					.subscribe((responses) => {
						tags.forEach((tag, index) => {
							if (
								this._viewerStateService.viewerState.questionNameMap[tag].questionId ===
								this.question.repeatSource
							) {
								processedLabel = Utilities.replacePlaceholder(
									processedLabel,
									tag,
									`${this.repeatNumber + 1}`
								);
							} else if (
								this.question.parentSection &&
								this.question.parentSection.repeatSource ===
									this._viewerStateService.viewerState.questionNameMap[tag].questionId
							) {
								processedLabel = Utilities.replacePlaceholder(
									processedLabel,
									tag,
									`${this.sectionRepeatNumber + 1}`
								);
							} else {
								processedLabel = Utilities.replacePlaceholder(
									processedLabel,
									tag,
									responses[index].responseValues[0].value
								);
							}
						});
						update.next(processedLabel);
					});
			}
		} else {
			update.next(processedLabel);
		}
	}

	/**
	 * Will unload is called before the active question is swapped out of view.
	 */
	public traisiQuestionWillUnload(): void {
		if (this._questionInstance !== undefined) {
			this._questionInstance.traisiOnUnloaded();
		}
	}
}
