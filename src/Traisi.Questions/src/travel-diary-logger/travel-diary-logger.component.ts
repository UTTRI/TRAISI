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
	public getCords(): any[] {
		var sourceData: any[] = this.getTripSoureData();
        //For now change the date here, to display routes loaded into the map
		sourceData = sourceData.filter(item => item["Trip Date Time"].substring(0, 10) == "2017-10-11");
		console.log(sourceData);
		var i = 0;
		//coordinates array
		var cordArray: any[] = [];
		while (i < sourceData.length) {
			//trip array
			var tripArray: any[] = [];
			while (true) {
				var ar: any[] = [];
				ar.push(sourceData[i].Longitude);
				ar.push(sourceData[i].Latitude);
				tripArray.push(ar);

				if (sourceData[i]["Travel Status"] == "Stop") {
					i++;
					break;
				}
				i++;
			}
			cordArray.push(tripArray);
		}
		return cordArray;
	}

	public getTripData(): any[] {
		return [
			//Date 11, row in the Trip information table
			{
				"Departure Date": "2017-10-11",
				"Purpose": "",
				"Mode": "Walk"
			},
			//Date 12 row in the Trip information table
			{
				"Departure Date": "2017-10-12",
				"Purpose": "",
				"Mode": "Walk"
			}
		];
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

		//coordinates
		let coordinates: any[] = this.getCords();

		map.on('load', function () {
			//Line colors
			var ar: string[] = ["Red", "Green", "Blue", "Purple", "Orange", "Indigo", "Yellow", "Violet", "Turquoise", "Pink", "Teal", "Burgundy", "Maroon", "Brown", "Magenta"];
			//Looping 
			for (let i = 0; i < coordinates.length; i++) {
				var routeId = "route" + i;
				map.addSource(routeId, {
					'type': 'geojson',
					'data': {
						'type': 'Feature',
						'properties': {
							"title": 'Trip' + (i + 1)
						},
						'geometry': {
							'type': 'LineString',
							'coordinates': coordinates[i]
						}
					}
				});
				map.addLayer({
					'id': 'route' + i,
					'type': 'line',
					'source': routeId,
					'layout': {
						'line-join': 'round',
						'line-cap': 'round',
					},
					'paint': {
						'line-color': ar[i],
						'line-width': 5
					}
				});
				map.addLayer({
					"id": "symbols" + i,
					"type": "symbol",
					"source": routeId,
					"layout": {
						"symbol-placement": "line",
						"text-font": ["Open Sans Regular"],
						"text-field": '{title}',
						"text-size": 16
					}
				});
			}
		});
	}

	public traisiOnInit(): void { }

	public onConfirmClick(): void {
		this.validationState.emit(ResponseValidationState.VALID);
	}

	public loadConfigurationData(data: QuestionConfiguration[]): void { }

	//using test data at the moment
	public getTripSoureData(): any[] {
		return [
			//Date 11, all trips data from test data set
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:30",
				"Latitude": 43.6776033,
				"Longitude": -79.3537117,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:30",
				"Latitude": 43.6771117,
				"Longitude": -79.3538133,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:31",
				"Latitude": 43.6769867,
				"Longitude": -79.3548533,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:32",
				"Latitude": 43.6767783,
				"Longitude": -79.3556433,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:34",
				"Latitude": 43.6771417,
				"Longitude": -79.3555117,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:36",
				"Latitude": 43.6767333,
				"Longitude": -79.3562667,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:36",
				"Latitude": 43.6765383,
				"Longitude": -79.3567133,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:37",
				"Latitude": 43.6764867,
				"Longitude": -79.3579183,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:39",
				"Latitude": 43.6758833,
				"Longitude": -79.3582633,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:39",
				"Latitude": 43.6762819,
				"Longitude": -79.3580511,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:40",
				"Latitude": 43.6759422,
				"Longitude": -79.3577871,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:40",
				"Latitude": 43.6762819,
				"Longitude": -79.3580511,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:41",
				"Latitude": 43.6759422,
				"Longitude": -79.3577871,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:42",
				"Latitude": 43.6762819,
				"Longitude": -79.3580511,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:42",
				"Latitude": 43.6759422,
				"Longitude": -79.3577871,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:42",
				"Latitude": 43.6763149,
				"Longitude": -79.3580071,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:44",
				"Latitude": 43.6764917,
				"Longitude": -79.3570433,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:44",
				"Latitude": 43.6765667,
				"Longitude": -79.356555,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:45",
				"Latitude": 43.676745,
				"Longitude": -79.3552883,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714756,
				"Trip Date Time": "2017-10-11 0:46",
				"Latitude": 43.6769583,
				"Longitude": -79.3544583,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:46",
				"Latitude": 43.675925,
				"Longitude": -79.36106,
				"Mode": "Bicycle",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:46",
				"Latitude": 43.67694,
				"Longitude": -79.3535667,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:46",
				"Latitude": 43.6774467,
				"Longitude": -79.35349,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:46",
				"Latitude": 43.6770933,
				"Longitude": -79.3540817,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:47",
				"Latitude": 43.6768217,
				"Longitude": -79.3554083,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:47",
				"Latitude": 43.67672,
				"Longitude": -79.35598,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:47",
				"Latitude": 43.67661,
				"Longitude": -79.3565667,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:47",
				"Latitude": 43.6765,
				"Longitude": -79.3570483,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:48",
				"Latitude": 43.6762433,
				"Longitude": -79.3582783,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:48",
				"Latitude": 43.6761233,
				"Longitude": -79.3589367,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:48",
				"Latitude": 43.6760283,
				"Longitude": -79.35958,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:48",
				"Latitude": 43.6759133,
				"Longitude": -79.3601883,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:48",
				"Latitude": 43.675795,
				"Longitude": -79.3608983,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:49",
				"Latitude": 43.6756583,
				"Longitude": -79.361705,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:49",
				"Latitude": 43.6755617,
				"Longitude": -79.3622683,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:49",
				"Latitude": 43.6754617,
				"Longitude": -79.36292,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:49",
				"Latitude": 43.6753117,
				"Longitude": -79.3635217,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:49",
				"Latitude": 43.6751783,
				"Longitude": -79.36423,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:50",
				"Latitude": 43.6750667,
				"Longitude": -79.36482,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:50",
				"Latitude": 43.67491,
				"Longitude": -79.365545,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:50",
				"Latitude": 43.6747433,
				"Longitude": -79.36637,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:50",
				"Latitude": 43.6745433,
				"Longitude": -79.3670683,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:50",
				"Latitude": 43.6742367,
				"Longitude": -79.3675833,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:50",
				"Latitude": 43.6739617,
				"Longitude": -79.3679317,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:51",
				"Latitude": 43.67337,
				"Longitude": -79.3688283,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:51",
				"Latitude": 43.673115,
				"Longitude": -79.369265,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:52",
				"Latitude": 43.6728333,
				"Longitude": -79.3696983,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:52",
				"Latitude": 43.6725117,
				"Longitude": -79.37019,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:52",
				"Latitude": 43.67219,
				"Longitude": -79.3707017,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:52",
				"Latitude": 43.6720017,
				"Longitude": -79.3713633,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:52",
				"Latitude": 43.6720667,
				"Longitude": -79.3720433,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:52",
				"Latitude": 43.6721567,
				"Longitude": -79.3727083,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:53",
				"Latitude": 43.6722667,
				"Longitude": -79.3735317,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:53",
				"Latitude": 43.6723733,
				"Longitude": -79.3742333,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:53",
				"Latitude": 43.6724317,
				"Longitude": -79.374855,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:53",
				"Latitude": 43.6724967,
				"Longitude": -79.375365,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:53",
				"Latitude": 43.6725233,
				"Longitude": -79.3764067,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:53",
				"Latitude": 43.6724133,
				"Longitude": -79.3769117,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:54",
				"Latitude": 43.671745,
				"Longitude": -79.3765717,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:54",
				"Latitude": 43.6712167,
				"Longitude": -79.3764083,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:54",
				"Latitude": 43.6708917,
				"Longitude": -79.3759283,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:54",
				"Latitude": 43.6705917,
				"Longitude": -79.375445,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:55",
				"Latitude": 43.6698717,
				"Longitude": -79.37545,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:55",
				"Latitude": 43.669395,
				"Longitude": -79.3751783,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:55",
				"Latitude": 43.6691367,
				"Longitude": -79.374335,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:55",
				"Latitude": 43.6688083,
				"Longitude": -79.3740683,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:55",
				"Latitude": 43.6684083,
				"Longitude": -79.3737867,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:55",
				"Latitude": 43.6677567,
				"Longitude": -79.3737717,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:56",
				"Latitude": 43.6671733,
				"Longitude": -79.374155,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:56",
				"Latitude": 43.6669067,
				"Longitude": -79.374515,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:56",
				"Latitude": 43.66668,
				"Longitude": -79.375525,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:56",
				"Latitude": 43.6666283,
				"Longitude": -79.3760367,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:56",
				"Latitude": 43.6664767,
				"Longitude": -79.3768517,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:57",
				"Latitude": 43.6662167,
				"Longitude": -79.3784,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:57",
				"Latitude": 43.666155,
				"Longitude": -79.379085,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:58",
				"Latitude": 43.6660033,
				"Longitude": -79.3795433,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:58",
				"Latitude": 43.6657333,
				"Longitude": -79.3803317,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:58",
				"Latitude": 43.665655,
				"Longitude": -79.380915,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:59",
				"Latitude": 43.6655467,
				"Longitude": -79.3815733,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:59",
				"Latitude": 43.6652967,
				"Longitude": -79.382645,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 14:59",
				"Latitude": 43.6651733,
				"Longitude": -79.3831583,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:00",
				"Latitude": 43.6650883,
				"Longitude": -79.3837117,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:00",
				"Latitude": 43.6649933,
				"Longitude": -79.3843133,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:00",
				"Latitude": 43.6647417,
				"Longitude": -79.3850717,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:00",
				"Latitude": 43.6645733,
				"Longitude": -79.3856133,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:01",
				"Latitude": 43.6643317,
				"Longitude": -79.3867883,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:01",
				"Latitude": 43.66436,
				"Longitude": -79.3873517,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:01",
				"Latitude": 43.6642267,
				"Longitude": -79.3881917,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:02",
				"Latitude": 43.6637833,
				"Longitude": -79.3886683,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:02",
				"Latitude": 43.6633933,
				"Longitude": -79.3887167,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:02",
				"Latitude": 43.6633067,
				"Longitude": -79.3897967,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:02",
				"Latitude": 43.66335,
				"Longitude": -79.3902933,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:02",
				"Latitude": 43.6632533,
				"Longitude": -79.3913333,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:04",
				"Latitude": 43.6622678,
				"Longitude": -79.3937442,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:04",
				"Latitude": 43.66166,
				"Longitude": -79.3959317,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:04",
				"Latitude": 43.6612083,
				"Longitude": -79.3952733,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:04",
				"Latitude": 43.6608283,
				"Longitude": -79.3946433,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 714977,
				"Trip Date Time": "2017-10-11 15:05",
				"Latitude": 43.66054,
				"Longitude": -79.3950183,
				"Mode": "Bicycle",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:44",
				"Latitude": 43.6611333,
				"Longitude": -79.3972983,
				"Mode": "Bicycle",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:44",
				"Latitude": 43.6617583,
				"Longitude": -79.3976033,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:44",
				"Latitude": 43.66215,
				"Longitude": -79.397815,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:45",
				"Latitude": 43.6628417,
				"Longitude": -79.39818,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:45",
				"Latitude": 43.66325,
				"Longitude": -79.3982967,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:45",
				"Latitude": 43.6640283,
				"Longitude": -79.3983717,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:46",
				"Latitude": 43.6643667,
				"Longitude": -79.398625,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:46",
				"Latitude": 43.6647833,
				"Longitude": -79.39891,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:46",
				"Latitude": 43.66516,
				"Longitude": -79.3990883,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715055,
				"Trip Date Time": "2017-10-11 20:46",
				"Latitude": 43.66559,
				"Longitude": -79.39918,
				"Mode": "Bicycle",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715059,
				"Trip Date Time": "2017-10-11 20:47",
				"Latitude": 43.666835,
				"Longitude": -79.3997467,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715059,
				"Trip Date Time": "2017-10-11 20:48",
				"Latitude": 43.6674833,
				"Longitude": -79.3998883,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715056,
				"Trip Date Time": "2017-10-11 21:29",
				"Latitude": 43.6483331,
				"Longitude": -79.5078551,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715056,
				"Trip Date Time": "2017-10-11 21:31",
				"Latitude": 43.6480933,
				"Longitude": -79.508305,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715056,
				"Trip Date Time": "2017-10-11 21:31",
				"Latitude": 43.6477733,
				"Longitude": -79.5077883,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715093,
				"Trip Date Time": "2017-10-11 22:06",
				"Latitude": 43.646295,
				"Longitude": -79.5077633,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715093,
				"Trip Date Time": "2017-10-11 22:09",
				"Latitude": 43.6460183,
				"Longitude": -79.5092433,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715093,
				"Trip Date Time": "2017-10-11 22:11",
				"Latitude": 43.6460683,
				"Longitude": -79.50869,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715093,
				"Trip Date Time": "2017-10-11 22:11",
				"Latitude": 43.64586,
				"Longitude": -79.5094433,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715093,
				"Trip Date Time": "2017-10-11 22:12",
				"Latitude": 43.64567,
				"Longitude": -79.5102867,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715093,
				"Trip Date Time": "2017-10-11 22:15",
				"Latitude": 43.645855,
				"Longitude": -79.5094933,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715117,
				"Trip Date Time": "2017-10-11 22:38",
				"Latitude": 43.6455967,
				"Longitude": -79.5069617,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715117,
				"Trip Date Time": "2017-10-11 22:47",
				"Latitude": 43.6444547,
				"Longitude": -79.5068228,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715132,
				"Trip Date Time": "2017-10-11 23:11",
				"Latitude": 43.6442567,
				"Longitude": -79.5079917,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715132,
				"Trip Date Time": "2017-10-11 23:13",
				"Latitude": 43.64405,
				"Longitude": -79.5090733,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715142,
				"Trip Date Time": "2017-10-11 23:35",
				"Latitude": 43.6441717,
				"Longitude": -79.5041483,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715142,
				"Trip Date Time": "2017-10-11 23:36",
				"Latitude": 43.64447,
				"Longitude": -79.503805,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715141,
				"Trip Date Time": "2017-10-11 23:44",
				"Latitude": 43.6437,
				"Longitude": -79.5061317,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715141,
				"Trip Date Time": "2017-10-11 23:45",
				"Latitude": 43.6433117,
				"Longitude": -79.506045,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			//Date 12, few trips from test data set			
			{
				"User Id": 12945,
				"Trip Id": 715160,
				"Trip Date Time": "2017-10-12 0:24",
				"Latitude": 43.6427633,
				"Longitude": -79.5056833,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715160,
				"Trip Date Time": "2017-10-12 0:24",
				"Latitude": 43.643375,
				"Longitude": -79.5059667,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715160,
				"Trip Date Time": "2017-10-12 0:25",
				"Latitude": 43.6437767,
				"Longitude": -79.5064817,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715160,
				"Trip Date Time": "2017-10-12 0:28",
				"Latitude": 43.644245,
				"Longitude": -79.506225,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715160,
				"Trip Date Time": "2017-10-12 0:29",
				"Latitude": 43.6447583,
				"Longitude": -79.5067317,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715160,
				"Trip Date Time": "2017-10-12 0:32",
				"Latitude": 43.64523,
				"Longitude": -79.5068833,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715188,
				"Trip Date Time": "2017-10-12 0:51",
				"Latitude": 43.6484433,
				"Longitude": -79.5070167,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715188,
				"Trip Date Time": "2017-10-12 0:52",
				"Latitude": 43.6487767,
				"Longitude": -79.5066717,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715188,
				"Trip Date Time": "2017-10-12 0:55",
				"Latitude": 43.6487717,
				"Longitude": -79.507515,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715188,
				"Trip Date Time": "2017-10-12 0:56",
				"Latitude": 43.648425,
				"Longitude": -79.5080583,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:02",
				"Latitude": 43.6497632,
				"Longitude": -79.4942586,
				"Mode": "Subway",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:02",
				"Latitude": 43.6497392,
				"Longitude": -79.4936985,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:02",
				"Latitude": 43.649195,
				"Longitude": -79.4939291,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:03",
				"Latitude": 43.648875,
				"Longitude": -79.4926383,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:03",
				"Latitude": 43.6485583,
				"Longitude": -79.4919267,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:03",
				"Latitude": 43.648405,
				"Longitude": -79.49134,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:03",
				"Latitude": 43.6501206,
				"Longitude": -79.4834369,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:06",
				"Latitude": 43.6532417,
				"Longitude": -79.471586,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:06",
				"Latitude": 43.6529506,
				"Longitude": -79.4700479,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:06",
				"Latitude": 43.6532883,
				"Longitude": -79.4690733,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:06",
				"Latitude": 43.6535217,
				"Longitude": -79.4683017,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:06",
				"Latitude": 43.6536609,
				"Longitude": -79.4674246,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:07",
				"Latitude": 43.6554229,
				"Longitude": -79.4599399,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:08",
				"Latitude": 43.6559285,
				"Longitude": -79.4587972,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:08",
				"Latitude": 43.65599,
				"Longitude": -79.4579433,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:08",
				"Latitude": 43.656055,
				"Longitude": -79.457205,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:08",
				"Latitude": 43.656215,
				"Longitude": -79.4565933,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:08",
				"Latitude": 43.6564033,
				"Longitude": -79.4561133,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:08",
				"Latitude": 43.6566133,
				"Longitude": -79.455225,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:08",
				"Latitude": 43.65676,
				"Longitude": -79.4546817,
				"Mode": "Subway",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715187,
				"Trip Date Time": "2017-10-12 1:08",
				"Latitude": 43.6570017,
				"Longitude": -79.4537733,
				"Mode": "Subway",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715189,
				"Trip Date Time": "2017-10-12 1:20",
				"Latitude": 43.6687133,
				"Longitude": -79.3980283,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715189,
				"Trip Date Time": "2017-10-12 1:20",
				"Latitude": 43.6685817,
				"Longitude": -79.3975617,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715189,
				"Trip Date Time": "2017-10-12 1:20",
				"Latitude": 43.6682567,
				"Longitude": -79.3972833,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715189,
				"Trip Date Time": "2017-10-12 1:21",
				"Latitude": 43.6681383,
				"Longitude": -79.3979067,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:28",
				"Latitude": 43.667835,
				"Longitude": -79.3975417,
				"Mode": "Walk",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:29",
				"Latitude": 43.667665,
				"Longitude": -79.39809,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:30",
				"Latitude": 43.6672017,
				"Longitude": -79.3980633,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:30",
				"Latitude": 43.6668083,
				"Longitude": -79.3979417,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:31",
				"Latitude": 43.6658667,
				"Longitude": -79.3975033,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:32",
				"Latitude": 43.6654983,
				"Longitude": -79.397365,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:33",
				"Latitude": 43.664635,
				"Longitude": -79.3970483,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:33",
				"Latitude": 43.6642733,
				"Longitude": -79.3974917,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:34",
				"Latitude": 43.663665,
				"Longitude": -79.3974,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:35",
				"Latitude": 43.6630933,
				"Longitude": -79.3970317,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:36",
				"Latitude": 43.6625433,
				"Longitude": -79.39667,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:36",
				"Latitude": 43.6620433,
				"Longitude": -79.39646,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:37",
				"Latitude": 43.6616533,
				"Longitude": -79.3962833,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:38",
				"Latitude": 43.66109,
				"Longitude": -79.3953967,
				"Mode": "Walk",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715212,
				"Trip Date Time": "2017-10-12 1:39",
				"Latitude": 43.6606067,
				"Longitude": -79.3950683,
				"Mode": "Walk",
				"Travel Status": "Stop"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:12",
				"Latitude": 43.6609417,
				"Longitude": -79.3948767,
				"Mode": "Bicycle",
				"Travel Status": "Start"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:12",
				"Latitude": 43.6612333,
				"Longitude": -79.394475,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:12",
				"Latitude": 43.6617817,
				"Longitude": -79.39435,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:12",
				"Latitude": 43.6621333,
				"Longitude": -79.3946967,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:13",
				"Latitude": 43.6625567,
				"Longitude": -79.3944083,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:13",
				"Latitude": 43.6629167,
				"Longitude": -79.3936783,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:13",
				"Latitude": 43.6631,
				"Longitude": -79.3931583,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:13",
				"Latitude": 43.6632633,
				"Longitude": -79.3925767,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:14",
				"Latitude": 43.6633833,
				"Longitude": -79.3921033,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:14",
				"Latitude": 43.6635633,
				"Longitude": -79.3914717,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:14",
				"Latitude": 43.6637167,
				"Longitude": -79.39093,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:14",
				"Latitude": 43.6638233,
				"Longitude": -79.3903583,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:14",
				"Latitude": 43.6638967,
				"Longitude": -79.3896867,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:15",
				"Latitude": 43.6641783,
				"Longitude": -79.3891683,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:15",
				"Latitude": 43.66442,
				"Longitude": -79.3887433,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:15",
				"Latitude": 43.6643567,
				"Longitude": -79.3882017,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:15",
				"Latitude": 43.6642117,
				"Longitude": -79.3876333,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:16",
				"Latitude": 43.6642817,
				"Longitude": -79.386785,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:16",
				"Latitude": 43.6647317,
				"Longitude": -79.3861133,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:16",
				"Latitude": 43.6648733,
				"Longitude": -79.3854467,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:17",
				"Latitude": 43.665325,
				"Longitude": -79.3852233,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:17",
				"Latitude": 43.6653083,
				"Longitude": -79.384485,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:17",
				"Latitude": 43.6652867,
				"Longitude": -79.38392,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:18",
				"Latitude": 43.66543,
				"Longitude": -79.3832083,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:18",
				"Latitude": 43.6656317,
				"Longitude": -79.3827167,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:18",
				"Latitude": 43.6654817,
				"Longitude": -79.3822583,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:18",
				"Latitude": 43.66565,
				"Longitude": -79.3818067,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:18",
				"Latitude": 43.665935,
				"Longitude": -79.38076,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:19",
				"Latitude": 43.6659933,
				"Longitude": -79.3802083,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:19",
				"Latitude": 43.6661917,
				"Longitude": -79.37961,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:19",
				"Latitude": 43.6663917,
				"Longitude": -79.3790533,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:19",
				"Latitude": 43.6665967,
				"Longitude": -79.37864,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:20",
				"Latitude": 43.6667617,
				"Longitude": -79.3778533,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:20",
				"Latitude": 43.6668067,
				"Longitude": -79.3772417,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:20",
				"Latitude": 43.6667717,
				"Longitude": -79.3765133,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:20",
				"Latitude": 43.6667433,
				"Longitude": -79.3759667,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:21",
				"Latitude": 43.6669783,
				"Longitude": -79.3754167,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:21",
				"Latitude": 43.6675233,
				"Longitude": -79.3753,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:22",
				"Latitude": 43.6679083,
				"Longitude": -79.375295,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:22",
				"Latitude": 43.6682667,
				"Longitude": -79.3754267,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:22",
				"Latitude": 43.668815,
				"Longitude": -79.3757867,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:22",
				"Latitude": 43.6693667,
				"Longitude": -79.3759417,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:23",
				"Latitude": 43.669795,
				"Longitude": -79.376075,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:23",
				"Latitude": 43.6702,
				"Longitude": -79.3762383,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:23",
				"Latitude": 43.6706517,
				"Longitude": -79.3763067,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:23",
				"Latitude": 43.6710883,
				"Longitude": -79.376575,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:23",
				"Latitude": 43.6714117,
				"Longitude": -79.37681,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:24",
				"Latitude": 43.6717967,
				"Longitude": -79.376835,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:24",
				"Latitude": 43.6723133,
				"Longitude": -79.3758167,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:24",
				"Latitude": 43.6723267,
				"Longitude": -79.37508,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:24",
				"Latitude": 43.672235,
				"Longitude": -79.374355,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:25",
				"Latitude": 43.6721733,
				"Longitude": -79.3735583,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:25",
				"Latitude": 43.6720933,
				"Longitude": -79.3728167,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:25",
				"Latitude": 43.671975,
				"Longitude": -79.3720817,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:25",
				"Latitude": 43.6718667,
				"Longitude": -79.3713967,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:25",
				"Latitude": 43.671935,
				"Longitude": -79.3708833,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:25",
				"Latitude": 43.6722417,
				"Longitude": -79.3703533,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:26",
				"Latitude": 43.6726283,
				"Longitude": -79.3697867,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:26",
				"Latitude": 43.6729867,
				"Longitude": -79.3692517,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:26",
				"Latitude": 43.673325,
				"Longitude": -79.3687733,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:26",
				"Latitude": 43.6737417,
				"Longitude": -79.3682067,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:27",
				"Latitude": 43.6740717,
				"Longitude": -79.3677233,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:27",
				"Latitude": 43.6743917,
				"Longitude": -79.3672667,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:27",
				"Latitude": 43.67466,
				"Longitude": -79.366685,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:27",
				"Latitude": 43.674785,
				"Longitude": -79.3659883,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:27",
				"Latitude": 43.67494,
				"Longitude": -79.365145,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:28",
				"Latitude": 43.6750983,
				"Longitude": -79.3644233,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:28",
				"Latitude": 43.675235,
				"Longitude": -79.3637283,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:28",
				"Latitude": 43.675365,
				"Longitude": -79.3630483,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:28",
				"Latitude": 43.6755267,
				"Longitude": -79.362255,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:28",
				"Latitude": 43.6756767,
				"Longitude": -79.3615517,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:29",
				"Latitude": 43.6758017,
				"Longitude": -79.3609,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:29",
				"Latitude": 43.6759633,
				"Longitude": -79.3602017,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:29",
				"Latitude": 43.6760767,
				"Longitude": -79.3595183,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:30",
				"Latitude": 43.6763,
				"Longitude": -79.3585817,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:30",
				"Latitude": 43.6763967,
				"Longitude": -79.3579967,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:30",
				"Latitude": 43.67653,
				"Longitude": -79.35738,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:30",
				"Latitude": 43.6766817,
				"Longitude": -79.3567,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:30",
				"Latitude": 43.67681,
				"Longitude": -79.3560133,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:31",
				"Latitude": 43.6769483,
				"Longitude": -79.3553633,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:31",
				"Latitude": 43.6770483,
				"Longitude": -79.35475,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:31",
				"Latitude": 43.67715,
				"Longitude": -79.3541567,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:31",
				"Latitude": 43.67728,
				"Longitude": -79.35359,
				"Mode": "Bicycle",
				"Travel Status": "Travel"
			},
			{
				"User Id": 12945,
				"Trip Id": 715220,
				"Trip Date Time": "2017-10-12 2:31",
				"Latitude": 43.6773817,
				"Longitude": -79.3530083,
				"Mode": "Bicycle",
				"Travel Status": "Stop"
			}
		];
	}
}
