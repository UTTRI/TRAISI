import { Injectable, Inject } from '@angular/core';
import { SurveyViewerState } from '../models/survey-viewer-state.model';
import {
	BehaviorSubject,
	ReplaySubject,
	Subject,
	Observable,
	Observer,
	forkJoin,
	AsyncSubject,
	EMPTY,
	of,
	pipe,
	empty,
} from 'rxjs';
import { ResponseValidationState } from 'traisi-question-sdk';
import { SurveyViewGroupMember } from '../models/survey-view-group-member.model';
import { NavigationStart } from '@angular/router';
import { NavigationState } from 'app/models/navigation-state.model';
import { SurveyResponseClient } from './survey-viewer-api-client.service';
import { SurveyViewerSession } from './survey-viewer-session.service';
import { SurveyViewerSessionData } from 'app/models/survey-viewer-session-data.model';

@Injectable({
	providedIn: 'root',
})
export class SurveyViewerStateService {
	public static readonly SURVEY_QUESTIONS_CHANGED: string = 'SURVEY_QUESTIONS_CHANGED';

	public viewerState: SurveyViewerState;

	public surveyViewerState: ReplaySubject<SurveyViewerState>;

	public surveyQuestionsChanged: Subject<string>;

	private _data: SurveyViewerSessionData;

	/**
	 * Creates an instance of survey viewer state service.
	 * @param _conditionalEvaluator
	 * @param _responderService
	 */
	public constructor(private _client: SurveyResponseClient, private _session: SurveyViewerSession) {
		this.viewerState = {
			surveyPages: [],
			pageStates: {},
			sectionStates: {},
			activePage: undefined,
			surveyQuestions: [],
			surveyQuestionsFull: [],
			activeQuestionIndex: -1,
			surveyAccessTime: undefined,
			activePageIndex: -1,
			groupMembers: [],
			activeGroupMemberIndex: -1,
			activeRepeatIndex: -1,
			primaryRespondent: undefined,
			activeGroupQuestions: [],
			isNavProcessing: false,
			questionMap: {},
			questionViewMap: {},
			questionTypeMap: {},
			sectionMap: {},
			questionBlocks: [],
			questionTree: [],
			questionNameMap: {},
		};

		this.surveyViewerState = new ReplaySubject<SurveyViewerState>();
		this.surveyQuestionsChanged = new Subject<string>();
	}

	public initialize(): Observable<void> {
		// loop over each
		return new Observable((obs) => {
			for (let page of this.viewerState.surveyPages) {
				this.viewerState.pageStates[page.id] = {
					isCompleted: false,
					isVisited: false,
				};
			}
			this._client
				.getSurveyCompletionStatus(this._session.surveyId, this.viewerState.primaryRespondent.id)
				.subscribe((r) => {
					for (let qId of r.completedQuestionIds) {
						if (qId in Object.keys(this.viewerState.questionMap)) {
							this.viewerState.pageStates[
								this.viewerState.surveyPages[this.viewerState.questionMap[qId]?.pageIndex]?.id
							].isVisited = true;
						}
					}
				});
			obs.complete();
		});
	}

	/**
	 *
	 * @param navState
	 */
	public updateStates(navState: NavigationState): void {
		if (navState.activePage) {
			this.viewerState.pageStates[navState.activePage?.id].isVisited = true;
		}
	}
}
