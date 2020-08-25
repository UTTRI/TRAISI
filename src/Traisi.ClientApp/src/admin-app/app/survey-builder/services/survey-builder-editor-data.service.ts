import { Injectable } from '@angular/core';
import { Observable, EMPTY, forkJoin, Observer, Subject, BehaviorSubject } from 'rxjs';
import { SurveyBuilderClient, QuestionOptionValueViewModel } from './survey-builder-client.service';
import { QuestionClient } from './survey-builder-client.service';
import { QuestionTypeDefinition } from '../models/question-type-definition';
import { TreeviewItem } from 'ngx-treeview';
import { QuestionPartView } from '../models/question-part-view.model';
import { SurveyBuilderService } from './survey-builder.service';
import { SurveyViewStructure } from '../models/survey-view-structure.model';
import { tap } from 'rxjs/operators';
/**
 *
 *
 * @export
 * @class SurveyBuilderEditorData
 */
@Injectable()
export class SurveyBuilderEditorData {
	public surveyId: number;

	public questionTypeDefinitions: QuestionTypeDefinition[];

	public questionTypeMap: Map<string, QuestionTypeDefinition> = new Map<string, QuestionTypeDefinition>();

	public surveyStructure: SurveyViewStructure;

	public currentPage: QuestionPartView;

	public questionList: Array<QuestionPartView>;

	public questionListChanged: BehaviorSubject<Array<QuestionPartView>> = new BehaviorSubject<Array<QuestionPartView>>([]);

	public activeLanguage: string = "en";

	/**
	 * Initializes required config data and related information for the survey builder
	 * editing session.
	 * @param surveyId
	 */
	public initialize(surveyId: number): Observable<void> {
		this.surveyId = surveyId;

		return Observable.create((obs: Observer<void>) => {
			forkJoin(this._builderService.getQuestionTypes()).subscribe({
				next: (result) => {
					this.questionTypeDefinitions = result[0];
					this.mapQuestionTypeDefinitions();
				},
				complete: () => {
					obs.complete();
				},
			});
		});
	}

	/**
	 *
	 * @param viewName
	 * @param language
	 */
	public updateSurveyStructure(
		viewName: string = 'Standard',
		language: string = 'en'
	): Observable<SurveyViewStructure> {
		return this._client.getSurveyViewPageStructure(this.surveyId, viewName, language).pipe(
			tap((value) => {
				this.surveyStructure = value;
				this.updateQuestionList();
			})
		);
	}

	/**
	 *	Updates the question list by flattening the survey structure.
	 */
	public updateQuestionList(): void {
		this.questionList = [];
		for (let page of this.surveyStructure.pages) {
			for (let question of page.questionPartViewChildren) {
				if (question.questionPart) {
					// this is a question and not a section, add it to list
					this.questionList.push(question);
				}
				for (let subQuestion of question.questionPartViewChildren) {
					if (subQuestion.questionPart) {
						this.questionList.push(subQuestion);
					}
				}
			}
		}

		this.questionListChanged.next(this.questionList);
	}

	/**
	 *
	 */
	private mapQuestionTypeDefinitions(): void {
		this.questionTypeDefinitions.forEach((q) => {
			this.questionTypeMap.set(q.typeName, q);
		});
	}

	/**
	 *Creates an instance of SurveyBuilderEditorData.
	 * @param {SurveyBuilderClient} _client
	 * @param {QuestionClient} _questionClient
	 */
	public constructor(
		private _client: SurveyBuilderClient,
		private _questionClient: QuestionClient,
		private _builderService: SurveyBuilderService
	) {}

	/**
	 * @param {QuestionPartView} question
	 * @returns {Observable<QuestionOptionValueViewModel[]>}
	 */
	public getQuestionOptions(question: QuestionPartView): Observable<QuestionOptionValueViewModel[]> {
		return this._client
			.getQuestionPartOptions(this.surveyId, question.questionPart?.id, 'en')
			.pipe(tap((options) => {
			}));
	}
}
