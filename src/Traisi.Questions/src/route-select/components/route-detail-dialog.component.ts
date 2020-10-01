import { Component, ViewEncapsulation, Inject, OnInit, Input, ViewChild } from '@angular/core';
import { SurveyQuestion, ResponseTypes, TimelineResponseData, TraisiValues } from 'traisi-question-sdk';

import templateString from './route-detail-dialog.component.html';
import styleString from './route-detail-dialog.component.scss';
import { Trip, Section, Trips } from '../models/trip-route.model';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
	selector: 'traisi-route-detail-dialog',
	template: '' + templateString,
	providers: [],
	entryComponents: [],
	styles: ['' + styleString],
})
export class RouteDetailDialogComponent implements OnInit {
	@ViewChild('routeDetailModal', { static: true })
    public modal: ModalDirective;
    
    public trip: Trip;

	public constructor() {}

	public ngOnInit(): void {
		
	}

	public hide(): void {
		this.modal.hide();
	}

	public show(trip: Trip): void {
        this.trip = trip;
		this.modal.show();
	}
}
