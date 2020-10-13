import { Injectable } from '@angular/core';
import {
	SurveyQuestion,
	ResponseTypes,
	SurveyRespondent,
	ResponseData,
	ResponseValidationState,
	SurveyViewQuestion,
} from 'traisi-question-sdk';
import { SurveyViewerResponseService } from './survey-viewer-response.service';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ValidationState } from './survey-viewer-api-client.service';
import { SurveyViewerValidationStateViewModel } from 'traisi-question-sdk/survey-validation.model';

@Injectable()
export class QuestionInstanceState {
	private _questionModel: SurveyViewQuestion;
	private _questionInstance: SurveyQuestion<ResponseTypes>;
	private _respondent: SurveyRespondent;
	private _repeatIndex: number = 0;
	public get questionInstance(): SurveyQuestion<ResponseTypes> {
		return this._questionInstance;
	}

	public get guestionModel(): SurveyViewQuestion {
		return this._questionModel;
	}

	public get respondent(): SurveyRespondent {
		return this._respondent;
	}

	public get repeatNumber(): number {
		return this._repeatIndex;
	}

	public validationState$: BehaviorSubject<SurveyViewerValidationStateViewModel>;
	public constructor(private _responseService: SurveyViewerResponseService, private _navigator: SurveyNavigator) {}

	/**
	 * Initializes the instance state manager for the passed question
	 * @param respondent
	 * @param questionModel
	 * @param questionInstance
	 */
	public initialize(
		respondent: SurveyRespondent,
		questionModel: SurveyViewQuestion,
		questionInstance: SurveyQuestion<ResponseTypes>,
		repeatIndex: number = 0
	): void {
		this._repeatIndex = repeatIndex;
		this._respondent = respondent;
		this._questionInstance = questionInstance;
		this._questionModel = questionModel;
		this._questionInstance.response.subscribe(this.onSaveResponse);
		this._questionInstance.responseWithRespondent.subscribe(this.onSaveResponseWithRespondent);
		this._questionInstance.validationState.subscribe(this.onValidationStateChanged);
		this._questionInstance.respondent = respondent;
		this.validationState$ = new BehaviorSubject<SurveyViewerValidationStateViewModel>({
			isValid: false,
			clientValidationState: ResponseValidationState.PRISTINE,
			questionValidationState: {
				errorMessages: [],
				validationState: ValidationState.Untouched,
			},
			surveyLogicValidationState: {
				errorMessages: [],
				validationState: ValidationState.Untouched,
			},
		});

		// load the saved response
		this.loadSavedResponse();
	}

	public forceSaveResponse(): Observable<void> {
		this._responseService.forceSaveInvalidResponse(this._questionModel, this._respondent).subscribe((result) => {
			this.onResponseSaved(result);
		});
		return null;
	}

	private loadSavedResponse(): void {
		this._responseService
			.loadSavedResponse(this._questionModel, this._respondent, this._repeatIndex)
			.subscribe((response) => {
				this._questionInstance.savedResponse.next(
					response === undefined || response === null ? 'none' : response.responseValues
				);
				this._questionInstance.traisiOnLoaded();
			});
	}

	/**
	 * Handles saving a response when a question emits a new response
	 * @param response
	 */
	private onSaveResponse = (response: ResponseData<ResponseTypes>[] | ResponseData<ResponseTypes>[]): void => {
		// submit the response, convert it to single element
		// array if not done so
		this._responseService
			.saveResponse(
				this._questionModel,
				this._respondent,
				this._repeatIndex,
				Array.isArray(response) ? response : [response]
			)
			.subscribe(this.onResponseSaved);
	};

	/**
	 * Emits a saved response for a parituclar respondent
	 *
	 * @private
	 */
	private onSaveResponseWithRespondent = (response: {
		respondent: SurveyRespondent;
		response: ResponseData<ResponseTypes>[];
	}): void => {
		if (this.respondent.id === response.respondent.id) {
			this._responseService
				.saveResponse(
					this._questionModel,
					response.respondent,
					this._repeatIndex,
					Array.isArray(response.response) ? response.response : [response.response]
				)
				.subscribe(this.onResponseSaved);
		} else {
			this._responseService
				.saveResponse(
					this._questionModel,
					response.respondent,
					this._repeatIndex,
					Array.isArray(response.response) ? response.response : [response.response]
				)
				.subscribe();
		}
	};

	/**
	 * Handles the server response after a response has been saved.
	 * @param result
	 */
	private onResponseSaved = (result: SurveyViewerValidationStateViewModel): void => {
		if (result.isValid) {
			result.clientValidationState = ResponseValidationState.VALID;
		} else {
			result.clientValidationState = ResponseValidationState.INVALID;
		}
		this.validationState$.next(result);
		this.onValidationStateChanged(result);
		this._questionInstance.onResponseSaved();
		this._navigator.responseChanged();
	};

	/**
	 * @private
	 */
	private onValidationStateChanged = (
		state: SurveyViewerValidationStateViewModel | ResponseValidationState
	): void => {
		if (state.hasOwnProperty('isValid')) {
			this._navigator.updateQuestionValidationState(this, state as SurveyViewerValidationStateViewModel);
		} else {
			let responseState = state as ResponseValidationState;
			if (responseState === ResponseValidationState.VALID) {
				this._navigator.updateQuestionValidationState(this, {
					isValid: true,
					clientValidationState: ResponseValidationState.VALID,
					questionValidationState: {
						errorMessages: [],
						validationState: ValidationState.Valid,
					},
					surveyLogicValidationState: {
						errorMessages: [],
						validationState: ValidationState.Valid,
					},
				});
			} else if (responseState === ResponseValidationState.INVALID) {
				
				this._navigator.updateQuestionValidationState(this, {
					isValid: false,
					clientValidationState: ResponseValidationState.INVALID,
					questionValidationState: {
						errorMessages: [],
						validationState: ValidationState.Invalid,
					},
					surveyLogicValidationState: {
						errorMessages: [],
						validationState: ValidationState.Invalid,
					},
				});
			}
		}
	};
}
