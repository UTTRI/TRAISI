import { Injectable } from '@angular/core';
import { SurveyRespondent, SurveyQuestion } from 'traisi-question-sdk';
import { Observable, EMPTY } from 'rxjs';
import { SurveyResponseClient, SurveyRespondentClient } from './survey-viewer-api-client.service';
import { SurveyViewerSession } from './survey-viewer-session.service';
import { tap } from 'rxjs/operators';
import { SurveyViewerStateService } from './survey-viewer-state.service';

@Injectable({
	providedIn: 'root',
})
export class SurveyViewerRespondentService {
	private _primaryRespondent: SurveyRespondent;

	public respondents: { [id: number]: SurveyRespondent } = {};

	public get primaryRespondent(): SurveyRespondent {
		return this._primaryRespondent;
	}

	public set primaryRespondent(respondent: SurveyRespondent) {
		this._primaryRespondent = respondent;
	}

	public constructor(
		private _respondentClient: SurveyRespondentClient,
		private _state: SurveyViewerStateService
	) {}

	public getSurveyPrimaryRespondent(surveyId: number): Observable<any> {
		return this._respondentClient.getSurveyPrimaryRespondent(surveyId);
	}

	/**
	 *
	 *
	 * @param {SurveyRespondent} respondent
	 * @returns {Observable<{}>}
	 * @memberof SurveyResponderService
	 */
	public addSurveyGroupMember(respondent: SurveyRespondent): Observable<number> {
		return this._respondentClient.addSurveyGroupMember(respondent).pipe(
			tap((r) => {
				this.respondents[r] = respondent;
				this._state.viewerState.groupMembers.push(respondent);
			})
		);
	}

	/**
	 *
	 *
	 * @param {number} respondentId
	 * @returns {Observable<{}>}
	 * @memberof SurveyResponderService
	 */
	public getSurveyGroupMembers(respondent: SurveyRespondent): Observable<SurveyRespondent[]> {
		return this._respondentClient.listSurveyGroupMembers(respondent.id);
	}

	/**
	 *
	 * @param respondent
	 */
	public removeSurveyGroupMember(respondent: SurveyRespondent): Observable<void> {
		return this._respondentClient.removeSurveyGroupMember(respondent.id).pipe(
			tap((r) => {
				delete this.respondents[respondent.id];
				let idx = this._state.viewerState.groupMembers.findIndex((i) => {
					return i.id === respondent.id;
				});
				if (idx >= 0) {
					this._state.viewerState.groupMembers.splice(idx, 1);
				}
			})
		);
	}

	/**
	 *
	 * @param respondent
	 */
	public updateSurveyGroupMember(respondent: SurveyRespondent): Observable<void> {
		return this._respondentClient.updateSurveyGroupMember(respondent).pipe(
			tap((r) => {
				if (this._primaryRespondent.id === respondent.id) {
					this._primaryRespondent = respondent;
					this._state.viewerState.primaryRespondent = respondent;
				}
				this.respondents[respondent.id] = respondent;

				let idx = this._state.viewerState.groupMembers.findIndex((i) => {
					return i.id === respondent.id;
				});
				if (idx >= 0) {
					this._state.viewerState.groupMembers[idx] = respondent; 
				}
			})
		);
	}
}
