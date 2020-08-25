import { Component, OnInit } from '@angular/core';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';

@Component({
	selector: 'app-numeric-textbox',
	templateUrl: './numeric-textbox.component.html',
	styleUrls: ['./numeric-textbox.component.scss']
})
export class NumericTextboxComponent implements OnInit {
	public id: number;
	public questionConfiguration: QuestionConfigurationDefinition;

	public numericValue: number;

	constructor() {}

	public ngOnInit() {
		if (this.numericValue === undefined) {
			this.setDefaultValue();
		}
	}

	public setDefaultValue() {
		this.numericValue = +this.questionConfiguration.defaultValue;
	}

	public getValue() {

		return this.numericValue;
	}

	public processPriorValue(last: number) {
		this.numericValue = last;
	}
}
