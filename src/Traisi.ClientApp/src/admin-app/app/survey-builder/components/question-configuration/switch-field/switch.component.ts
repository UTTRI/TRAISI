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

	public switchValue: boolean;

	constructor() {}

	public ngOnInit(): void {
		if (this.switchValue === undefined) {
			this.setDefaultValue();
		}
	}

	public setDefaultValue() {
		this.switchValue = this.questionConfiguration.defaultValue === 'true';
	}

	public getValue() {
		return this.switchValue;
	}

	public processPriorValue(last: string): void {
		this.switchValue = JSON.parse(last.toLowerCase());
	}
}
