import { Component, OnInit } from '@angular/core';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';

@Component({
	selector: 'app-switch',
	templateUrl: './switch.component.html',
	styleUrls: ['./switch.component.scss'],
})
export class SwitchComponent implements OnInit {
	public id: number;
	public questionConfiguration: QuestionConfigurationDefinition;

	public switchValue;

	constructor() {}

	ngOnInit() {
		if (this.switchValue === undefined) {
			this.setDefaultValue();
		}
	}

	setDefaultValue() {
		this.switchValue = this.questionConfiguration.defaultValue === 'true';

		console.log(this.questionConfiguration);
	}

	getValue() {
		return JSON.stringify(this.switchValue);
	}

	processPriorValue(last: string) {
		this.switchValue = JSON.parse(last);
	}
}
