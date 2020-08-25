import { Component, OnInit } from '@angular/core';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';

@Component({
	selector: 'app-textarea',
	templateUrl: './textarea.component.html',
	styleUrls: ['./textarea.component.scss']
})
export class TextAreaComponent implements OnInit {

	public id;
	public questionConfiguration: QuestionConfigurationDefinition;
	public textValue: string;

	constructor() {}

	ngOnInit() {
		if (this.textValue === undefined) {
			this.setDefaultValue();
		}
	}

	setDefaultValue() {
		this.textValue = this.questionConfiguration.defaultValue;
	}

	getValue(){
		return JSON.stringify({text: this.textValue});
	}

	processPriorValue(last: string) {
		this.textValue = JSON.parse(last);
	}

}
