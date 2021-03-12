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
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { countReset } from 'console';

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
	public getCords(strDate: string): any[] {
		var sourceData: any[] = this.getTripSoureData();
		//For now change the date here, to display routes loaded into the map
		sourceData = sourceData.filter(item => item['Trip Date Time'].substring(0, 10) == strDate);
		console.log(sourceData);
		var i = 0;
		//coordinates array
		var cordArray: any[] = [];
		//Trip table
		var tripTable: any[] = [];

		var tripId: number = 1;
		while (i < sourceData.length) {
			//trip array
			var tripArray: any[] = [];
			while (true) {
				var ar: any[] = [];
				ar.push(sourceData[i].Longitude);
				ar.push(sourceData[i].Latitude);
				tripArray.push(ar);

				if (sourceData[i]['Travel Status'] == 'Stop') {
					var tripObj: any = {};
					tripObj['Departure Date'] = sourceData[i]['Trip Date Time'];
					tripObj.Mode = sourceData[i].Mode;
					tripObj.Purpose = '';
					tripObj.Longitude = sourceData[i].Longitude;
					tripObj.Latitude = sourceData[i].Latitude;
					tripTable.push(tripObj);
					i++;
					break;
				}
				i++;
			}
			cordArray.push(tripArray);
		}
		this.tripData = tripTable;
		return cordArray;
	}
	//data range (min/max) for the test data set
	minDate = '2017-10-01'
	maxDate = '2017-11-30'

	@ViewChild('dateInput', { static: true })
	public dateInput: BsDatepickerDirective;

	public dateData: Date;
	public selectedDate: any = '2017-10-11';

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
		//coordinates
		let coordinates: any[] = this.getCords('2017-10-11');
		//map
		var centerLong:any = coordinates[0][0][0];
		var centerLat:any = coordinates[0][0][1];
		this.generateMap(coordinates, centerLong, centerLat);
		// console.log(coordinates[0][0][0]);
	}


	public gotoTripOnMap(index:number):void
	{
		let coordinates: any[] = this.getCords(this.selectedDate);
		var centerLong:any = this.tripData[index].Longitude;
		var centerLat:any = this.tripData[index].Latitude;
		this.generateMap(coordinates, centerLong, centerLat);	
	}

	//Map
	public generateMap(coordinates: any[], centerLong:any, centerLat:any): void {
		document.getElementById('map').innerHTML = '';
		//it's just the test data, getTripData() would call the backend in normal circumstances
		(mapboxgl as any).accessToken = this.accessToken;

		var map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [centerLong, centerLat],
			zoom: 15
		});

		map.on('load', function () {
			//Line colors
			var ar: string[] = ['Red', 'Green', 'Blue', 'Purple', 'Orange', 'Indigo', 'Yellow', 'Violet', 'Turquoise', 'Pink', 'Teal', 'Burgundy', 'Maroon', 'Brown', 'Magenta'];
			//Looping 
			for (let i = 0; i < coordinates.length; i++) {
				var routeId = 'route' + i;
				map.addSource(routeId, {
					'type': 'geojson',
					'data': {
						'type': 'Feature',
						'properties': {
							'title': 'Trip' + (i + 1)
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
					'id': 'symbols' + i,
					'type': 'symbol',
					'source': routeId,
					'layout': {
						'symbol-placement': 'line',
						'text-font': ['Open Sans Regular'],
						'text-field': '{title}',
						'text-size': 16
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

	//Select a date from the calendar
	public updateTripDate() {
		
		let coordinates: any[] = this.getCords(this.selectedDate);
		if(coordinates.length <= 0)
		{
			document.getElementById('map').innerHTML = '';
			return;
		}
		
		var centerLong:any = coordinates[0][0][0];
		var centerLat:any = coordinates[0][0][1];
		this.generateMap(coordinates, centerLong, centerLat);
		
	}

	//using test data at the moment
	public getTripSoureData(): any[] {
		return [
			//Date 11, all trips data from test data set
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:30',
				'Latitude': 43.6776033,
				'Longitude': -79.3537117,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:30',
				'Latitude': 43.6771117,
				'Longitude': -79.3538133,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:31',
				'Latitude': 43.6769867,
				'Longitude': -79.3548533,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:32',
				'Latitude': 43.6767783,
				'Longitude': -79.3556433,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:34',
				'Latitude': 43.6771417,
				'Longitude': -79.3555117,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:36',
				'Latitude': 43.6767333,
				'Longitude': -79.3562667,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:36',
				'Latitude': 43.6765383,
				'Longitude': -79.3567133,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:37',
				'Latitude': 43.6764867,
				'Longitude': -79.3579183,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714756,
				'Trip Date Time': '2017-10-11 0:46',
				'Latitude': 43.6769583,
				'Longitude': -79.3544583,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 14:46',
				'Latitude': 43.675925,
				'Longitude': -79.36106,
				'Mode': 'Bicycle',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 14:46',
				'Latitude': 43.67694,
				'Longitude': -79.3535667,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 14:46',
				'Latitude': 43.6774467,
				'Longitude': -79.35349,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 14:46',
				'Latitude': 43.6770933,
				'Longitude': -79.3540817,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 14:47',
				'Latitude': 43.6768217,
				'Longitude': -79.3554083,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 14:47',
				'Latitude': 43.67672,
				'Longitude': -79.35598,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 14:47',
				'Latitude': 43.67661,
				'Longitude': -79.3565667,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 14:47',
				'Latitude': 43.6765,
				'Longitude': -79.3570483,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 714977,
				'Trip Date Time': '2017-10-11 15:05',
				'Latitude': 43.66054,
				'Longitude': -79.3950183,
				'Mode': 'Bicycle',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:44',
				'Latitude': 43.6611333,
				'Longitude': -79.3972983,
				'Mode': 'Bicycle',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:44',
				'Latitude': 43.6617583,
				'Longitude': -79.3976033,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:44',
				'Latitude': 43.66215,
				'Longitude': -79.397815,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:45',
				'Latitude': 43.6628417,
				'Longitude': -79.39818,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:45',
				'Latitude': 43.66325,
				'Longitude': -79.3982967,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:45',
				'Latitude': 43.6640283,
				'Longitude': -79.3983717,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:46',
				'Latitude': 43.6643667,
				'Longitude': -79.398625,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:46',
				'Latitude': 43.6647833,
				'Longitude': -79.39891,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:46',
				'Latitude': 43.66516,
				'Longitude': -79.3990883,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715055,
				'Trip Date Time': '2017-10-11 20:46',
				'Latitude': 43.66559,
				'Longitude': -79.39918,
				'Mode': 'Bicycle',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 715056,
				'Trip Date Time': '2017-10-11 21:29',
				'Latitude': 43.6483331,
				'Longitude': -79.5078551,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715056,
				'Trip Date Time': '2017-10-11 21:31',
				'Latitude': 43.6480933,
				'Longitude': -79.508305,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715056,
				'Trip Date Time': '2017-10-11 21:31',
				'Latitude': 43.6477733,
				'Longitude': -79.5077883,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 715093,
				'Trip Date Time': '2017-10-11 22:06',
				'Latitude': 43.646295,
				'Longitude': -79.5077633,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715093,
				'Trip Date Time': '2017-10-11 22:09',
				'Latitude': 43.6460183,
				'Longitude': -79.5092433,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715093,
				'Trip Date Time': '2017-10-11 22:11',
				'Latitude': 43.6460683,
				'Longitude': -79.50869,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715093,
				'Trip Date Time': '2017-10-11 22:11',
				'Latitude': 43.64586,
				'Longitude': -79.5094433,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715093,
				'Trip Date Time': '2017-10-11 22:12',
				'Latitude': 43.64567,
				'Longitude': -79.5102867,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715093,
				'Trip Date Time': '2017-10-11 22:15',
				'Latitude': 43.645855,
				'Longitude': -79.5094933,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			//Date Oct 12, few trips from test data set			
			{
				'User Id': 12945,
				'Trip Id': 715160,
				'Trip Date Time': '2017-10-12 0:24',
				'Latitude': 43.6427633,
				'Longitude': -79.5056833,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715160,
				'Trip Date Time': '2017-10-12 0:24',
				'Latitude': 43.643375,
				'Longitude': -79.5059667,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715160,
				'Trip Date Time': '2017-10-12 0:25',
				'Latitude': 43.6437767,
				'Longitude': -79.5064817,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715160,
				'Trip Date Time': '2017-10-12 0:28',
				'Latitude': 43.644245,
				'Longitude': -79.506225,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715160,
				'Trip Date Time': '2017-10-12 0:29',
				'Latitude': 43.6447583,
				'Longitude': -79.5067317,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715160,
				'Trip Date Time': '2017-10-12 0:32',
				'Latitude': 43.64523,
				'Longitude': -79.5068833,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 715188,
				'Trip Date Time': '2017-10-12 0:51',
				'Latitude': 43.6484433,
				'Longitude': -79.5070167,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715188,
				'Trip Date Time': '2017-10-12 0:52',
				'Latitude': 43.6487767,
				'Longitude': -79.5066717,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715188,
				'Trip Date Time': '2017-10-12 0:55',
				'Latitude': 43.6487717,
				'Longitude': -79.507515,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715188,
				'Trip Date Time': '2017-10-12 0:56',
				'Latitude': 43.648425,
				'Longitude': -79.5080583,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:02',
				'Latitude': 43.6497632,
				'Longitude': -79.4942586,
				'Mode': 'Subway',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:02',
				'Latitude': 43.6497392,
				'Longitude': -79.4936985,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:02',
				'Latitude': 43.649195,
				'Longitude': -79.4939291,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:03',
				'Latitude': 43.648875,
				'Longitude': -79.4926383,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:03',
				'Latitude': 43.6485583,
				'Longitude': -79.4919267,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:03',
				'Latitude': 43.648405,
				'Longitude': -79.49134,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:03',
				'Latitude': 43.6501206,
				'Longitude': -79.4834369,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:06',
				'Latitude': 43.6532417,
				'Longitude': -79.471586,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715187,
				'Trip Date Time': '2017-10-12 1:08',
				'Latitude': 43.6570017,
				'Longitude': -79.4537733,
				'Mode': 'Subway',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 715189,
				'Trip Date Time': '2017-10-12 1:20',
				'Latitude': 43.6687133,
				'Longitude': -79.3980283,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715189,
				'Trip Date Time': '2017-10-12 1:20',
				'Latitude': 43.6685817,
				'Longitude': -79.3975617,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715189,
				'Trip Date Time': '2017-10-12 1:20',
				'Latitude': 43.6682567,
				'Longitude': -79.3972833,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715189,
				'Trip Date Time': '2017-10-12 1:21',
				'Latitude': 43.6681383,
				'Longitude': -79.3979067,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 715212,
				'Trip Date Time': '2017-10-12 1:28',
				'Latitude': 43.667835,
				'Longitude': -79.3975417,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715212,
				'Trip Date Time': '2017-10-12 1:29',
				'Latitude': 43.667665,
				'Longitude': -79.39809,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715212,
				'Trip Date Time': '2017-10-12 1:30',
				'Latitude': 43.6672017,
				'Longitude': -79.3980633,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715212,
				'Trip Date Time': '2017-10-12 1:30',
				'Latitude': 43.6668083,
				'Longitude': -79.3979417,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715212,
				'Trip Date Time': '2017-10-12 1:31',
				'Latitude': 43.6658667,
				'Longitude': -79.3975033,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715212,
				'Trip Date Time': '2017-10-12 1:32',
				'Latitude': 43.6654983,
				'Longitude': -79.397365,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715212,
				'Trip Date Time': '2017-10-12 1:33',
				'Latitude': 43.664635,
				'Longitude': -79.3970483,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715212,
				'Trip Date Time': '2017-10-12 1:39',
				'Latitude': 43.6606067,
				'Longitude': -79.3950683,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:12',
				'Latitude': 43.6609417,
				'Longitude': -79.3948767,
				'Mode': 'Bicycle',
				'Travel Status': 'Start'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:12',
				'Latitude': 43.6612333,
				'Longitude': -79.394475,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:12',
				'Latitude': 43.6617817,
				'Longitude': -79.39435,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:12',
				'Latitude': 43.6621333,
				'Longitude': -79.3946967,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:13',
				'Latitude': 43.6625567,
				'Longitude': -79.3944083,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:13',
				'Latitude': 43.6629167,
				'Longitude': -79.3936783,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:13',
				'Latitude': 43.6631,
				'Longitude': -79.3931583,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:18',
				'Latitude': 43.6654817,
				'Longitude': -79.3822583,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:18',
				'Latitude': 43.66565,
				'Longitude': -79.3818067,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 12945,
				'Trip Id': 715220,
				'Trip Date Time': '2017-10-12 2:31',
				'Latitude': 43.6773817,
				'Longitude': -79.3530083,
				'Mode': 'Bicycle',
				'Travel Status': 'Stop'
			},
			//Date Oct 13
			{
				'User Id': 673178448,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:04',
				'Latitude': 43.6861383,
				'Longitude': -79.3403179,
				'Mode': 'Bicycle',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673178449,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:04',
				'Latitude': 43.68658,
				'Longitude': -79.3407317,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673178463,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:04',
				'Latitude': 43.68638,
				'Longitude': -79.3413667,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673178471,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:05',
				'Latitude': 43.686235,
				'Longitude': -79.34189,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673178479,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:05',
				'Latitude': 43.686135,
				'Longitude': -79.3423817,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673178495,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:05',
				'Latitude': 43.6858783,
				'Longitude': -79.3435033,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673178503,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:05',
				'Latitude': 43.6857733,
				'Longitude': -79.3440883,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673178519,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:06',
				'Latitude': 43.6855733,
				'Longitude': -79.345075,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673178527,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:06',
				'Latitude': 43.6854467,
				'Longitude': -79.34573,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},

			{
				'User Id': 673183600,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:12',
				'Latitude': 43.6777367,
				'Longitude': -79.3552383,
				'Mode': 'Bicycle',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673183632,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:13',
				'Latitude': 43.6770783,
				'Longitude': -79.3544283,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673183696,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:16',
				'Latitude': 43.6771933,
				'Longitude': -79.3534417,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673188723,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:31',
				'Latitude': 43.6766633,
				'Longitude': -79.3569733,
				'Mode': 'Bicycle',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673188731,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:31',
				'Latitude': 43.6765567,
				'Longitude': -79.3575883,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188739,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:31',
				'Latitude': 43.676435,
				'Longitude': -79.3582767,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188747,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:32',
				'Latitude': 43.6763683,
				'Longitude': -79.358825,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188755,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:32',
				'Latitude': 43.676245,
				'Longitude': -79.3595133,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188763,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:32',
				'Latitude': 43.67609,
				'Longitude': -79.3602417,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188771,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:32',
				'Latitude': 43.675925,
				'Longitude': -79.3609817,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188779,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:32',
				'Latitude': 43.6757717,
				'Longitude': -79.36174,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188787,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:33',
				'Latitude': 43.6756383,
				'Longitude': -79.36241,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188795,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:33',
				'Latitude': 43.675495,
				'Longitude': -79.363145,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673188803,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:33',
				'Latitude': 43.67537,
				'Longitude': -79.363785,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			}, {
				'User Id': 673196584,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:45',
				'Latitude': 43.6604667,
				'Longitude': -79.3952983,
				'Mode': 'Bicycle',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673196624,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:46',
				'Latitude': 43.6603333,
				'Longitude': -79.3968683,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673196679,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:48',
				'Latitude': 43.6605169,
				'Longitude': -79.3954049,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673197246,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:50',
				'Latitude': 43.6600927,
				'Longitude': -79.3958267,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673197248,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:50',
				'Latitude': 43.6603576,
				'Longitude': -79.3962635,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673199214,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:57',
				'Latitude': 43.6604153,
				'Longitude': -79.3961868,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673199833,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:58',
				'Latitude': 43.6604198,
				'Longitude': -79.3983217,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673199845,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:59',
				'Latitude': 43.6603576,
				'Longitude': -79.3962635,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673200498,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:59',
				'Latitude': 43.6599718,
				'Longitude': -79.3959922,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673200499,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 20:59',
				'Latitude': 43.6603576,
				'Longitude': -79.3962635,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673200502,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 21:00',
				'Latitude': 43.6605169,
				'Longitude': -79.3954049,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673321757,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 23:44',
				'Latitude': 43.6607618,
				'Longitude': -79.3948366,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673321823,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 23:45',
				'Latitude': 43.6611417,
				'Longitude': -79.3942333,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673321871,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 23:47',
				'Latitude': 43.6620533,
				'Longitude': -79.3941467,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673321903,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 23:47',
				'Latitude': 43.6624783,
				'Longitude': -79.3945917,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673321935,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 23:48',
				'Latitude': 43.6628167,
				'Longitude': -79.393945,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673321967,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-13 23:49',
				'Latitude': 43.66306,
				'Longitude': -79.3931767,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			//Date Oct 14
			{
				'User Id': 673339214,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 0:13',
				'Latitude': 43.6768033,
				'Longitude': -79.3559533,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673339275,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 0:16',
				'Latitude': 43.6769665,
				'Longitude': -79.3548831,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673339320,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 0:17',
				'Latitude': 43.67709,
				'Longitude': -79.35387,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673863881,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:17',
				'Latitude': 43.6803217,
				'Longitude': -79.346,
				'Mode': 'Car',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673863886,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:18',
				'Latitude': 43.6796683,
				'Longitude': -79.34655,
				'Mode': 'Car',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673863892,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:18',
				'Latitude': 43.67729,
				'Longitude': -79.3527417,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673863920,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:18',
				'Latitude': 43.6774233,
				'Longitude': -79.352085,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673863984,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:20',
				'Latitude': 43.6782933,
				'Longitude': -79.3525033,
				'Mode': 'Subway',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673864043,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:38',
				'Latitude': 43.6574996,
				'Longitude': -79.4521513,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673864046,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:38',
				'Latitude': 43.6571612,
				'Longitude': -79.452733,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673864051,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:38',
				'Latitude': 43.6560172,
				'Longitude': -79.4558635,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673864053,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:38',
				'Latitude': 43.6563875,
				'Longitude': -79.4577682,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673864054,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:39',
				'Latitude': 43.6556963,
				'Longitude': -79.458094,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673864055,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:39',
				'Latitude': 43.6555528,
				'Longitude': -79.4596333,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673864075,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:41',
				'Latitude': 43.653149,
				'Longitude': -79.4693887,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673864076,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:41',
				'Latitude': 43.6530924,
				'Longitude': -79.4703775,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673864144,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:52',
				'Latitude': 43.6485158,
				'Longitude': -79.509257,
				'Mode': 'Subway',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 673864181,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:56',
				'Latitude': 43.6486308,
				'Longitude': -79.5086338,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 673867144,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:58',
				'Latitude': 43.6482783,
				'Longitude': -79.5076617,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 673867146,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 14:58',
				'Latitude': 43.6487267,
				'Longitude': -79.5082867,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 674070043,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 19:10',
				'Latitude': 43.647484,
				'Longitude': -79.5111056,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 674070118,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 19:12',
				'Latitude': 43.6471467,
				'Longitude': -79.51218,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 674070134,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 19:12',
				'Latitude': 43.647045,
				'Longitude': -79.5126633,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 674070182,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 19:14',
				'Latitude': 43.646715,
				'Longitude': -79.5135667,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			}, {
				'User Id': 674170934,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 20:55',
				'Latitude': 43.6470717,
				'Longitude': -79.51365,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 674170966,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 20:56',
				'Latitude': 43.64708,
				'Longitude': -79.5129867,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 674171002,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 20:56',
				'Latitude': 43.6473783,
				'Longitude': -79.51219,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 674171262,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 21:03',
				'Latitude': 43.6479617,
				'Longitude': -79.5114783,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 674177957,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 21:11',
				'Latitude': 43.6476598,
				'Longitude': -79.5106005,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 674177993,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 21:11',
				'Latitude': 43.6478583,
				'Longitude': -79.509805,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 674178025,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 21:12',
				'Latitude': 43.6480517,
				'Longitude': -79.5087933,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 674178057,
				'Trip Id': 12945,
				'Trip Date Time': '2017-10-14 21:13',
				'Latitude': 43.648255,
				'Longitude': -79.5082233,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			//Nov 2
			{
				'User Id': 697120079,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:21',
				'Latitude': 43.6772617,
				'Longitude': -79.354015,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 697120138,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:22',
				'Latitude': 43.6770067,
				'Longitude': -79.35493,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 697120202,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:24',
				'Latitude': 43.677735,
				'Longitude': -79.3554783,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 697120234,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:24',
				'Latitude': 43.6781883,
				'Longitude': -79.355895,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 697120266,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:25',
				'Latitude': 43.6782283,
				'Longitude': -79.35663,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 697120298,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:26',
				'Latitude': 43.677765,
				'Longitude': -79.3567917,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 697120330,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:27',
				'Latitude': 43.6771867,
				'Longitude': -79.3566117,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 697120650,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:35',
				'Latitude': 43.67688,
				'Longitude': -79.3560583,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 697120666,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:35',
				'Latitude': 43.6769417,
				'Longitude': -79.355445,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 697120746,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:38',
				'Latitude': 43.6768696,
				'Longitude': -79.3544431,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 697120778,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:39',
				'Latitude': 43.6771967,
				'Longitude': -79.3536817,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 697120810,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-02 22:39',
				'Latitude': 43.6772833,
				'Longitude': -79.352985,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			//Nov 3
			{
				'User Id': 698354277,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 14:46',
				'Latitude': 43.676313,
				'Longitude': -79.358777,
				'Mode': 'Bicycle',
				'Travel Status': 'Start'
			},
			{
				'User Id': 698354308,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 14:47',
				'Latitude': 43.6761633,
				'Longitude': -79.359605,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698354316,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 14:47',
				'Latitude': 43.6760383,
				'Longitude': -79.3602517,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698354324,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 14:47',
				'Latitude': 43.6759167,
				'Longitude': -79.3608,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698354332,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 14:47',
				'Latitude': 43.6757917,
				'Longitude': -79.3614667,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698354340,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 14:47',
				'Latitude': 43.6756733,
				'Longitude': -79.3621133,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698354348,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 14:47',
				'Latitude': 43.6755133,
				'Longitude': -79.3628767,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698354356,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 14:48',
				'Latitude': 43.6753817,
				'Longitude': -79.3635017,
				'Mode': 'Bicycle',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698355046,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 15:03',
				'Latitude': 43.6610117,
				'Longitude': -79.39534,
				'Mode': 'Bicycle',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 698883059,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:05',
				'Latitude': 43.6604117,
				'Longitude': -79.3953483,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 698883123,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:07',
				'Latitude': 43.6601083,
				'Longitude': -79.396445,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698883155,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:07',
				'Latitude': 43.6603483,
				'Longitude': -79.3970483,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698883187,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:08',
				'Latitude': 43.6603333,
				'Longitude': -79.3978083,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698883219,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:09',
				'Latitude': 43.660215,
				'Longitude': -79.3986667,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698883251,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:09',
				'Latitude': 43.66077,
				'Longitude': -79.3991,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 698941064,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:53',
				'Latitude': 43.6609333,
				'Longitude': -79.3991483,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 698941080,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:54',
				'Latitude': 43.6605217,
				'Longitude': -79.398775,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698941128,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:55',
				'Latitude': 43.66037,
				'Longitude': -79.3979917,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698941144,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:55',
				'Latitude': 43.6603833,
				'Longitude': -79.3974167,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698941160,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:55',
				'Latitude': 43.6603183,
				'Longitude': -79.3968917,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698941192,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:56',
				'Latitude': 43.6599433,
				'Longitude': -79.3968433,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 698941265,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 20:58',
				'Latitude': 43.6599666,
				'Longitude': -79.3954391,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 699146849,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 21:34',
				'Latitude': 43.660505,
				'Longitude': -79.3963867,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 699146865,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-03 21:34',
				'Latitude': 43.660105,
				'Longitude': -79.3967717,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 700517515,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:30',
				'Latitude': 43.6778282,
				'Longitude': -79.3525181,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 700517528,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:30',
				'Latitude': 43.6781083,
				'Longitude': -79.3522017,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 700517641,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:42',
				'Latitude': 43.6819612,
				'Longitude': -79.3378534,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 700517642,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:42',
				'Latitude': 43.680895,
				'Longitude': -79.33752,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517643,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:42',
				'Latitude': 43.6820067,
				'Longitude': -79.3379067,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517700,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:43',
				'Latitude': 43.6825667,
				'Longitude': -79.3382183,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517732,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:44',
				'Latitude': 43.6831283,
				'Longitude': -79.3384667,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517764,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:44',
				'Latitude': 43.6835917,
				'Longitude': -79.3387633,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517796,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:45',
				'Latitude': 43.684105,
				'Longitude': -79.3388783,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517828,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:46',
				'Latitude': 43.6846883,
				'Longitude': -79.3391033,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517860,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:47',
				'Latitude': 43.685215,
				'Longitude': -79.3393083,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517892,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:47',
				'Latitude': 43.685825,
				'Longitude': -79.33953,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700517924,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 16:48',
				'Latitude': 43.6862283,
				'Longitude': -79.3397217,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 700952929,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:15',
				'Latitude': 43.6873933,
				'Longitude': -79.340745,
				'Mode': 'Car',
				'Travel Status': 'Start'
			},
			{
				'User Id': 700952945,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:15',
				'Latitude': 43.6876933,
				'Longitude': -79.3402683,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700952949,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:15',
				'Latitude': 43.6880633,
				'Longitude': -79.340395,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700952952,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:17',
				'Latitude': 43.6919362,
				'Longitude': -79.3421001,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700952955,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:17',
				'Latitude': 43.6925017,
				'Longitude': -79.34231,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700952975,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:17',
				'Latitude': 43.6932083,
				'Longitude': -79.34256,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700952991,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:17',
				'Latitude': 43.6938217,
				'Longitude': -79.34269,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700953007,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:18',
				'Latitude': 43.6941967,
				'Longitude': -79.3430017,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700953023,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:18',
				'Latitude': 43.694555,
				'Longitude': -79.343115,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700953241,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:25',
				'Latitude': 43.7106283,
				'Longitude': -79.3346067,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700953309,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 17:27',
				'Latitude': 43.718765,
				'Longitude': -79.33811,
				'Mode': 'Car',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 700956471,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 18:50',
				'Latitude': 44.1373517,
				'Longitude': -79.322145,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 700956475,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 18:51',
				'Latitude': 44.1368,
				'Longitude': -79.3220117,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 700956486,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.1506417,
				'Longitude': -79.325305,
				'Mode': 'Car',
				'Travel Status': 'Start'
			},
			{
				'User Id': 700956488,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.1513617,
				'Longitude': -79.325485,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700956491,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.1522317,
				'Longitude': -79.325665,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700956492,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.15264,
				'Longitude': -79.325755,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700956493,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.1530317,
				'Longitude': -79.32585,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700956495,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.1534367,
				'Longitude': -79.3259483,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700956496,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.1538233,
				'Longitude': -79.3260383,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700956499,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.1546033,
				'Longitude': -79.3262333,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700956500,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:28',
				'Latitude': 44.1549883,
				'Longitude': -79.326335,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 700957339,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-04 19:48',
				'Latitude': 44.3240217,
				'Longitude': -79.2768033,
				'Mode': 'Car',
				'Travel Status': 'Stop'
			},
			//Nov 5
			{
				'User Id': 702670594,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:06',
				'Latitude': 44.3236833,
				'Longitude': -79.2766,
				'Mode': 'Car',
				'Travel Status': 'Start'
			},
			{
				'User Id': 702670598,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:06',
				'Latitude': 44.3232433,
				'Longitude': -79.276385,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702670602,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:06',
				'Latitude': 44.3228133,
				'Longitude': -79.2762033,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702670606,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:06',
				'Latitude': 44.3223533,
				'Longitude': -79.275985,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702670613,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:10',
				'Latitude': 44.3112783,
				'Longitude': -79.3010917,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702670616,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:10',
				'Latitude': 44.3110317,
				'Longitude': -79.30224,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702670618,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:10',
				'Latitude': 44.3109033,
				'Longitude': -79.302805,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702670620,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:10',
				'Latitude': 44.310775,
				'Longitude': -79.3033817,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702670621,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:10',
				'Latitude': 44.3106433,
				'Longitude': -79.3039683,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702671010,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 16:19',
				'Latitude': 44.3039783,
				'Longitude': -79.3588933,
				'Mode': 'Car',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 702671206,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.3010665,
				'Longitude': -79.3714401,
				'Mode': 'Car',
				'Travel Status': 'Start'
			},
			{
				'User Id': 702671208,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.3007867,
				'Longitude': -79.3719667,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702671211,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.3009683,
				'Longitude': -79.3732983,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702671213,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.3008383,
				'Longitude': -79.3740367,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702671216,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.3006583,
				'Longitude': -79.3748967,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702671220,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.3004483,
				'Longitude': -79.375915,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702671226,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.3001633,
				'Longitude': -79.377185,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702671228,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.300035,
				'Longitude': -79.37776,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702671230,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 17:23',
				'Latitude': 44.299845,
				'Longitude': -79.3785483,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702673246,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:12',
				'Latitude': 44.001935,
				'Longitude': -79.45748,
				'Mode': 'Car',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 702673592,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:20',
				'Latitude': 44.0016567,
				'Longitude': -79.45873,
				'Mode': 'Car',
				'Travel Status': 'Start'
			},
			{
				'User Id': 702673596,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:21',
				'Latitude': 44.0015383,
				'Longitude': -79.4593033,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702673600,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:21',
				'Latitude': 44.0014133,
				'Longitude': -79.4598683,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702673604,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:21',
				'Latitude': 44.0012183,
				'Longitude': -79.460705,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702673608,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:21',
				'Latitude': 44.001075,
				'Longitude': -79.4614,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702673610,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:21',
				'Latitude': 44.0009517,
				'Longitude': -79.4619567,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702673616,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:21',
				'Latitude': 44.00071,
				'Longitude': -79.4630833,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702673620,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:21',
				'Latitude': 44.0005067,
				'Longitude': -79.463945,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702673622,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:21',
				'Latitude': 44.0003733,
				'Longitude': -79.46456,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702674316,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 18:37',
				'Latitude': 43.9126983,
				'Longitude': -79.4483833,
				'Mode': 'Car',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 702674602,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:00',
				'Latitude': 43.9136687,
				'Longitude': -79.4492814,
				'Mode': 'Car',
				'Travel Status': 'Start'
			},
			{
				'User Id': 702674603,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:00',
				'Latitude': 43.9119848,
				'Longitude': -79.4468418,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702674604,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:00',
				'Latitude': 43.9119583,
				'Longitude': -79.447825,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702674618,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:00',
				'Latitude': 43.9115333,
				'Longitude': -79.4470533,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702674626,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:00',
				'Latitude': 43.9111667,
				'Longitude': -79.446635,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702674630,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:00',
				'Latitude': 43.9105367,
				'Longitude': -79.4464683,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702674632,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:00',
				'Latitude': 43.9101233,
				'Longitude': -79.4463683,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702674634,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:00',
				'Latitude': 43.90957,
				'Longitude': -79.4462383,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702674638,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 19:01',
				'Latitude': 43.908875,
				'Longitude': -79.446075,
				'Mode': 'Car',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702678302,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:29',
				'Latitude': 43.6864,
				'Longitude': -79.3406183,
				'Mode': 'Car',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 702678706,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:39',
				'Latitude': 43.6863717,
				'Longitude': -79.33982,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 702678738,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:40',
				'Latitude': 43.6859267,
				'Longitude': -79.3396767,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702678770,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:41',
				'Latitude': 43.6854383,
				'Longitude': -79.33946,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702678802,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:41',
				'Latitude': 43.6849,
				'Longitude': -79.3391917,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702678834,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:42',
				'Latitude': 43.6843617,
				'Longitude': -79.338965,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702678866,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:43',
				'Latitude': 43.6838467,
				'Longitude': -79.3387883,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702678898,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:43',
				'Latitude': 43.6833567,
				'Longitude': -79.3385717,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702678930,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:44',
				'Latitude': 43.6827833,
				'Longitude': -79.3383133,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702678962,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:45',
				'Latitude': 43.6821483,
				'Longitude': -79.338005,
				'Mode': 'Walk',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702679234,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:51',
				'Latitude': 43.6792433,
				'Longitude': -79.3439733,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 702679266,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:52',
				'Latitude': 43.679,
				'Longitude': -79.3450433,
				'Mode': 'Subway',
				'Travel Status': 'Start'
			},
			{
				'User Id': 702679282,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:52',
				'Latitude': 43.6788917,
				'Longitude': -79.3458167,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702679290,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:52',
				'Latitude': 43.67879,
				'Longitude': -79.34633,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702679298,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:52',
				'Latitude': 43.67869,
				'Longitude': -79.346885,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702679306,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:53',
				'Latitude': 43.678565,
				'Longitude': -79.3474917,
				'Mode': 'Subway',
				'Travel Status': 'Travel'
			},
			{
				'User Id': 702679370,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:54',
				'Latitude': 43.6778317,
				'Longitude': -79.350975,
				'Mode': 'Subway',
				'Travel Status': 'Stop'
			},
			{
				'User Id': 702679458,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:56',
				'Latitude': 43.6776567,
				'Longitude': -79.3520717,
				'Mode': 'Walk',
				'Travel Status': 'Start'
			},
			{
				'User Id': 702679522,
				'Trip Id': 12945,
				'Trip Date Time': '2017-11-05 20:57',
				'Latitude': 43.6771467,
				'Longitude': -79.3530133,
				'Mode': 'Walk',
				'Travel Status': 'Stop'
			}
		];
	}
}
