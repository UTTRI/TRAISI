import { Injectable, Inject } from '@angular/core';
import {
	SurveyRespondent,
	SurveyQuestion,
	ResponseData,
	ResponseTypes,
	SurveyRespondentService,
	SurveyResponseViewModel,
	SurveyResponseService,
	SurveyViewQuestion,
	TraisiValues,
} from 'traisi-question-sdk';
import { Observable, EMPTY } from 'rxjs';
import { SurveyResponseClient, QuestionResponseType } from './survey-viewer-api-client.service';
import { SurveyViewerSession } from './survey-viewer-session.service';
import { tap } from 'rxjs/operators';
import { SurveyViewerValidationStateViewModel } from 'traisi-question-sdk';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';

@Injectable({
	providedIn: 'root',
})
export class SurveyViewerResponseService extends SurveyResponseService {
	private _responses: Record<number, Record<number, Array<ResponseData<ResponseTypes>>>> = {};
	private _invalidResponses: Record<number, Record<number, Array<ResponseData<ResponseTypes>>>> = {};

	public constructor(
		private _responseClient: SurveyResponseClient,
		private _session: SurveyViewerSession // @Inject(TraisiValues.SurveyId) private _surveyId: number
	) {
		super();
	}

	/**
	 * Gets the stored response for the passed respondent and question, this will return null
	 * if the response does not alreadyt exist. This only retrieves a local copy of the response.
	 * @param question
	 * @param respondent
	 */
	public getStoredResponse(
		question: SurveyViewQuestion,
		respondent: SurveyRespondent
	): Array<ResponseData<ResponseTypes>> {
		if (!this.hasStoredResponse(question, respondent)) {
			throw Error('Asking to retrieve a response that does not exist yet.');
		}
		return this._responses[respondent.id]?.[question.questionId];
	}

	private _getStoredInvalidResponse(
		question: SurveyViewQuestion,
		respondent: SurveyRespondent
	): Array<ResponseData<ResponseTypes>> {
		if (!this._hasStoredInvalidResponse(question, respondent)) {
			throw Error('Asking to retrieve a stored (invalid) response that does not exist yet.');
		}
		return this._invalidResponses[respondent.id]?.[question.questionId];
	}

	/**
	 * Excludes specified questions in the database.
	 * @param questionIds
	 * @param respondent
	 */
	public excludeResponses(questionIds: SurveyViewQuestion[], respondent: SurveyRespondent, shouldExclude: boolean = true): Observable<any> {
		return this._responseClient.excludeResponses(
			this._session.surveyId,
			respondent.id,
			shouldExclude,
			questionIds.map((x) => x.questionId)
		);
	}

	/**
	 *
	 * @param surveyId
	 * @param type
	 */
	public listSurveyResponsesOfType(surveyId: number, type: QuestionResponseType): Observable<any> {
		return this._responseClient.listResponsesOfType(surveyId, type);
	}

	/**
	 * Determines if a response already exists for the question and respondent
	 * @param question
	 * @param respondent
	 */
	public hasStoredResponse(question: SurveyViewQuestion, respondent: SurveyRespondent): boolean {
		if (!respondent) {
			return false;
		} else if (this._responses[respondent.id]?.[question.questionId]) {
			return true;
		}
		return false;
	}

	private _hasStoredInvalidResponse(question: SurveyViewQuestion, respondent: SurveyRespondent): boolean {
		if (!respondent) {
			return false;
		} else if (this._invalidResponses[respondent.id]?.[question.questionId]) {
			return true;
		}
		return false;
	}

	/**
	 * Stores the passed response for the associated respondent and question/
	 * @param question
	 * @param respondent
	 * @param response
	 */
	public storeResponse(
		question: SurveyViewQuestion,
		respondent: SurveyRespondent,
		response: Array<ResponseData<ResponseTypes>>
	): void {
		this._storeResponse(question.questionId, respondent, response);
	}

	private _storeResponse(
		questionId: number,
		respondent: SurveyRespondent,
		response: Array<ResponseData<ResponseTypes>>
	): void {
		// check if a store already exists for this respondent
		if (!this._responses[respondent.id]) {
			this._responses[respondent.id] = {};
		}
		this._responses[respondent.id][questionId] = response;
	}

	/**
	 *
	 * @param questionId
	 * @param respondent
	 * @param response
	 */
	private _storeInvalidResponse(
		questionId: number,
		respondent: SurveyRespondent,
		response: Array<ResponseData<ResponseTypes>>
	): void {
		if (!this._invalidResponses[respondent.id]) {
			this._invalidResponses[respondent.id] = {};
		}
		this._invalidResponses[respondent.id][questionId] = response;
	}

	/**
	 * Saves the response on the server
	 * @param question
	 * @param respondent
	 * @param repeat
	 * @param responseData
	 */
	public saveResponse(
		question: SurveyViewQuestion,
		respondent: SurveyRespondent,
		repeat: number = 0,
		responseData: Array<ResponseData<ResponseTypes>>
	): Observable<SurveyViewerValidationStateViewModel> {
		return new Observable((obs) => {
			this._responseClient
				.saveResponse(
					this._session.surveyId,
					question.questionId,
					respondent.id,
					repeat,
					this._session.language,
					false,
					responseData
				)
				.subscribe((result) => {
					if (result.isValid) {
						// store the passed response if valid
						this._storeResponse(question.questionId, respondent, responseData);
					} else {
						this._storeInvalidResponse(question.questionId, respondent, responseData);
					}
					obs.next(result);
				});
		});
	}

	/**
	 *
	 * @param question
	 * @param respondent
	 * @param repeat
	 */
	public forceSaveInvalidResponse(
		question: SurveyViewQuestion,
		respondent: SurveyRespondent,
		repeat: number = 0
	): Observable<SurveyViewerValidationStateViewModel> {
		{
			return new Observable((obs) => {
				this._responseClient
					.saveResponse(
						this._session.surveyId,
						question.questionId,
						respondent.id,
						repeat,
						this._session.language,
						true,
						this._getStoredInvalidResponse(question, respondent)
					)
					.subscribe((result) => {
						if (result.isValid) {
							// store the passed response if valid
							this._storeResponse(
								question.questionId,
								respondent,
								this._getStoredInvalidResponse(question, respondent)
							);
						} else {
							this._storeInvalidResponse(
								question.questionId,
								respondent,
								this._getStoredInvalidResponse(question, respondent)
							);
						}
						obs.next(result);
					});
			});
		}
	}

	/**
	 * Loads a saved response (from server) and stores it in the response cache. The restored response
	 * is then returned.
	 * @param question
	 * @param respondent
	 * @param repeat
	 */
	public loadSavedResponse(
		question: SurveyViewQuestion,
		respondent: SurveyRespondent,
		repeat: number = 0
	): Observable<SurveyResponseViewModel> {
		return this._responseClient
			.getResponse(this._session.surveyId, question.questionId, respondent.id, repeat)
			.pipe(
				tap((response: SurveyResponseViewModel) => {
					if (response) {
						// only store a response if it exists
						this._storeResponse(question.questionId, respondent, response.responseValues);
					}
				})
			);
	}
	/**
	 * Preloads / retrieves a set of responses in bulk and stores them for later access.
	 * @param questionIds A list of question IDs to load responses for.
	 * @param respondent  The respondent to load respones for
	 */
	public loadSavedResponses(questions: Array<SurveyViewQuestion>, respondent: SurveyRespondent): Observable<void> {
		let queryIds = [];
		for (let question of questions) {
			if (!this.hasStoredResponse(question, respondent)) {
				queryIds.push(question.questionId);
			}
		}
		// if there are no ids to query, return immediately
		if (queryIds.length === 0) {
			return EMPTY;
		}
		return new Observable((obs) => {
			this._responseClient
				.listSurveyResponsesForQuestions(this._session.surveyId, queryIds, respondent.id)
				.subscribe({
					next: (responses) => {
						// store each response
						for (let response of responses) {
							this._storeResponse(response.questionId, respondent, response.responseValues);
						}
					},
					complete: () => {
						obs.complete();
					},
				});
		});
	}

	/**
	 *	Preloads all of the existing response information for the passed questions
	 *	for all of teh passed respondents. It is possible for responses to not exist,
	 *	which is normal behaviour and will return empty results.
	 *
	 * @param {Array<SurveyViewQuestion>} questions
	 * @param {Array<SurveyRespondent>} respondents
	 * @returns {Observable<{ [respondentId: number]: Array<ResponseData<ResponseTypes>> }>}
	 */
	public loadSavedResponsesForRespondents(
		questions: Array<SurveyViewQuestion>,
		respondents: Array<SurveyRespondent>
	): Observable<SurveyResponseViewModel[]> {
		let queryIds = [];
		for (let question of questions) {
			for (let respondent of respondents) {
				if (!this.hasStoredResponse(question, respondent)) {
					queryIds.push(question.questionId);
				}
			}
		}
		if (queryIds.length === 0) {
			// return empty, data already exists for these respondents
			return EMPTY;
		}
		return new Observable((obs) => {
			this._responseClient
				.listSurveyResponsesForQuestionsForMultipleRespondents(
					this._session.surveyId,
					queryIds,
					respondents.map((r) => r.id)
				)
				.subscribe({
					next: (responses) => {
						// store each response
						for (let response of responses) {
							this._storeResponse(response.questionId, response.respondent, response.responseValues);
						}
						obs.next(responses);
					},
					complete: () => {
						obs.complete();
					},
				});
		});
	}

	/**
	 * Deletes all responses for the passed respondent.
	 * @param respondent
	 */
	public deleteAllResponses(respondent: SurveyRespondent): Observable<any> {
		return this._responseClient.deleteAllResponses(this._session.surveyId, respondent.id);
	}
}
