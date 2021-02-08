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
export class TravelDiaryLoggerComponent extends SurveyQuestion<ResponseTypes.String> implements OnInit, AfterViewInit {
	modalRef: BsModalRef;

	public locationSearch: string;
	public locationLoaded: boolean = false;

	/**
	 * Purpose  of map question component
	 */
	public purpose: string = '';

	private _markerPosition: number[] = [-79.4, 43.67];

	private _defaultPosition: number[] = [-79.4, 43.67];

	public preferredHeight = 350;


	public tripData:any[] = [
		{ deptTime :  "8:00 AM", mode  :   "Driver, alone", purpose :  "Office"},
		{ deptTime :  "10:00 AM", mode  :   "Transit", purpose :  "Community Centre"},
		{ deptTime :  "1:00 PM", mode  :   "Driver, with passenger", purpose :  "Shopping and errands"},
		{ deptTime :  "4:00 PM", mode  :   "Walk (entire trip)", purpose :  "Home"},
	];

	/**
	 * Gets marker position
	 */
	public get markerPosition(): number[] {
		return this._markerPosition;
	}

	/**
	 * Sets marker position
	 */
	public set markerPosition(val: number[]) {
		if (val !== undefined) {
			this.locationLoaded = true;
		} else {
			this.locationLoaded = false;
		}

		this._markerPosition = val;
	}

	/**
	 * Gets marker icon
	 */
	public getMarkerIcon(purpose: { label: string; id: string; icon: string }): string {
		return purpose?.icon;
	}

	@ViewChild('mapbox', { static: true })
	public mapGL: MapComponent;

	@ViewChild('geocoder', { static: true })
	public mapGeocoder: any;
	@ViewChild('geoLocator', { static: true })
	public mapGeoLocator: any;

	@ViewChild('mapMarker', { static: true })
	public mapMarker: ElementRef;

	@ViewChild('dateInput', { static: true })
	public dateInput: BsDatepickerDirective;

	public dateData: Date;

	bsInlineValue = new Date();
	bsInlineRangeValue: Date[];

	@ViewChild('locationSelect', { static: false })
	public locationSelect: LocationLookupComponent;

	@ViewChild('mapContainer', { static: false })
	public mapContainer: ElementRef;

	public mapInstance: ReplaySubject<mapboxgl.Map>;

	private _marker: mapboxgl.Marker;

	private _isMarkerAdded: boolean = false;

	private _map: mapboxgl.Map;

	private _geocoder: MapboxGeocoder;

	protected accessToken: string;

	public loadGeocoder: boolean = true;

	/**
	 * Creates an instance of map question component.
	 * @param mapEndpointService
	 * @param cdRef
	 * @param surveyViewerService
	 */

	constructor(
		//private mapEndpointService: MapEndpointService,
		private _configurationService: QuestionConfigurationService,
		private _element: ElementRef,
		private _geoService: GeoServiceClient,
		@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer, private modalService: BsModalService,
		@Inject('location.accesstoken') private _accessToken: string, @Inject(TraisiValues.Configuration) private _configuration: MapQuestionConfiguration) {
		super();
		this.surveyViewerService.configurationData.subscribe(this.loadConfigurationData);
		this.mapInstance = new ReplaySubject<mapboxgl.Map>(1);
		this._configuration.AccessToken = _accessToken;
		this.accessToken = _accessToken;
	}

	/**
	 * Flys to position
	 * @param val
	 */
	private flyToPosition(val: number[]): void {
		if (this._map) {
			this._map.flyTo({
				center: new LngLat(val[0], val[1]),
				duration: 500,
			});
		}
	}

	/**
	 * on init
	 */
	public ngOnInit(): void {
		//this.accessToken = this._configurationService.getQuestionServerConfiguration('location')['AccessToken'];
		this.accessToken = this._configuration.AccessToken;
		if (this._configuration.purpose) {
			try {
				this._configuration.purpose = JSON.parse(this._configuration.purpose);
				this.purpose = this._configuration.purpose;
			} catch { }
		}
	}

	public traisiOnInit(): void { }

/**
	 * Called when response data is ready
	 */
	private onSavedResponseData: (response: Array<LocationResponseData> | 'none') => void = (
		response: Array<LocationResponseData> | 'none'
	) => {
		if (response !== 'none') {
			let locationResponse = response[0];
			let coords = new LngLat(locationResponse['longitude'], locationResponse['latitude']);

			this.updateAddressInput(locationResponse.address);
			this.setMarkerLocation(coords);
			this.flyToPosition([coords.lng, coords.lat]);
			this.surveyViewerService.updateNavigationState(true);
			this.validationState.emit(ResponseValidationState.VALID);
		}
	};

	public onConfirmClick(): void {
			//this.response.emit([true]);
			this.validationState.emit(ResponseValidationState.VALID);
		
	}

	public loadConfigurationData(data: QuestionConfiguration[]): void { }
	
	/**
	 *
	 * @param $event
	 */
	public onLocationSelected($event: MapLocation) {
		this.setMarkerLocation(new LngLat($event.longitude, $event.latitude));
		this.flyToPosition([$event.longitude, $event.latitude]);
		this.updateAddressInput($event.address);
		this.saveLocationNoReverseGeocode(new LngLat($event.longitude, $event.latitude), $event.address);

	}

	public setMarkerLocation(lngLat: LngLat): void {
		if (this._marker) {
			this._marker.setLngLat(lngLat);
			if (!this._isMarkerAdded) {
				this._marker.addTo(this._map);
				this._isMarkerAdded = true;
			}
		}
	}

	/**
	 * after view init
	 */
	public ngAfterViewInit(): void {
		//this.savedResponse.subscribe(this.onSavedResponseData);
		this.surveyViewerService.updateNavigationState(false);
		(mapboxgl as any).accessToken = this.accessToken;
		this._map = new mapboxgl.Map({
			container: this.mapContainer.nativeElement,
			center: [-79.4, 43.67],
			style: 'mapbox://styles/mapbox/streets-v9',
			zoom: 14,
		});
		this._map.addControl(new mapboxgl.NavigationControl(), 'top-left');

		this._map.on('click', (ev: mapboxgl.MapMouseEvent) => {
			this.mapLocationClicked(ev.lngLat);
		});

		this._map.on('load', () => {
			setTimeout(() => {
				this._map.resize();
			});
		});

		var el = document.createElement('div');
		el.style.backgroundImage = `url(${markerPng})`;
		el.className = 'marker-overlay';
		el.style.width = '64px';
		el.style.height = '64px';
		let iconStr = this.getMarkerIcon(<any>this._configuration.purpose);
		el.innerHTML = `<i class="${iconStr}"></i>`;
		this._marker = new mapboxgl.Marker(el, {
			anchor: 'bottom',
		});
	}

	/**
	 * Click handler for map object.
	 * @param {LngLat} lngLat
	 */
	public mapLocationClicked(lngLat: LngLat): void {
		this._geoService.reverseGeocode(lngLat.lat, lngLat.lng).subscribe((x: MapLocation) => {
			this.setMarkerLocation(lngLat);
			this.saveLocationNoReverseGeocode(new LngLat(x.longitude, x.latitude), x.address);
			this.updateAddressInput(x.address);
		});
	}

	private saveLocationNoReverseGeocode(lngLat: LngLat, address?: Address) {
		let data: LocationResponseData = {
			latitude: lngLat.lat,
			longitude: lngLat.lng,
			address: address,
		};
		this.saveResponse(data);
		//this.validationState.emit(ResponseValidationState.VALID);
		this.surveyViewerService.updateNavigationState(true);
	}

	/**
	 * Saves the passed location. The address will be resolved using the server's geocode service.
	 * @private
	 * @param {LngLat} lngLat
	 */
	/*
	private saveLocation(lngLat: LngLat, address?: Address): void {
		this.mapEndpointService.reverseGeocode(lngLat.lat, lngLat.lng).subscribe((result: GeoLocation) => {
			let saveAddress = address === undefined ? result.address : address;
			this.updateAddressInput(saveAddress);
			let data: LocationResponseData = {
				latitude: lngLat.lat,
				longitude: lngLat.lng,
				address: saveAddress,
			};
			this.saveResponse(data);
			this.validationState.emit(ResponseValidationState.VALID);
			this.surveyViewerService.updateNavigationState(true);
		});
		this.surveyViewerService.updateNavigationState(true);
	} */


	/**
	 *	Updates the input text field with the passed address.
	 *
	 * @private
	 * @param {string} address
	 */
	private updateAddressInput(address: Address): void {
		if (address) {
			this.locationSelect.addressInputModel =
				address.formattedAddress ?? `${address.streetNumber} ${address.streetAddress}, ${address.city}`;
		} else {
			this.locationSelect.addressInputModel = undefined;
		}
	}

	/**
	 * Locations found
	 * @param event
	 */
	public locationFound(event: { result: Result }): void {
		console.log('got event location found');
		this.setMarkerLocation(new LngLat(event.result.geometry.coordinates[0], event.result.geometry.coordinates[1]));
		//this.saveLocation(new LngLat(event.result.geometry.coordinates[0], event.result.geometry.coordinates[1]));
	}
	
	/**
	 *
	 * @param lng
	 * @param lat
	 */
	public setMarkerLocationLngLat(lng: number, lat: number) {
		this.setMarkerLocation(new LngLat(lng, lat));
	}	

	public getAddressString(address: Address): string {
		return `${address.streetNumber} ${address.streetAddress}, ${address.city} ${address.postalCode}`;
	}

	/**
	 * Save the response to the response handler
	 *
	 * @private
	 * @param {*} coords
	 * @param {*} address
	 * @memberof MapQuestionComponent
	 */
	public saveResponse(data: LocationResponseData): void {
		//this.response.emit(data);
	}

	public resize(): void {
		if (this._map) {
			this._map.resize();
		}
	}
	
	/**
	 * Loads configuration
	 * @param mapConfig
	 */
	public loadConfiguration(mapConfig: any): void {
		//this.accessToken = mapConfig.AccessToken;
	}

	public resetInput(): void {
		this._isMarkerAdded = false;
		if (this._marker) {
			this._marker.remove();
		}
	}

	public clearLocation(): void {
		this.resetInput();
		//this.validationState.emit(ResponseValidationState.INVALID);
		this.flyToPosition(this._defaultPosition);
	}

}
