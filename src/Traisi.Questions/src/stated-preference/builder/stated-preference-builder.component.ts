import { AfterViewInit, Component, Inject, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	BUILDER_SERVICE,
	CustomBuilderOnHidden,
	CustomBuilderOnInit,
	CustomBuilderOnShown,
	QuestionOptionValue,
	QUESTION_ID,
	ResponseTypes,
	SurveyQuestion,
	SURVEY_ID,
	TraisiSurveyBuilder
} from 'traisi-question-sdk';
import demoConfig from './demo-config.model';
const defaultOption = {
	code: 'Response Options',
	name: 'Response Options',
	order: 0,

	optionLabel: {
		language: 'en',
		value: '{}'
	}
};

/**
 * Base question component definition for the question type "Stated Preference"
 *
 * @export
 * @class StatedPreferenceQuestionComponent
 * @extends {SurveyQuestion<ResponseTypes.String>}
 * @implements {OnInit}
 * @implements {OnVisibilityChanged}
 * @implements {OnSaveResponseStatus}
 */
@Component({
	selector: 'traisi-stated-preference-builder',
	template: require('./stated-preference-builder.component.html'),
	encapsulation: ViewEncapsulation.None,
	styles: [require('./stated-preference-builder.component.scss')]
})
export class StatedPreferenceBuilderComponent
	implements CustomBuilderOnInit, CustomBuilderOnHidden, CustomBuilderOnShown, OnInit, AfterViewInit {
	public modelOption: BehaviorSubject<QuestionOptionValue>;
	public modelJson: BehaviorSubject<any>;
	public editorOptions: JsonEditorOptions;
	@ViewChild(JsonEditorComponent, { static: true }) public editor: JsonEditorComponent;

	/**
	 *Creates an instance of StatedPreferenceBuilderComponent.
	 * @param {*} _builderService
	 * @param {TraisiSurveyBuilder} _surveyBuilder
	 * @memberof StatedPreferenceBuilderComponent
	 */
	public constructor(
		@Inject(BUILDER_SERVICE) private _surveyBuilder: TraisiSurveyBuilder,
		@Inject(QUESTION_ID) private _questionId: number,
		@Inject(SURVEY_ID) private _surveyId: number
	) {
		this.editorOptions = new JsonEditorOptions();
		this.modelJson = new BehaviorSubject<any>({});
		this.editorOptions.modes = ['code', 'tree', 'view', 'text'];
		this.modelOption = new BehaviorSubject<QuestionOptionValue>(defaultOption);

		this.modelOption
			.pipe(
				map(optionValue => {
					try {
						let data = JSON.parse(optionValue.optionLabel.value);
						return data;
					} catch (exception) {
						console.log(exception);
						return { error: true };
					}
				})
			)
			.subscribe(value => {
				this.modelJson.next(value);
			});
	}

	public ngAfterViewInit(): void {
		// something
	}

	public onUseSampleConfig(): void {
		this.modelJson.next(demoConfig);
		setTimeout(() => {
			this.editor.expandAll();
		});
	}

	/**
	 *
	 *
	 * @memberof StatedPreferenceBuilderComponent
	 */
	public customBuilderInitialized(injector?: Injector): void {}

	public customBuilderHidden(): void {
		console.log('SP hidden was called');
	}
	public customBuilderShown(): void {
		console.log('SP shown was called');
	}

	/**
	 * @memberof StatedPreferenceBuilderComponent
	 */
	public ngOnInit(): void {
		this._surveyBuilder.getQuestionPartOptions(this._surveyId, this._questionId, 'en').subscribe(result => {
			if (result.length > 0) {
				(<BehaviorSubject<QuestionOptionValue>>this.modelOption).next(result[0]);
			} else {
				(<BehaviorSubject<QuestionOptionValue>>this.modelOption).next(defaultOption);
			}
		});
	}

	/**
	 * @memberof StatedPreferenceBuilderComponent
	 */
	public onSave(): void {
		this.modelOption.value.optionLabel.value = this.editor.getText();
		this._surveyBuilder.setQuestionPartOption(this._surveyId, this._questionId, this.modelOption.value).subscribe({
			error: error => {
				console.log(error);
			}
		});
	}
}
