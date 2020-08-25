import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { SharedDataService } from '../../../services/shared-data.service';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';

@Component({
	selector: 'app-radio',
	templateUrl: './radio.component.html',
	styleUrls: ['./radio.component.scss']
})
export class RadioComponent implements OnInit {

	public id: number;
	public questionConfiguration: QuestionConfigurationDefinition;

	public options = [];
	selectedEntry: any;

	constructor() {}

	ngOnInit() {
		let optionData = JSON.parse(this.questionConfiguration.resourceData);
		optionData.options.forEach((element) => {
			this.options.push(element);
		});

		if (this.selectedEntry === undefined) {
			this.setDefaultValue();
		}
	}

	setDefaultValue() {
		this.selectedEntry = this.options[0];
	}

	onSelectionChange(entry) {
		this.selectedEntry = entry;
	}


	getValue() {
		return JSON.stringify(this.selectedEntry);
	}

	processPriorValue(last: string) {
		this.selectedEntry = JSON.parse(last);
	}
}
