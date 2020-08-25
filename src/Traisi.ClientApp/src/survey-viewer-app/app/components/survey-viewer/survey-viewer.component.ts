import { animate, keyframes, query, stagger, style, transition, trigger, state } from '@angular/animations';
import {
	AfterContentInit,
	AfterViewChecked,
	AfterViewInit,
	Component,
	ElementRef,
	Inject,
	OnInit,
	QueryList,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyViewerSessionData } from 'app/models/survey-viewer-session-data.model';
import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';
import { sortBy } from 'lodash';
import { flatMap, share } from 'rxjs/operators';
import { SurveyUser } from 'shared/models/survey-user.model';
import { Utilities } from 'shared/services/utilities';
import {
	ResponseValidationState,
	SurveyRespondent,
	TraisiValues,
	SurveyViewPage,
	SurveyViewQuestion,
} from 'traisi-question-sdk';
import { SurveyViewGroupMember } from '../../models/survey-view-group-member.model';
import { SurveyViewerState } from '../../models/survey-viewer-state.model';
import { SurveyViewerTheme } from '../../models/survey-viewer-theme.model';
import { SurveyViewerStateService } from '../../services/survey-viewer-state.service';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { QuestionContainerComponent } from '../question-container/question-container.component';
import { Footer1Component } from '../special-page-builder/footer1/footer1.component';
import { Header1Component } from '../special-page-builder/header1/header1.component';
import { SurveyHeaderDisplayComponent } from '../survey-header-display/survey-header-display.component';
import { Header2Component } from '../special-page-builder/header2/header2.component';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
import Headroom from 'headroom.js';
import { SurveyRespondentClient, ValidationState } from 'app/services/survey-viewer-api-client.service';
import { SurveyViewerRespondentService } from 'app/services/survey-viewer-respondent.service';
import { QuestionInstanceState } from 'app/services/question-instance.service';
import { QuestionInstance } from 'app/models/question-instance.model';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { NavigationState } from 'app/models/navigation-state.model';
import { AuthService } from 'shared/services/auth.service';
import { SurveyViewerProviders } from 'app/providers/survey-viewer.providers';
interface SpecialPageDataInput {
	pageHTML: string;
	pageThemeInfo: string;
}

@Component({
	selector: 'traisi-survey-viewer',
	templateUrl: './survey-viewer.component.html',
	styleUrls: ['./survey-viewer.component.scss', './survey-viewer.component.md.scss'],
	animations: [
		trigger('visibleHidden', [
			transition('* => hidden', [
				query(
					':self',
					stagger('1s', [
						animate('1s', keyframes([style({ opacity: 1 }), style({ opacity: 0, display: 'none' })])),
					]),
					{
						optional: true,
					}
				),
			]),
		]),
	],
	providers: [SurveyViewerProviders],
})
export class SurveyViewerComponent implements OnInit, AfterViewInit, AfterContentInit, AfterViewChecked {
	public surveyId: number;
	public titleText: string;
	public loadedComponents: boolean = false;
	public headerComponent: any;
	public headerHTML: string;
	public headerInputs: SpecialPageDataInput;

	public footerComponent: any;
	public footerHTML: string;
	public footerInputs: SpecialPageDataInput;

	public navButtonClass: string;
	public pageTextColour: string;
	public questionTextColour: string;
	public sectionTitleColour: string;
	public useLightNavigationLines: boolean;

	public scrollTop: number = 0;

	@ViewChild('surveyBodyContainer')
	public surveyBodyContainer: ElementRef;

	@ViewChild(SurveyHeaderDisplayComponent)
	public headerDisplay: SurveyHeaderDisplayComponent;

	@ViewChildren('questions')
	public questionContainers!: QueryList<QuestionContainerComponent>;

	@ViewChild('questionsContainer')
	public questionsContainerElement: ElementRef;

	@ViewChild('questionSection')
	public questionSectionElement: ElementRef;

	public activeQuestion: any;

	public surveyName: string;

	public session: SurveyViewerSessionData;

	private _activeQuestionContainer: QuestionContainerComponent;

	public ref: SurveyViewerComponent;

	public validationStates: typeof ResponseValidationState = ResponseValidationState;

	public get viewerState(): SurveyViewerState {
		return this._viewerStateService.viewerState;
	}

	public set viewerState(viewerState: SurveyViewerState) {
		this._viewerStateService.viewerState = viewerState;
	}

	public pageThemeInfo: any;
	public viewerTheme: SurveyViewerTheme;

	public isShowComplete: boolean = false;
	public viewDate: Date = new Date();
	public currentUser: SurveyUser;

	public get userShortcode(): string {
		return this._authService.currentSurveyUser.shortcode;
	}

	/**
	 * Gets whether is admin
	 */
	public get isAdmin(): boolean {
		if (this.currentUser === undefined) {
			return false;
		} else {
			return this.currentUser !== undefined && this.currentUser.roles.includes('super administrator');
		}
	}

	/**
	 *Creates an instance of SurveyViewerComponent.
	 * @param {SurveyViewerService} surveyViewerService
	 * @param {SurveyResponderService} _surveyResponderService
	 * @param {SurveyViewerStateService} _viewerStateService
	 * @param {SurveyViewerNavigationService} _navigationService
	 * @param {SurveyViewerSession} _sessionService
	 * @param {ActivatedRoute} route
	 * @param {Router} _router
	 * @param {Title} _titleService
	 * @param {ElementRef} elementRef
	 * @memberof SurveyViewerComponent
	 */
	constructor(
		@Inject('SurveyViewerService')
		private surveyViewerService: SurveyViewerService,
		private _viewerStateService: SurveyViewerStateService,
		public navigator: SurveyNavigator,
		private _sessionService: SurveyViewerSession,
		private _router: Router,
		private _titleService: Title,
		private elementRef: ElementRef,
		private _authService: AuthService,
		@Inject(TraisiValues.SurveyRespondentService) private _respondentService: SurveyViewerRespondentService,
		@Inject(LOCAL_STORAGE) private _storage: StorageService
	) {
		this.ref = this;
	}

	/**
	 * Initialization
	 */
	public ngOnInit(): void {
		this.currentUser = this.surveyViewerService.currentUser;
		this._sessionService.data
			.pipe(
				flatMap((session: SurveyViewerSessionData) => {
					this.session = session;
					this.surveyId = session.surveyId;
					this.surveyName = session.surveyCode;
					this._titleService.setTitle(`TRAISI - ${session.surveyTitle}`);
					return this.surveyViewerService.pageThemeInfoJson;
				}),
				share(),
				flatMap((pageTheme: any) => {
					this.pageThemeInfo = pageTheme;

					let theme: SurveyViewerTheme = {
						sectionBackgroundColour: null,
						questionViewerColour: null,
						viewerTemplate: null,
					};
					theme.sectionBackgroundColour = pageTheme['householdHeaderColour'];
					theme.questionViewerColour = pageTheme['questionViewerColour'];

					try {
						theme.viewerTemplate = JSON.parse(pageTheme['viewerTemplate']);
					} catch {
						theme.viewerTemplate = [];
					}

					this.viewerTheme = theme;
					theme.viewerTemplate.forEach((sectionInfo) => {
						if (sectionInfo.sectionType.startsWith('header')) {
							this.headerComponent = this.getComponent(sectionInfo.sectionType);
							this.headerHTML = sectionInfo.html;
						} else if (sectionInfo.sectionType.startsWith('footer')) {
							this.footerComponent = this.getComponent(sectionInfo.sectionType);
							this.footerHTML = sectionInfo.html;
						}
					});
					// this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = this.pageThemeInfo.pageBackgroundColour;
					this.pageTextColour = this.getBestPageTextColour();
					this.questionTextColour = this.getBestQuestionBodyTextColor();
					this.sectionTitleColour = this.getBestSectionTitleColour();
					this.navButtonClass = this.useDarkButtons() ? 'btn-inverse' : 'btn-default';
					this.useLightNavigationLines = this.pageTextColour === 'rgb(255,255,255)';
					this.setComponentInputs();
					this.loadedComponents = true;
					return this.surveyViewerService.getSurveyViewPages(this.surveyId);
				}),
				share()
			)
			.subscribe((pages: SurveyViewPage[]) => {
				pages.forEach((page) => {
					// this.headerDisplay.completedPages.push(false);
				});
				this.loadQuestions(pages);
			});

		this.isShowComplete = false;
	}

	/**
	 * Gets component
	 * @param componentName
	 * @returns component
	 */
	private getComponent(componentName: string): any {
		switch (componentName) {
			case 'header1':
				return Header1Component;
				break;
			case 'header2':
				return Header2Component;
				break;
			case 'footer1':
				return Footer1Component;
				break;
			default:
				return null;
				break;
		}
	}

	/**
	 *
	 * @param v
	 */
	private navigationStateChanged(v: NavigationState): void {
		let saveState = {
			shortcode: this.session.shortcode ?? this._authService.currentSurveyUser.id,
			surveyId: this.surveyId,
			state: {
				activeQuestionIndex: v.activeQuestionIndex ?? 0,
				activeValidationStates: [],
				isLoaded: false,
				activeQuestionInstances: [],
				activeSectionId: v.activeSectionId,
				activePageIndex: v.activePageIndex ?? 0,
				isNextEnabled: false,
				isPreviousEnabled: false,
				activeRespondentIndex: v.activeRespondentIndex ?? 0,
				activeSectionIndex: v.activeSectionIndex,
			},
		};
		this._storage.set(`surveyState:${this.surveyId}`, saveState);
	}

	/**
	 *
	 *
	 * @private
	 * @memberof SurveyViewerComponent
	 */
	private setComponentInputs(): void {
		this.headerInputs = {
			pageHTML: this.headerHTML,
			pageThemeInfo: this.pageThemeInfo,
		};

		this.footerInputs = {
			pageHTML: this.footerHTML,
			pageThemeInfo: this.pageThemeInfo,
		};
	}

	/**
	 * Loads questions
	 * @param pages
	 */
	private loadQuestions(pages: Array<SurveyViewPage>): void {
		this._respondentService
			.getSurveyPrimaryRespondent(this.surveyId)
			.pipe(
				flatMap((respondent: SurveyRespondent) => {
					this._respondentService.primaryRespondent = {
						id: respondent.id,
						name: null,
						relationship: null,
					};
					this.viewerState.primaryRespondent = this._respondentService.primaryRespondent;

					return this._respondentService.getSurveyGroupMembers(this.viewerState.primaryRespondent);
				}),
				share()
			)
			.subscribe((members: Array<SurveyViewGroupMember>) => {
				if (members.length > 0) {
					this.viewerState.groupMembers = [];
					members.forEach((member) => {
						this.viewerState.groupMembers.push(member);
					});
					this.viewerState.primaryRespondent = members[0];
					this._respondentService.primaryRespondent = members[0];
					this._respondentService.respondents = members;
				}
				let pageCount: number = 0;
				let viewOrder: number = 0;

				this.viewerState.surveyPages = [];
				pages.forEach((page) => {
					let pageQuestionCount: number = 0;
					page.questions.forEach((question) => {
						question.pageIndex = pageCount;
						question.viewOrder = viewOrder;
						question.parentPage = page;
						question.viewId = Symbol();
						this.viewerState.questionTypeMap[question.questionId] = question.questionType;
						pageQuestionCount++;
						if (question.repeatTargets === undefined) {
							question.repeatTargets = [];
						}
						this.viewerState.questionMap[question.questionId] = question;
						this.viewerState.questionViewMap[question.id] = question;

						if (question.isRepeat) {
							this.viewerState.questionMap[question.repeatSource].repeatTargets.push(question.questionId);
						}
					});
					page.sections.forEach((section) => {
						let inSectionIndex: number = 0;
						section.questions.forEach((question) => {
							question.pageIndex = pageCount;
							question.viewOrder = viewOrder;
							question.parentSection = section;
							question.inSectionIndex = inSectionIndex;
							this.viewerState.questionMap[question.questionId] = question;
							this.viewerState.questionViewMap[question.id] = question;
							question.viewId = Symbol();
							this.viewerState.questionTypeMap[question.questionId] = question.questionType;
							this.viewerState.sectionMap[section.id] = section;
							if (section.isRepeat) {
								this.viewerState.questionMap[section.repeatSource].repeatTargets.push(section.id);
							}
							pageQuestionCount++;
							if (question.repeatTargets === undefined) {
								question.repeatTargets = [];
							}
							if (question.isRepeat) {
								this.viewerState.questionMap[question.repeatSource].repeatTargets.push(
									question.questionId
								);
							}
							inSectionIndex++;
						});
					});

					if (pageQuestionCount > 0) {
						pageCount += 1;
						this.viewerState.surveyPages.push(page);
					}
				});

				viewOrder = 0;

				this.viewerState.activeQuestionIndex = 0;

				this.viewerState.surveyQuestionsFull = this.viewerState.surveyQuestions.concat([]);

				this.viewerState.activeQuestionIndex = 0;
				this.viewerState.activePageIndex = 0;

				// this._navigationService.navigationCompleted.subscribe(this.navigationCompleted);
				this.navigator.surveyCompleted$.subscribe({
					complete: this.surveyCompleted,
				});

				let questions: Array<SurveyViewQuestion> = [];
				let questionBlocks: Array<Array<SurveyViewQuestion>> = [];
				for (let page of this.viewerState.surveyPages) {
					let qs = [];
					qs = qs.concat(page.questions);
					for (let s of page.sections) {
						qs.push(s);
					}
					qs = sortBy(qs, (q) => {
						return q['order'];
					});

					for (let q of qs) {
						let questionBlock: Array<SurveyViewQuestion> = [];
						if (q['questions'] === undefined) {
							questions.push(q);
							questionBlock.push(q);
						} else {
							for (let sectionQuestion of q['questions']) {
								questionBlock.push(sectionQuestion);
								questions.push(sectionQuestion);
							}
						}
						questionBlocks.push(questionBlock);
					}
				}
				for (let i = 0; i < questions.length; i++) {
					questions[i].navigationOder = i;
				}
				this.viewerState.surveyQuestions = questions;
				this.viewerState.questionBlocks = questionBlocks;
				// create questionBlocks
				this._viewerStateService.initialize().subscribe();
				this.initializeNavigator();

				this.navigator.navigationState$.subscribe(this.navigationStateChanged.bind(this));
			});
	}

	public initializeNavigator(): void {
		if (this._storage.has(`surveyState:${this.surveyId}`)) {
			let restoredState: {
				shortcode: string;
				surveyId: number;
				state: NavigationState;
			} = this._storage.get(`surveyState:${this.surveyId}`);

			if (
				restoredState.shortcode ===
					(this._authService.currentSurveyUser.shortcode ?? this._authService.currentSurveyUser.id) &&
				this.session.surveyId === restoredState.surveyId
			) {
				this.navigator.initialize(restoredState.state).subscribe((v) => {});
			} else {
				this.navigator.initialize().subscribe();
				console.log('previous survey data is invalid, resetting to new state');
			}
		} else {
			console.log('no previous data, using base initialized');
			this.navigator.initialize().subscribe();
		}
	}

	public trackById(index: number, item: QuestionInstance): string {
		return item?.id;
	}

	/**
	 * Navigation completed of survey viewer component
	 */
	public navigationCompleted = (navStatus: boolean) => {
		this.viewerState.isNavProcessing = false;
		this.scrollTop = 0;
	};

	/**
	 *
	 */
	public surveyCompleted = () => {
		this._router.navigate([this.session.surveyCode, 'thankyou']);
	};

	/**
	 * Navigates previous
	 */
	public navigatePrevious(): void {
		this.viewerState.isNavProcessing = true;
		// this._navigationService.navigatePrevious();

		this.navigator.navigatePrevious().subscribe({
			next: (v) => {},
			complete: () => {
				this.questionsContainerElement.nativeElement.scrollTop = 0;
				this.questionsContainerElement.nativeElement.scrollTo(0, 0);
			},
		});
	}

	/**
	 * Navigates next
	 */
	public navigateNext(): void {
		this.viewerState.isNavProcessing = true;
		this.navigator.navigateNext().subscribe({
			next: (v) => {},
			complete: () => {
				this.questionsContainerElement.nativeElement.scrollTop = 0;
				this.questionsContainerElement.nativeElement.scrollTo(0, 0);
			},
		});
	}

	/**
	 *
	 */
	private callVisibilityHooks(): void {
		if (this._activeQuestionContainer !== undefined) {
			if (this._activeQuestionContainer.surveyQuestionInstance != null) {
				if (
					(<any>this._activeQuestionContainer.surveyQuestionInstance).__proto__.hasOwnProperty(
						'onQuestionShown'
					)
				) {
					(<any>this._activeQuestionContainer.surveyQuestionInstance).onQuestionShown();
				}
			}
		}
	}

	/**
	 *
	 * @param questionPartId
	 */
	public getQuestionModel(questionPartId: number): SurveyViewQuestion {
		return this._viewerStateService.viewerState.surveyQuestions.find((q) => q.questionId === questionPartId);
	}

	/**
	 *
	 * @param question
	 */
	public forceSave(question: QuestionInstance): void {
		question.questionInstanceState.forceSaveResponse();
	}

	/**
	 *
	 * @param questionPartId
	 */
	public navigateToQuestion(questionPartId: number): void {
		this.navigator.navigateToQuestion(questionPartId).subscribe();
	}

	private retrieveHouseholdTag(): string {
		let questionId: number = +Object.keys(this.viewerState.questionMap).find(
			(key) => this.viewerState.questionTypeMap[key] === 'household'
		);
		return Object.keys(this.viewerState.questionNameMap).find(
			(key) => this.viewerState.questionNameMap[key].questionId === questionId
		);
	}

	public processedSectionLabel(sectionTitle: string): string {
		return Utilities.replacePlaceholder(
			sectionTitle,
			this.retrieveHouseholdTag(),
			this.navigator.navigationState$.value.activeRespondent.name
		);
	}

	/**
	 *
	 */
	public ngAfterViewInit(): void {
		this.questionContainers.changes.subscribe((s) => {
			this._activeQuestionContainer = s.first;
			setTimeout(() => {
				this.callVisibilityHooks();
			});
		});
	}

	/**
	 * Navigates complete survey
	 */
	public navigateCompleteSurvey(): void {
		this._router.navigate([this.surveyName, 'thankyou']);
	}

	public ngAfterContentInit(): void {}

	public ngAfterViewChecked(): void {}

	/**
	 * Uses dark buttons
	 * @returns true if dark buttons
	 */
	private useDarkButtons(): boolean {
		return this.pageTextColour !== 'rgb(0,0,0)';
	}

	/**
	 * Gets best page text colour
	 * @returns best page text colour
	 */
	private getBestPageTextColour(): string {
		if (this.pageThemeInfo.pageBackgroundColour) {
			return Utilities.whiteOrBlackText(this.pageThemeInfo.pageBackgroundColour);
		} else {
			return 'rgb(0,0,0)';
		}
	}

	private getBestSectionTitleColour(): string {
		if (this.pageThemeInfo.pageBackgroundColour) {
			return Utilities.whiteOrBlackText(this.viewerTheme.sectionBackgroundColour);
		} else {
			return 'rgb(0,0,0)';
		}
	}

	/**
	 * Gets best question body text color
	 * @returns best question body text color
	 */
	private getBestQuestionBodyTextColor(): string {
		if (this.pageThemeInfo.questionViewerColour) {
			return Utilities.whiteOrBlackText(this.pageThemeInfo.questionViewerColour);
		} else {
			return 'rgb(0,0,0)';
		}
	}
}
