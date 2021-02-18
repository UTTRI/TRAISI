import { Component, AfterViewInit, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import templateString from './travel-diary-logger.component.html';
import styleString from './travel-diary-logger.component.scss';
import { MapMouseEvent, Marker, LngLat } from 'mapbox-gl';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapComponent } from 'ngx-mapbox-gl';
import { Result } from 'ngx-mapbox-gl/lib/control/geocoder-control.directive';
import { concat, Observable, of, ReplaySubject, Subject, timer } from 'rxjs';

import {
	SurveyQuestion,
	ResponseTypes,
	QuestionConfiguration,
	SurveyViewer,
	OnSurveyQuestionInit,
	OnVisibilityChanged,
	OnSaveResponseStatus,
	StringResponseData,
	OnOptionsLoaded,
	QuestionOption,
	ResponseValidationState,
	ResponseData,
	OptionSelectResponseData,
	LocationResponseData,
	QuestionConfigurationService,
	TraisiValues,
	Address,
} from 'traisi-question-sdk';
import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { LocationLookupComponent } from 'shared/components/location-lookup.component';
import markerPng from '../map-question/marker.png';
import { GeoServiceClient, MapLocation } from '../shared/geoservice-api-client.service';
import { GeoLocation } from '../map-question/models/geo-location.model';
import { MapEndpointService } from '../map-question/services/mapservice.service';
import { MapQuestionConfiguration } from '../map-question/models/map-question-configuration.model';


@Component({
	selector: 'traisi-travel-diary-logger',
	template: '' + templateString,
	entryComponents: [],
	styles: ['' + styleString],
})
export class TravelDiaryLoggerComponent extends SurveyQuestion<ResponseTypes.String> implements OnInit {
	modalRef: BsModalRef;

	public locationSearch: string;
	public locationLoaded: boolean = false;

	/**
	 * Purpose  of map question component
	 */
	public purpose: string = '';

	public preferredHeight = 350;

	public tripData: any[] = [];

	//using test data at the moment
	public getTripData(): any[] {
		return [
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Start"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		},
		{
			"User Id": 12945,
			"Trip Id": 714756,
			"Started At": "12:29:55",
			"Finished At": "12:47:30",
			"Mode": "Walk",
			"Travel Status": "Travel"
		}];
	}

	@ViewChild('dateInput', { static: true })
	public dateInput: BsDatepickerDirective;

	public dateData: Date;

	bsInlineValue = new Date();
	bsInlineRangeValue: Date[];

	public mapInstance: ReplaySubject<mapboxgl.Map>;
	protected accessToken: string;
	public loadGeocoder: boolean = true;

	/**
	 * Creates an instance of map question component.
	 * @param mapEndpointService
	 * @param cdRef
	 * @param surveyViewerService
	 */

	constructor(
		@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer,
		@Inject('location.accesstoken') private _accessToken: string, @Inject(TraisiValues.Configuration) private _configuration: MapQuestionConfiguration) {
		super();
		this.surveyViewerService.configurationData.subscribe(this.loadConfigurationData);
		this.mapInstance = new ReplaySubject<mapboxgl.Map>(1);
		this._configuration.AccessToken = _accessToken;
		this.accessToken = _accessToken;
	}

	/**
	 * on init
	 */
	public ngOnInit(): void {
		//it's just the test data, getTripData() would call the backend in normal circumstances
		this.tripData = this.getTripData();
		(mapboxgl as any).accessToken = this.accessToken;
		
		var map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [-79.35, 43.67],
			zoom: 15
		});
		map.on('load', function () {
			map.addSource('route', {
				'type': 'geojson',
				'data': {
					'type': 'Feature',
					'properties': {
						"title": 'Trip'
					},
					'geometry': {
						'type': 'LineString',
						'coordinates': [
							[-79.3537117, 43.6776033],
							[-79.3538133, 43.6771117],
							[-79.3548533, 43.6769867],
							[-79.3556433, 43.6767783],
							[-79.3555117, 43.6771417],
							[-79.3562667, 43.6767333],
							[-79.3567133, 43.6765383],
							[-79.3579183, 43.6764867],
							[-79.3579183, 43.6764867],
							[-79.3580511, 43.6762819]
						]
					}
				}
			});
			map.addLayer({
				'id': 'route',
				'type': 'line',
				'source': 'route',
				'layout': {
					'line-join': 'round',
					'line-cap': 'round',
				},
				'paint': {
					'line-color': 'Red',
					'line-width': 5
				}
			});
			map.addLayer({
				"id": "symbols",
				"type": "symbol",
				"source": "route",
				"layout": {
					"symbol-placement": "line",
					"text-font": ["Open Sans Regular"],
					"text-field": '{title}',
					"text-size": 16
				}
			});
		});
	}

	public traisiOnInit(): void { }

	public onConfirmClick(): void {
		this.validationState.emit(ResponseValidationState.VALID);
	}

	public loadConfigurationData(data: QuestionConfiguration[]): void { }
}
