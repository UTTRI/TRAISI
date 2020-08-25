import { OnInit, Component, OnDestroy, ViewChild, ViewEncapsulation, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { QueryBuilderClassNames, QueryBuilderComponent, Rule, Entity } from 'angular2-query-builder';
import { classNames, entityMap, entityTypes as entityTypeMap, SurveyLogicQueryEntityType } from './query-config';
import { SurveyBuilderEditorData } from '../services/survey-builder-editor-data.service';
import { QuestionPartView } from '../models/question-part-view.model';
import { Observable, concat, of, Subject, forkJoin, zip, combineLatest, pipe } from 'rxjs';
import { QuestionOptionValueViewModel, SurveyBuilderClient, SurveyLogicRulesModel } from '../services/survey-builder-client.service';
import { QuestionResponseType } from '../models/question-response-type.enum';
import { tap, distinctUntilChanged, debounceTime, skip, first, concatMap } from 'rxjs/operators';
import { GeneratedIdsViewModel } from 'shared/models/generated-ids-view-model.model';
import { UtilService } from 'shared/services/util.service';
import { SurveyLogic } from '../models/survey-logic.model';
import { SurveyLogicQueryConfig, SurveyLogicField } from './survey-logic-query-builder-config.model';
import { SurveyLogicQueryBuilderComponent } from '../components/survey-logic-query-builder/survey-logic-query-builder.component';
@Component({
	selector: 'traisi-survey-logic-control',
	templateUrl: './survey-logic-control.component.html',
	styleUrls: ['./survey-logic-control.component.scss'],
	providers: [],
	animations: [],
	encapsulation: ViewEncapsulation.None,
})
export class SurveyLogicControlComponent implements OnInit, OnDestroy {

	@ViewChild('queryBuilder')
	public queryBuilder: SurveyLogicQueryBuilderComponent;

	public model: SurveyLogic;

	public source: Observable<SurveyLogicRulesModel[]>;

	/**
	 *Creates an instance of SurveyLogicControlComponent.
	 * @param {SurveyBuilderEditorData} _editor
	 */
	public constructor(
		private _editor: SurveyBuilderEditorData,
		private _builder: SurveyBuilderClient,
		private _util: UtilService
	) {

	}


	/**
	 * Called when the underlying query builder model changes
	 * @param model 
	 */
	public onModelChanged(model: SurveyLogic): void {
		this._builder
			.updateSurveyLogic(this._editor.surveyId, this._editor.activeLanguage, model)
			.subscribe((v: GeneratedIdsViewModel) => {
				this._util.copyIds(v, model, 'rules');
			});
	}

	/**
	 * 
	 * @param logic 
	 */
	public onLogicDeleted(logic: SurveyLogic): void {
		this._builder.deleteSurveyLogic(this._editor.surveyId, logic.id).subscribe((v) => {

		});
	}

	/**
	 * 
	 * @param logic 
	 */
	public onLogicAdded(logic: SurveyLogic): void {
		this._builder.addSurveyLogic(this._editor.surveyId, this._editor.activeLanguage, logic).subscribe((v) => {
			logic.id = v;
		});
	}

	public ngOnInit(): void {
		this.source = this._builder.getSurveyLogic(this._editor.surveyId, this._editor.activeLanguage);
	}
	public ngOnDestroy(): void { }


}
