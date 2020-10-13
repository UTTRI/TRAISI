import { Component, ViewEncapsulation, Inject, OnInit, ViewChild } from '@angular/core';
import {
	SurveyQuestion,
	ResponseTypes,
	TimelineResponseData,
	TraisiValues,
	SurveyViewQuestion,
	ResponseData,
	OptionSelectResponseData,
	ResponseValidationState,
	JsonResponseData,
} from 'traisi-question-sdk';

import templateString from './route-select-question.component.html';
import styleString from './route-select-question.component.scss';
import { GeoServiceClient } from '../shared/geoservice-api-client.service';
import { RootObject, Response, Trip } from './models/trip-route.model';
import { RouteDetailDialogComponent } from './components/route-detail-dialog.component';

const transit_modes = ['transit-all-way', 'transit-park-ride', 'transit-kiss-ride', 'transit-cycle-ride'];

@Component({
	selector: 'traisi-route-select-question',
	template: '' + templateString,
	providers: [],
	entryComponents: [],
	styles: ['' + styleString],
})
export class RouteSelectQuestionComponent extends SurveyQuestion<ResponseTypes.Json> implements OnInit {
	public constructor(
		@Inject(TraisiValues.RepeatSource) private _repeatSource: TimelineResponseData[],
		@Inject(TraisiValues.RepeatValue) private _repeatValue: TimelineResponseData,
		@Inject(TraisiValues.SurveyQuestion) public question: SurveyViewQuestion,
		private _geoService: GeoServiceClient
	) {
		super();
	}

	public route: Response;

	public originAddress: string;

	public destinationAddress: string;

	public purpose: string;

	public selectedIndex: number;

	public radioName: string;

	public hasError: boolean;

	@ViewChild('routeDetailDialog')
	public routeDetailDialog: RouteDetailDialogComponent;

	public modelChanged(event: number) {
		this.response.next([
			{
				routes: this.route.trips.Trip[event],
				routeIndex: event,
			},
		]);
		this.validationState.emit(ResponseValidationState.VALID);
	}

	public showTripInfo(trip: Trip) {
		this.routeDetailDialog.show(trip);
	}

	public ngOnInit(): void {
		// retrieve the response of the timeine entry before this current one
		let idx = this._repeatSource.findIndex(
			(x) => x.latitude === this._repeatValue.latitude && x.timeA === this._repeatValue.timeA
		);

		this.radioName = this.question.questionId + '-' + idx;
		console.log(idx);
		let priorEvent = this._repeatSource[idx - 1];

		this.originAddress = `${priorEvent.address.formattedAddress}`;
		this.destinationAddress = `${this._repeatValue.address.formattedAddress}`;
		this.purpose = this._repeatValue.purpose;
		let mode: string;
		if (this._repeatValue.mode === 'transit-all-way') {
			mode = 'PT';
		} else if (this._repeatValue.mode === 'transit-park-ride') {
			mode = 'Car';
		} else if (this._repeatValue.mode === 'transit-kiss-ride') {
			mode = 'Car';
		} else if (this._repeatValue.mode === 'transit-cycle-ride') {
			mode = 'Bike';
		}
		this._geoService
			.routePlanner(
				this._repeatValue.latitude,
				this._repeatValue.longitude,
				priorEvent.latitude,
				priorEvent.longitude,
				new Date(),
				'PT',
				this._repeatValue.mode === 'transit-park-ride',
				'',
				'',
				mode === 'Car' ? 20 : 0,
				mode === 'Bike' ? 15 : 0
			)
			.subscribe((x) => {
				this.route = (x as RootObject).Data[0].response;
				this.isLoaded.next(true);
				console.log(this.route);
				if (this.route.Status.Code !== 'OK') {
					this.hasError = true;
				} else {
					this.hasError = false;
					this.validationState.emit(ResponseValidationState.VALID);
				}
				this.savedResponse.subscribe(this.onSavedResponseData);
			});
	}

	private onSavedResponseData: (response: ResponseData<ResponseTypes.Json> | 'none') => void = (
		response: ResponseData<ResponseTypes.Json>[] | 'none'
	) => {
		if (response !== 'none') {
			let jsonResponse = <JsonResponseData>response[0];
			if (jsonResponse) {
				let jsonObj = JSON.parse(jsonResponse.value);
				this.selectedIndex = jsonObj[0].routeIndex;
			}
			this.validationState.emit(ResponseValidationState.VALID);
		}

		this.isLoaded.next(true);
	};
}
