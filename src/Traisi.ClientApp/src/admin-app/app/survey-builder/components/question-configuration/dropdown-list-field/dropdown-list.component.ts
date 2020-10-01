import { Component, OnInit, AfterContentInit } from '@angular/core';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';
import { AlertService, MessageSeverity } from '../../../../../../shared/services/alert.service';

@Component({
	selector: 'app-dropdown-list',
	templateUrl: './dropdown-list.component.html',
})
export class DropdownListComponent implements OnInit {
	public id: number;
	public questionConfiguration: QuestionConfigurationDefinition;
	public options: { value: string; label: string }[] = [];
	public selected: string;
	public selectedFull: any;

	public constructor(private alertService: AlertService) {}

	public ngOnInit() {
		let optionData = JSON.parse(this.questionConfiguration.resourceData);
		if (optionData instanceof Array) {
			optionData.forEach((element) => {
				this.options.push(element);
			});
		}
	}

	/**
	 *
	 * @param last
	 */
	public processPriorValue(last: string): void {
		if (last) {
			try {
				let model = JSON.parse(last);
				this.selectedFull = model;
				this.selected = model.id;
			} catch {}
		}
	}

	public onChanged(event): void {
		this.selectedFull = event;

	}
	getValue() {
		if (this.selected === null) {
			this.alertService.stopLoadingMessage();
			this.alertService.showStickyMessage(
				'Not Completed',
				`Please fill the form completely`,
				MessageSeverity.error
			);
			return;
		}
		return this.selectedFull;
	}
}
