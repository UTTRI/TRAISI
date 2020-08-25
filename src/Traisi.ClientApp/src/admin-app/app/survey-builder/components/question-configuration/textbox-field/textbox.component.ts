import { Component, OnInit } from '@angular/core';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';

@Component({
	selector: 'app-textbox',
	templateUrl: './textbox.component.html',
	styleUrls: ['./textbox.component.scss']
})
export class TextboxComponent implements OnInit {
	public id;
	public questionConfiguration: QuestionConfigurationDefinition;
	public textValue: string;

	constructor() {}

	public ngOnInit() {
		if (this.textValue === undefined) {
			this.setDefaultValue();
		}
	}

	public setDefaultValue() {
		this.textValue = this.questionConfiguration.defaultValue;
	}

	public getValue() {
		return this.textValue;
	}

	public processPriorValue(last: string) {
		this.textValue = last;
	}
}
