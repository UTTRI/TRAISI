import { Component, ViewEncapsulation, Inject, OnInit, Input } from '@angular/core';
import { SurveyQuestion, ResponseTypes, TimelineResponseData, TraisiValues } from 'traisi-question-sdk';

import templateString from './route-display.component.html';
import styleString from './route-display.component.scss';
import { Trip } from 'route-select/models/trip-route.model';

@Component({
	selector: 'traisi-route-display',
	template: '' + templateString,
	providers: [],
	entryComponents: [],
	styles: ['' + styleString],
})
export class RouteDisplayComponent extends SurveyQuestion<ResponseTypes.Json> implements OnInit {
	@Input()
	public trip: Trip;

	public operators: string[] = [];

	public constructor() {
		super();
	}

	public ngOnInit(): void {
		this.collectOperators();
	}

	private collectOperators(): void {
		for (let section of this.trip.sections.Section) {
			if (section.PTRide) {
				if (!this.operators.includes(section.PTRide.Operator.Name)) {
					this.operators.push(section.PTRide.Operator.Name);
				}
			}
		}
	}
}
