import { AfterViewInit, Component, Inject, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { table } from 'console';
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
	TraisiSurveyBuilder,
} from 'traisi-question-sdk';
import demoConfig from './demo-config.model';
const defaultOption = {
	code: 'Response Options',
	name: 'Response Options',
	order: 0,

	optionLabel: {
		language: 'en',
		value: '{}',
	},
};

import template from './static-stated-preference-builder.component.html';
import style from './static-stated-preference-builder.component.scss';

export interface SpTableOption {
	columnHeaders: Array<string>;
	rowHeaders: Array<string>;
	cellData: Array<Array<string>>;
}
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
	selector: 'traisi-static-stated-preference-builder',
	template: '' + template,
	encapsulation: ViewEncapsulation.None,
	styles: ['' + style],
})
export class StaticStatedPreferenceBuilderComponent
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
				map((optionValue) => {
					try {
						let data = JSON.parse(optionValue.optionLabel.value);
						return data;
					} catch (exception) {
						console.log(exception);
						return { error: true };
					}
				})
			)
			.subscribe((value) => {
				this.modelJson.next(value);
			});
	}

	public ngAfterViewInit(): void {
		// something
	}

	/**
	 * Attempts to read csv file from passed file description
	 * @param file 
	 */
	public readCsvFile(file: File): void {
		var reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = (evt) => {
			console.log(evt.target.result);
			let result = this._csvToArray(evt.target.result, ",");
			console.log(result);
			let spResult = this._generateStaticSpTableOptions(result);
			this._saveSpTableData(spResult);
			console.log(spResult);
		}
		reader.onerror = (evt) => {
			console.log('error reading file');
		}
	}

	private _generateStaticSpTableOptions(tableData: Array<Array<string>>): Array<SpTableOption> {
		let tableOptions = [];
		let tableOption: SpTableOption;
		let rowIndex = 0;
		for (let row of tableData) {
			if (row[0] == '#') {
				rowIndex = 0;
				// push current active tableOption
				if (tableOption) {
					tableOptions.push(tableOption);
				}

				// append new table option
				tableOption = {
					columnHeaders: [],
					rowHeaders: [],
					cellData: [[]]
				}

				for (let i = 1; i < row.length; i++) {
					tableOption.columnHeaders.push(row[i]);
				}
			}
			else {
				// just a standard row
				if (!tableOption.cellData[rowIndex]) {
					tableOption.cellData[rowIndex] = [];
				}
				tableOption.rowHeaders.push(row[0]);
				for (let i = 1; i < row.length; i++) {
					tableOption.cellData[rowIndex].push(row[i]);
				}
				rowIndex++;
			}
		}
		console.log(tableOption);
		tableOptions.push(tableOption);

		return tableOptions;
	}


	/**
	 *
	 *
	 * @memberof StatedPreferenceBuilderComponent
	 */
	public customBuilderInitialized(injector?: Injector): void { }

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
		this._surveyBuilder.getQuestionPartOptions(this._surveyId, this._questionId, 'en').subscribe((result) => {
			if (result.length > 0) {
				(<BehaviorSubject<QuestionOptionValue>>this.modelOption).next(result[0]);
			} else {
				(<BehaviorSubject<QuestionOptionValue>>this.modelOption).next(defaultOption);
			}
		});
		console.log('loaded static sp builder');
	}

	private _saveSpTableData(data): void {
		this.modelOption.value.optionLabel.value = JSON.stringify(data);
		this._surveyBuilder.setQuestionPartOption(this._surveyId, this._questionId, this.modelOption.value).subscribe({
			error: (error) => {
				console.log(error);
			},
		});
	}

	/**
	 * @memberof StatedPreferenceBuilderComponent
	 */
	public onSave(): void {
		this.modelOption.value.optionLabel.value = this.editor.getText();

	}
	private _csvToArray(strData, strDelimiter): Array<Array<string>> {
		// Check to see if the delimiter is defined. If not,
		// then default to comma.
		strDelimiter = (strDelimiter || ",");

		// Create a regular expression to parse the CSV values.
		var objPattern = new RegExp(
			(
				// Delimiters.
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

				// Quoted fields.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

				// Standard fields.
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
		);


		let arrData = [[]];

		var arrMatches = null;
		while (arrMatches = objPattern.exec(strData)) {

			// Get the delimiter that was found.
			var strMatchedDelimiter = arrMatches[1];


			if (
				strMatchedDelimiter.length &&
				strMatchedDelimiter !== strDelimiter
			) {
				arrData.push([]);
			}

			let strMatchedValue;
			if (arrMatches[2]) {
				strMatchedValue = arrMatches[2].replace(
					new RegExp("\"\"", "g"),
					"\""
				);

			} else {
				strMatchedValue = arrMatches[3];
			}
			arrData[arrData.length - 1].push(strMatchedValue);
		}

		return (arrData);
	}

}
