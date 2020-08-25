import { Injectable, OnInit, Inject } from '@angular/core';
import { SurveyViewerEndpointService } from './survey-viewer-endpoint.service';
import { Observable, Subject, BehaviorSubject, ReplaySubject, pipe } from 'rxjs';
import 'rxjs/add/observable/of';
import { SurveyStart } from '../models/survey-start.model';
import { SurveyViewType } from '../models/survey-view-type.enum';
import { SurveyViewTermsModel } from '../models/survey-view-terms.model';
import {
	QuestionConfiguration,
	QuestionOption,
	SurveyViewer,
	SurveyRespondent,
	SurveyViewPage,
	TraisiValues,
} from 'traisi-question-sdk';
import { SurveyViewQuestionOption } from '../models/survey-view-question-option.model';
import { ActivatedRoute, Router, RouterEvent, ActivationStart, Params } from '@angular/router';
import { SurveyViewerTheme } from '../models/survey-viewer-theme.model';
import { SurveyViewThankYouModel } from '../models/survey-view-thankyou.model';
import { SurveyWelcomeModel } from '../models/survey-welcome.model';
import { AuthService } from 'shared/services/auth.service';
import { SurveyViewScreening } from 'app/models/survey-view-screening.model';
import { find as _find } from 'lodash';
import { SurveyViewerStateService } from './survey-viewer-state.service';
import { tap, share, concat, map } from 'rxjs/operators';
import { zip } from 'rxjs';
import { SurveyStartPageComponent } from 'app/components/survey-start-page/survey-start-page.component';
import { User } from '../../../shared/models/user.model';
import { SurveyData } from '../models/survey-data.model';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
import { SurveyViewerResponseService } from './survey-viewer-response.service';
import { NavigationState } from 'app/models/navigation-state.model';
import { ThrowStmt } from '@angular/compiler';
@Injectable({
	providedIn: 'root',
})
export class SurveyViewerService implements OnInit {
	public configurationData: Subject<QuestionConfiguration[]>;
	public options: Subject<QuestionOption[]>;

	private _activeSurveyTitle: string;

	private _activeSurveyId: number;

	public activeSurveyCode: string;

	public activeSurveyId: ReplaySubject<number> = new ReplaySubject<number>(1);

	public activeSurveyTitle: ReplaySubject<string> = new ReplaySubject<string>(1);

	public navigationActiveState: Subject<boolean>;

	public pageThemeInfo: ReplaySubject<SurveyViewerTheme>;

	public pageThemeInfoJson: ReplaySubject<any>;

	public surveyCode: ReplaySubject<string>;

	public termsModel: ReplaySubject<SurveyViewTermsModel>;

	public welcomeModel: ReplaySubject<SurveyStart>;

	public isLoggedIn: BehaviorSubject<boolean>;

	public screeningQuestionsModel: ReplaySubject<SurveyViewScreening>;

	public surveyAuthenticationMode: ReplaySubject<any>;

	private _pageThemeInfo: SurveyViewerTheme;

	private _pageThemeInfoJson: any;

	public startPageComponent: SurveyStartPageComponent;

	private _isLoaded$: BehaviorSubject<boolean>;

	public startModel: SurveyStart;

	public surveyTerms: SurveyViewTermsModel;

	public authenticationMode: any;

	public screeningQuestions: SurveyViewScreening;

	private _surveyData: SurveyData;

	public surveyData: ReplaySubject<SurveyData>;

	public get isLoaded(): Observable<boolean> {
		return this._isLoaded$;
	}

	public get currentUser(): any {
		return this._authService.currentSurveyUser;
	}

	/**
	 *
	 */
	public get accessToken(): string {
		return this._authService.accessToken;
	}

	/**
	 *Creates an instance of SurveyViewerService.
	 * @param {SurveyViewerEndpointService} _surveyViewerEndpointService
	 * @param {AuthService} _authService
	 * @param {Router} router
	 * @memberof SurveyViewerService
	 */
	constructor(
		private _surveyViewerEndpointService: SurveyViewerEndpointService,
		private _authService: AuthService,
		private router: Router
	) {
		this._activeSurveyId = -1;

		this.configurationData = new Subject<QuestionConfiguration[]>();
		this.options = new Subject<QuestionOption[]>();
		this.surveyAuthenticationMode = new ReplaySubject<any>();
		this.pageThemeInfo = new ReplaySubject<SurveyViewerTheme>(1);
		this.isLoggedIn = new BehaviorSubject<boolean>(false);
		this.surveyCode = new ReplaySubject<string>(1);
		this.pageThemeInfoJson = new ReplaySubject<any>(1);
		this.welcomeModel = new ReplaySubject<SurveyStart>(1);
		this.termsModel = new ReplaySubject<SurveyViewTermsModel>(1);
		this.screeningQuestionsModel = new ReplaySubject<SurveyViewScreening>(1);
		this._isLoaded$ = new BehaviorSubject<boolean>(false);
		this.surveyData = new ReplaySubject<SurveyData>();
		let sub = this.router.events.subscribe((value: any) => {
			if (value instanceof ActivationStart) {
				let route: ActivationStart = <ActivationStart>value;

				this.activeSurveyCode = route.snapshot.paramMap.get('surveyName');
				this.surveyCode.next(this.activeSurveyCode);

				if (this._activeSurveyId < 0) {
					this.restoreStatus();
					sub.unsubscribe();
				}
				this.isLoggedIn.next(this._authService.isLoggedIn);

				this.initialize(this.activeSurveyCode);
			}
		});
		this.navigationActiveState = new Subject<boolean>();

		this._pageThemeInfo = {
			sectionBackgroundColour: '',
			questionViewerColour: '',
			viewerTemplate: null,
		};

		this.pageThemeInfo.next(this._pageThemeInfo);

	}

	public logout(): void {
		this._authService.logout();
		this.router.navigate([this.activeSurveyCode, 'start']);
		// navigate to survey start
	}

	/**
	 *
	 * @param state
	 */
	private _onNavigationChanged: (state: NavigationState) => void = (state: NavigationState) => {
		console.log('in nav changed');
		console.log(state);
	};

	public initialize(surveyCode: string): void {
		this._surveyViewerEndpointService.getSurveyIdFromCodeEndpoint(surveyCode).subscribe((value) => {
			this._activeSurveyId = <number>value[Object.keys(value)[0]];
			this._activeSurveyTitle = <string>value[Object.keys(value)[2]];
			this.activeSurveyId.next(this._activeSurveyId);

			zip(
				this.getWelcomeView(this.activeSurveyCode),
				this.getSurveyViewerTermsAndConditions(this._activeSurveyId),
				this.getSurveyAuthenticationMode(this.activeSurveyCode),
				this.getSurveyViewerScreeningQuestions(this._activeSurveyId),
				this.getSurveyStyles(this._activeSurveyId)
			).subscribe(
				([surveyStartModel, surveyTermsModel, authMode, screeningQuestions, styles]: [
					SurveyStart,
					SurveyViewTermsModel,
					any,
					any,
					any
				]) => {
					this._surveyData = {
						surveyCode: surveyCode,
						surveyId: this._activeSurveyId,
						surveyTitle: this._activeSurveyTitle,
					};

					this.startModel = surveyStartModel;
					this.surveyTerms = surveyTermsModel;
					this.authenticationMode = authMode;
					this.screeningQuestions = screeningQuestions;
					if (screeningQuestions['screeningQuestionLabels'] !== undefined) {
						let screeningModel = this.parseScreeningQuestionsModel(screeningQuestions);
						this.screeningQuestionsModel.next(screeningModel);
					} else {
						this.screeningQuestionsModel.next({
							questionsList: [],
							rejectionLink: screeningQuestions.survey.rejectionLink,
						});
					}
					this.restoreThemeInfo(styles);
					this.surveyData.next(this._surveyData);
					this.termsModel.next(surveyTermsModel);
					this.surveyAuthenticationMode.next(authMode);
					this.activeSurveyTitle.next(surveyStartModel.titleText);
					this.welcomeModel.next(surveyStartModel);
					this._isLoaded$.next(true);
				}
			);
		});
	}

	//

	/**
	 *
	 *
	 * @param {number} surveyId
	 * @param {string} groupcode
	 * @returns {Observable<any>}
	 * @memberof SurveyViewerService
	 */
	public validateSurveyGroupcode(surveyId: number, groupcode: string): Observable<any> {
		return this._surveyViewerEndpointService.getValidateSurveyGroupcodeUrlEndpoint(surveyId, groupcode);
	}

	/**
	 *
	 * @param surveyCode
	 */
	public getSurveyAuthenticationMode(surveyCode: string): Observable<any> {
		return this._surveyViewerEndpointService.getSurveyAuthenticationModeEndpoint(surveyCode);
	}

	/**
	 *
	 *
	 * @private
	 * @param {*} model
	 * @returns {SurveyViewScreening}
	 * @memberof SurveyViewerService
	 */
	private parseScreeningQuestionsModel(result: any): SurveyViewScreening {
		if (
			result.screenignQuestionLabels === null ||
			result.screenignQuestionLabels === undefined ||
			result.screenignQuestionLabels.length === 0
		) {
			return {
				questionsList: [],
				rejectionLink: result.survey.rejectionLink,
			};
		}

		let model = JSON.parse(result.screeningQuestionLabels[0].value);
		let questions = null;
		let header1 = null;
		let footer1 = null;
		let header2 = null;
		let footer = _find(model, (p) => p['sectionType'] === 'footer1');
		let header = _find(model, (p) => p['sectionType'] === 'header1');
		let header2i = _find(model, (p) => p['sectionType'] === 'header2');
		let screenignQuestions = _find(model, (p) => p['sectionType'] === 'screeningQuestions');
		if (footer !== undefined) {
			footer1 = this.parseJson(footer.html).html;
		}
		if (header !== undefined) {
			header1 = this.parseJson(header.html);
		}
		if (header2i !== undefined) {
			header2 = this.parseJson(header2i.html);
		}
		if (screenignQuestions !== undefined) {
			questions = this.parseJson(screenignQuestions.html);
		}
		return {
			questionsList: questions == null ? [] : (questions.questionsList as Array<string>),
			header1: header1,
			footer1: footer1,
			header2: header2i,
			rejectionLink: result.survey.rejectionLink,
		};
	}

	/**
	 *
	 *
	 * @private
	 * @param {string} jsonString
	 * @returns {*}
	 * @memberof SurveyViewerService
	 */
	private parseJson(jsonString: string): any {
		try {
			return JSON.parse(jsonString);
		} catch {
			return undefined;
		}
	}

	/**
	 * Restores theme info
	 * @param surveyId
	 */
	private restoreThemeInfo(styles: any): void {
		try {
			this._pageThemeInfoJson = styles;
			if (this._pageThemeInfoJson === null) {
				this._pageThemeInfoJson.viewerTemplate = '';
			}

			this.pageThemeInfoJson.next(this._pageThemeInfoJson);

			this.loadPageThemeInfo(this._pageThemeInfoJson);
		} catch (e) {
			console.error(e);
		}
		// this.finishedLoading = true;
	}

	/**
	 * Loads page theme info
	 * @param themeInfo
	 */
	public loadPageThemeInfo(themeInfo: any): void {
		this._pageThemeInfo.sectionBackgroundColour = themeInfo['householdHeaderColour'];
		this._pageThemeInfo.questionViewerColour = themeInfo['questionViewerColour'];
		// this._pageThemeInfo.viewerTemplate = JSON.parse(themeInfo['viewerTemplate']);
		this.pageThemeInfo.next(this._pageThemeInfo);
	}

	/**
	 *
	 *
	 * @memberof SurveyViewerService
	 */
	public ngOnInit(): void {}

	public isAdminUser(): boolean {
		if (!this._authService.isLoggedIn) {
			return false;
		}

		return this._authService.currentUser.roles.includes('super administrator');
	}

	/**
	 *
	 * @param surveyId
	 * @param language
	 */
	public getDefaultSurveyView(surveyId: number, language?: string): Observable<SurveyViewer> {
		return this._surveyViewerEndpointService.getDefaultSurveyViewEndpoint(surveyId, language);
	}

	/**
	 * Gets survey styles
	 * @param surveyId
	 * @returns survey styles
	 */
	public getSurveyStyles(surveyId: number): Observable<string> {
		return this._surveyViewerEndpointService.getSurveyStylesEndpoint<string>(surveyId);
	}

	/**
	 *
	 * @param surveyName
	 */
	public getWelcomeView(surveyName: string): Observable<SurveyStart> {
		return this._surveyViewerEndpointService.getSurveyViewerWelcomeViewEndpoint<SurveyStart>(surveyName);
	}

	/**
	 *
	 * @param surveyId
	 * @param page
	 * @param language
	 */
	public getSurveyViewerRespondentPageQuestions(surveyId: number, page: number, language?: string): Observable<any> {
		return this._surveyViewerEndpointService.getSurveyViewerRespondentPageQuestionsEndpoint(
			surveyId,
			page,
			language
		);
	}

	/**
	 * Retrieves Terms and Conditions Text
	 * @param surveyId
	 * @param viewType
	 * @param language
	 */
	public getSurveyViewerTermsAndConditions(
		surveyId: number,
		viewType?: SurveyViewType,
		language?: string
	): Observable<SurveyViewTermsModel> {
		return this._surveyViewerEndpointService.getSurveyViewerTermsAndConditionsEndpoint(
			surveyId,
			viewType,
			language
		);
	}

	/**
	 *
	 *
	 * @param {number} surveyId
	 * @param {string} [language]
	 * @returns {Observable<any>}
	 * @memberof SurveyViewerService
	 */
	public getSurveyViewerScreeningQuestions(surveyId: number, language?: string): Observable<any> {
		return this._surveyViewerEndpointService.getSurveyViewerScreeningQuestionsEndpoint(surveyId, language);
	}

	/**
	 * Retrieves Thank You Text
	 * @param surveyId
	 * @param viewType
	 * @param language
	 */
	public getSurveyViewerThankYou(
		surveyId: number,
		viewType?: SurveyViewType,
		language?: string
	): Observable<SurveyViewThankYouModel> {
		return this._surveyViewerEndpointService.getSurveyViewerThankYouEndpoint<SurveyViewThankYouModel>(
			surveyId,
			viewType,
			language
		);
	}

	/**
	 * Start the specified survey with the provided shortcode. This will also have a login action.
	 * This will also set the active survey id
	 * @param surveyId
	 * @param shortcode
	 */
	public surveyStart(surveyId: number, shortcode: string, queryParams?: Params): Observable<{}> {
		let result = this._surveyViewerEndpointService.getSurveyViewerStartSurveyEndpoint(
			surveyId,
			shortcode,
			queryParams
		);
		return result;
	}

	/**
	 * Starts the survey with the specified shortcode and groupcode. The created user account will be associated with
	 * both of the shortcodes.
	 * @param {number} surveyId
	 * @param {string} shortcode
	 * @param {string} groupcode
	 * @returns {Observable<any>}
	 * @memberof SurveyViewerService
	 */
	public startSurveyWithGroupcode(surveyId: number, groupcode: string, queryParams?: Params): Observable<any> {
		const result = this._surveyViewerEndpointService.getSurveyViewerStartSurveyWithGroupcodeEndpoint(
			surveyId,
			groupcode,
			queryParams
		);
		return result;
	}

	/**
	 *
	 * @param surveyId
	 */
	public setSurveyComplete(surveyId: number): Observable<any> {
		return this._surveyViewerEndpointService.getSurveyCompleteEndpoint(surveyId);
	}

	/**
	 * Authenticates the current user using the specified shortcode
	 * @param surveyId
	 * @param shortcode
	 */
	public surveyLogin(surveyId: number, shortcode: string): Observable<User> {
		return this._authService
			.surveyLogin(surveyId, shortcode, '', true)
			.pipe(
				tap((user) => {
					this.isLoggedIn.next(true);
				})
			)
			.pipe(share());
	}

	/**
	 * Returns the question configuration for specified question.
	 * @param questionId
	 */
	public getQuestionData(questionId: number): Observable<{}> {
		return this._surveyViewerEndpointService.getSurveyViewQuestionConfigurationEndpoint(questionId);
	}

	/**
	 * Restores the state of the service if the user is currently logged in.
	 */
	private restoreStatus(): void {
		if (
			this._authService.currentUser &&
			this._authService.currentUser.roles &&
			this._authService.isLoggedIn &&
			this._authService.currentUser.roles.includes('respondent')
		) {
			this._activeSurveyId = +this._authService.currentSurveyUser.surveyId;

			this.activeSurveyId.next(this._activeSurveyId);
		} else {
		}

		if (this._activeSurveyId < 0 || true) {
			let id$ = this._surveyViewerEndpointService.getSurveyIdFromCodeEndpoint(this.activeSurveyCode);

			id$.subscribe(
				(value) => {
					console.log(value);
					this._activeSurveyId = <number>value[Object.keys(value)[0]];
					this._activeSurveyTitle = <string>value[Object.keys(value)[2]];
					this.activeSurveyId.next(this._activeSurveyId);
					this.activeSurveyTitle.next(this._activeSurveyTitle);
				},
				(error) => {
					// console.log(error);
					this.router.navigate(['/', this.activeSurveyCode, 'error']);
				}
			);
		} else {
			this.activeSurveyId.next(this._activeSurveyId);
		}
	}

	/**
	 *
	 * @param canNavigate
	 */
	public updateNavigationState(canNavigate: boolean): void {
		// this._navigationState = canNavigate;
		this.navigationActiveState.next(canNavigate);
		return;
	}

	/**
	 *
	 * @param surveyId
	 * @param viewType
	 */
	public getSurveyViewPages(
		surveyId: number,
		viewType: SurveyViewType = SurveyViewType.RespondentView
	): Observable<SurveyViewPage[]> {
		return this._surveyViewerEndpointService.getSurveyViewPagesEndpoint(surveyId, viewType);
	}

	/**
	 *
	 * @param surveyId
	 * @param questionId
	 * @param language
	 * @param query
	 */
	public getQuestionOptions(
		surveyId: number,
		questionId: number,
		language?: string,
		query?: string
	): Observable<SurveyViewQuestionOption[]> {
		return this._surveyViewerEndpointService.getSurveyViewQuestionOptionsEndpoint(
			surveyId,
			questionId,
			language,
			query
		);
	}

	public preparePreviousSurveyResponses(respondent: SurveyRespondent, currentQuestionId: number): Observable<any> {
		// this._surveyState.viewerState.surveyQuestions;
		return Observable.of();
	}
}
