import { Component, OnInit } from '@angular/core';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
	selector: 'app-date-input',
	templateUrl: './date-input.component.html',
	styleUrls: ['./date-input.component.scss']
})
export class DateInputComponent implements OnInit {
	public id: number;
	public questionConfiguration: QuestionConfigurationDefinition;
	public datePickerValue: Date;


	public bsConfig: Partial<BsDatepickerConfig> = Object.assign(
		{},
		{
			containerClass: 'theme-default',
			dateInputFormat: 'YYYY-MM-DD'
		}
	);

	constructor() {}

	ngOnInit() {
		if (this.datePickerValue === undefined) {
			this.setDefaultValue();
		}
	}

	setDefaultValue() {
		this.datePickerValue = new Date(Date.parse(this.questionConfiguration.defaultValue));
	}

	getValue(){
		return JSON.stringify(this.datePickerValue);
	}

	processPriorValue(last: string) {
		this.datePickerValue = JSON.parse(last);
	}

}
