import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';
import { Select2OptionData } from 'ng-select2';
import { QuestionResponseType } from 'app/survey-builder/models/question-response-type.enum';
import { SurveyBuilderEditorData } from 'app/survey-builder/services/survey-builder-editor-data.service';

@Component({
	selector: 'app-multi-select',
	templateUrl: './multi-select.component.html',
	styleUrls: ['./multi-select.component.scss'],
})
export class MultiSelectComponent implements OnInit {
	public id: number;
	public questionConfiguration: QuestionConfigurationDefinition;

	public options: {}[] = [];
	public selected: string[] = [];

	public model: { value: string; label: string }[];

	public multiSelectValues: string;

	@ViewChild('selectElement', { static: true })
	public selectElement: ElementRef;

	constructor(private _editorData: SurveyBuilderEditorData) {}

	public onChanged(event): void {
	}

	public ngOnInit(): void {
		if (this.questionConfiguration.valueType === 'Response') {
			// using response data
			for (let q of this._editorData.questionList) {
				this.options.push({
					label: q.questionPart.name,
					value: '' + q.questionPart.id,
					id: '',
				});
			}
		} else {
			// using custom option data
			let optionData = JSON.parse(this.questionConfiguration.resourceData);
			if (optionData) {
				optionData.forEach((element) => {
					this.options.push(element);
				});
			}
		}
	}

	public setDefaultValue() {
		this.multiSelectValues = this.questionConfiguration.defaultValue;
		this.selected.push(this.questionConfiguration.defaultValue);
	}

	public getValue() {
		return this.model;
	}

	/**
	 *
	 * @param last
	 */
	public processPriorValue(last: string): void {
		console.log('prior: ');
		console.log(last);
		this.model = JSON.parse(last);
	}
}
