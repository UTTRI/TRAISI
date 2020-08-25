import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';

@Component({
	selector: 'app-slider',
	templateUrl: './slider.component.html',
	styleUrls: ['./slider.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SliderComponent implements OnInit {
	public id: number;
	public questionConfiguration: QuestionConfigurationDefinition;
	public sliding: boolean = false;
	public sliderValue;
	public min: number = 0;
	public max: number = 100;
	public interval: number = 1;

	constructor() {}

	public ngOnInit(): void {
		let sliderData = JSON.parse(this.questionConfiguration.resourceData);
		this.min = sliderData.min;
		this.max = sliderData.max;
		this.interval = sliderData.interval;
		if (this.sliderValue === undefined) {
			this.setDefaultValue();
		}
	}

	setDefaultValue() {
		this.sliderValue = +this.questionConfiguration.defaultValue;
	}

	getValue() {
		return JSON.stringify(this.sliderValue);
	}

	processPriorValue(last: string) {
		this.sliderValue = JSON.parse(last);
	}

	change(value: any) {
		this.sliderValue = value.newValue;
	}

	stopSlide(event: any) {
		this.sliding = false;
	}

	startSlide(event: any) {
		this.sliding = true;
	}
}
