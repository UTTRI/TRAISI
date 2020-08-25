import {
	OnInit,
	Component,
	OnDestroy,
	ViewChild,
	ViewEncapsulation,
	ViewChildren,
	QueryList,
	Output,
	EventEmitter,
	Input,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { QueryBuilderClassNames, QueryBuilderComponent, Rule, Entity } from 'angular2-query-builder';
import { classNames, entityMap, entityTypes as entityTypeMap, SurveyLogicQueryEntityType } from './query-config';
import { Observable, concat, of, Subject, forkJoin, zip, combineLatest, pipe } from 'rxjs';
import { tap, distinctUntilChanged, debounceTime, skip, first, concatMap } from 'rxjs/operators';
import { GeneratedIdsViewModel } from 'shared/models/generated-ids-view-model.model';
import { UtilService } from 'shared/services/util.service';
import { SurveyLogicQueryConfig, SurveyLogicField } from './survey-logic-query-builder-config.model';
import {
	QuestionOptionValueViewModel,
	SurveyBuilderClient,
	SurveyLogicRulesModel,
} from 'app/survey-builder/services/survey-builder-client.service';
import { SurveyLogic } from 'app/survey-builder/models/survey-logic.model';
import { QuestionPartView } from 'app/survey-builder/models/question-part-view.model';
import { SurveyBuilderEditorData } from 'app/survey-builder/services/survey-builder-editor-data.service';
import { QuestionResponseType } from 'app/survey-builder/models/question-response-type.enum';
@Component({
	selector: 'traisi-survey-logic-query-builder',
	templateUrl: './survey-logic-query-builder.component.html',
	styleUrls: ['./survey-logic-query-builder.component.scss'],
	providers: [],
	animations: [],
	encapsulation: ViewEncapsulation.None,
})
export class SurveyLogicQueryBuilderComponent implements OnInit, OnDestroy, OnChanges {
	public classNames: QueryBuilderClassNames;
	public config: SurveyLogicQueryConfig;

	@ViewChildren('queryBuilder')
	public queryBuilder: QueryList<QueryBuilderComponent>;

	public options$: Observable<QuestionOptionValueViewModel[]>;

	public queryModels: Array<SurveyLogic> = [];

	public modelChanged$: Subject<SurveyLogic> = new Subject<SurveyLogic>();

	public optionsMap: Map<string, Observable<QuestionOptionValueViewModel[]>> = new Map<
		string,
		Observable<QuestionOptionValueViewModel[]>
	>();

	public isLoaded$: Subject<boolean> = new Subject<boolean>();

	public isOptionsLoaded: boolean = true;

	public questionList$: Observable<QuestionPartView[]>;

	public entityTypes: Array<Entity> = entityTypeMap;

	private _source: Observable<SurveyLogicRulesModel[]>;

	@Input()
	public surveyLogic: SurveyLogic;

	@Output()
	public onLogicChanged: EventEmitter<Rule> = new EventEmitter();

	@Output()
	public onLogicAdded: EventEmitter<Rule> = new EventEmitter();

	@Output()
	public onLogicDeleted: EventEmitter<Rule> = new EventEmitter();

	@Input()
	public showValidationQuestion: boolean = false;

	@Input()
	public showValidationMessage: boolean = false;

	@Input()
	public allowMultipleLogic: boolean = true;

	@Input()
	public set source(val: Observable<SurveyLogicRulesModel[]>) {
		this._source = val;
		this._initSource();
	}

	/**
	 *Creates an instance of SurveyLogicControlComponent.
	 * @param {SurveyBuilderEditorData} _editor
	 */
	public constructor(
		private _editor: SurveyBuilderEditorData,
		private _builder: SurveyBuilderClient,
		private _util: UtilService
	) {
		this.config = { fields: { tmp: { name: 'temp', type: 'number' } } };
		this.classNames = classNames;
	}

	/**
	 *
	 * @param id
	 */
	public options(id: string): Observable<QuestionOptionValueViewModel[]> {
		return this.optionsMap.get(id.split('.')[0]);
	}

	/**
	 *
	 * @param $event
	 * @param index
	 */
	public onModelChange($event: SurveyLogic, index: number): void {
		this.queryModels[index] = $event;
		this.modelChanged$.next($event);
	}
	public onValidationMessageModelChange($event: string, index: number): void {
		this.queryModels[index].message = $event;
		this.modelChanged$.next(this.queryModels[index]);
	}

	public onOptionModelChange($event: Array<QuestionOptionValueViewModel>, index: number, rule: Rule): void {
		let value = $event.map((i) => i.code);
		rule.value = value;
		this.modelChanged$.next(this.queryModels[index]);
		
		
	}

	public onFieldValueChanged($event: SurveyLogicField, rule: Rule) {
		rule.field = '' + $event;
	}

	public onResponseTypeValueChanged($event, index: number, rule: Rule): void {
		rule.value = $event.questionPart?.id;
		this.modelChanged$.next(this.queryModels[index]);
	}

	public onEntityTypeChanged($event: Entity) {}

	public onValidationQuestionModelChange($event: QuestionPartView, index: number): void {
		this.queryModels[index].validationQuestionId = $event.questionPart?.id;
		this.modelChanged$.next(this.queryModels[index]);
	}

	public addLogic(): void {
		let logic = { condition: 'and', rules: [], message: '', id: 0, validationQuestionId: null };
		this.queryModels.push(logic);
		this.onLogicAdded.emit(<any>logic);
	}

	/**
	 * Deletes the logic set from the survey
	 * @param i
	 */
	public deleteLogic(i: number): void {
		this.onLogicDeleted.emit(<any>this.queryModels[i]);
		this.queryModels.splice(i, 1);
	}

	public ngOnInit(): void {
		// load survey state

		this.questionList$ = this._editor.questionListChanged.pipe(distinctUntilChanged());
		this._editor.questionListChanged.subscribe((questionList) => {
			if (questionList.length > 0) {
				this.buildConfig(questionList);
				this.isLoaded$.next(true);
			}
		});

		// only send an update to the server every 500 ms of a model change
		this.modelChanged$.pipe(skip(1), debounceTime(1000)).subscribe((model) => {
			this.surveyLogic = model;
			this.onLogicChanged.emit(<any>model);
		});
	}

	/**
	 * Initializes the source for the conditionals
	 */
	private _initSource(): void {
		/*if (this._source) {
			
		}*/
	}

	/**
	 *
	 * @param changes
	 */
	public ngOnChanges(changes: SimpleChanges): void {
		if (changes['source'] && this._source) {
			let sub = this.isLoaded$.subscribe((v) => {
				this._source.subscribe((m) => {
					this.queryModels = <Array<SurveyLogic>>m;
					if (!this.allowMultipleLogic && this.queryModels.length === 0) {
						this.addLogic();
					}
				});
				sub.unsubscribe();
			});
		}
	}

	/**
	 *
	 * @param v
	 * @param model
	 */
	public updateIds(v: GeneratedIdsViewModel, model: SurveyLogic): void {
		this._util.copyIds(v, model, 'rules');
	}

	public ngOnDestroy(): void {}

	/**
	 * @param {string} questionName
	 * @returns {Observable<QuestionOptionValueViewModel[]>}
	 */
	public getQuestionOptions(questionName: string): Observable<QuestionOptionValueViewModel[]> {
		return this._editor.getQuestionOptions(
			this._editor.questionList.find((q) => q.questionPart.name == questionName)
		);
	}

	/**
	 * Maps question name to a query for of its option values
	 * @param questionName
	 */
	private initQuestionOptionsQuery(questionList: Array<QuestionPartView>, questionId: string): void {
		// this.isOptionsLoaded = false;
		this.optionsMap.set(
			questionId,
			concat(
				of([]),
				this._editor
					.getQuestionOptions(questionList.find((q) => q.questionPart.id === Number(questionId)))
					.pipe(
						distinctUntilChanged(),
						tap((v) => {
							this.isOptionsLoaded = true;
						})
					)
			)
		);
	}

	/**
	 *
	 * @param questionList
	 */
	private buildConfig(questionList: Array<QuestionPartView>): void {
		this.config = { fields: {} };

		this.config.entities = entityMap;

		for (let question of questionList) {
			let responseType = this._editor.questionTypeMap.get(question.questionPart.questionType).responseType;
			if (responseType == QuestionResponseType.Number) {
				this.config.fields[question.questionPart.id + '.value'] = {
					entity: entityTypeMap[1].value,
					name: question.questionPart.name,
					type: 'number',
					value: question.questionPart.id + '.value',
					questionId: -1,
				};
			} else if (responseType == QuestionResponseType.Location) {
				this.config.fields[question.questionPart.id + '.response'] = {
					entity: entityTypeMap[0].value,
					name: question.questionPart.name,
					type: 'response',
					value: question.questionPart.id + '.response',
					operators: ['!=', '='],
					questionId: -1,
				};
			} else if (
				responseType == QuestionResponseType.OptionSelect ||
				responseType == QuestionResponseType.OptionList
			) {
				this.initQuestionOptionsQuery(questionList, String(question.questionPart.id));
				this.config.fields[question.questionPart.id + '.value'] = {
					entity: entityTypeMap[1].value,
					name: question.questionPart.name,
					type: 'option',
					operators: ['any of', 'all of', 'none of'],
					value: question.questionPart.id + '.value',
					questionId: -1,
				};
			} else {
				this.config.fields[question.questionPart.id + '.value'] = {
					entity: entityTypeMap[1].value,
					name: question.questionPart.name,
					type: 'string',
					value: question.questionPart.id + '.value',
					questionId: -1,
				};
				this.config.fields[question.questionPart.id + '.response'] = {
					entity: entityTypeMap[0].value,
					name: question.questionPart.name,
					type: 'response',
					value: question.questionPart.id + '.response',
					operators: ['any of', 'all of', 'none of'],
					questionId: -1,
				};
			}
		}
	}
}
