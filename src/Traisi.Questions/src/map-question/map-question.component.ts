import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Inject,
	OnInit,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { MapMouseEvent, Marker, LngLat } from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapComponent } from 'ngx-mapbox-gl';
import { Result } from 'ngx-mapbox-gl/lib/control/geocoder-control.directive';
import { ReplaySubject, timer } from 'rxjs';
import {
	LocationResponseData,
	OnVisibilityChanged,
	ResponseTypes,
	ResponseValidationState,
	SurveyQuestion,
	SurveyViewer,
	QuestionConfigurationService,
	TraisiValues,
} from 'traisi-question-sdk';
import { GeoLocation } from './models/geo-location.model';
import { MapEndpointService } from './services/mapservice.service';
import templateString from './map-question.component.html';
import styleString from './map-question.component.scss';
import * as mapboxgl from 'mapbox-gl';
import markerPng from './marker.png';
import { MapQuestionConfiguration } from './models/map-question-configuration.model';
@Component({
	selector: 'traisi-map-question',
	template: '' + templateString,
	encapsulation: ViewEncapsulation.None,
	styles: ['' + styleString],
})
export class MapQuestionComponent extends SurveyQuestion<ResponseTypes.Location>
	implements OnInit, AfterViewInit, OnVisibilityChanged {
	public locationSearch: string;
	public locationLoaded: boolean = false;

	/**
	 * Purpose  of map question component
	 */
	public purpose: string = '';

	private _markerPosition: number[] = [-79.4, 43.67];

	private _defaultPosition: number[] = [-79.4, 43.67];

	public preferredHeight = 350;

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
		return purpose.icon;
	}

	@ViewChild('mapbox', { static: true })
	public mapGL: MapComponent;
	@ViewChild('geocoder', { static: true })
	public mapGeocoder: any;
	@ViewChild('geoLocator', { static: true })
	public mapGeoLocator: any;

	@ViewChild('mapMarker', { static: true })
	public mapMarker: ElementRef;

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
		private mapEndpointService: MapEndpointService,
		private _configurationService: QuestionConfigurationService,
		@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer,
		@Inject(TraisiValues.Configuration) private _configuration: MapQuestionConfiguration,
		@Inject('location.accesstoken') private _accessToken: string
	) {
		super();
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
			});
		}
	}

	/**
	 * on init
	 */
	public ngOnInit(): void {
		// this.accessToken = this._configurationService.getQuestionServerConfiguration('location')['AccessToken'];
		this.accessToken = this._configuration.AccessToken;
		if (this._configuration.purpose) {
			try {
				this._configuration.purpose = JSON.parse(this._configuration.purpose);
				this.purpose = this._configuration.purpose;
			} catch {}
		}
	} 

	public traisiOnInit(): void {}

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

	/**
	 * after view init
	 */
	public ngAfterViewInit(): void {
		this.savedResponse.subscribe(this.onSavedResponseData);
		this.surveyViewerService.updateNavigationState(false);
		(mapboxgl as any).accessToken = this.accessToken;
		this._map = new mapboxgl.Map({
			container: this.mapContainer.nativeElement,
			center: [-79.4, 43.67],
			style: 'mapbox://styles/mapbox/streets-v9',
			zoom: 14,
		});
		this._map.addControl(new mapboxgl.NavigationControl(), 'top-left');
		this._geocoder = new MapboxGeocoder({
			countries: 'ca',
			accessToken: mapboxgl.accessToken,
			mapboxgl: mapboxgl,
			marker: false,
		});
		if (this.loadGeocoder) {
			this._map.addControl(this._geocoder, 'top-right');
		}

		this._map.on('click', (ev: mapboxgl.MapMouseEvent) => {
			this.mapLocationClicked(ev.lngLat);
		});

		this._geocoder.on('result', (event) => {
			this.locationFound(event);
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
		console.log(iconStr);
		el.innerHTML = `<i class="${iconStr}"></i>`;
		this._marker = new mapboxgl.Marker(el, {
			anchor: 'bottom',
		});
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
	 * Click handler for map object.
	 * @param {LngLat} lngLat
	 */
	public mapLocationClicked(lngLat: LngLat): void {
		this.setMarkerLocation(lngLat);
		this.saveLocation(lngLat);
	}

	/**
	 * Saves the passed location. The address will be resolved using the server's geocode service.
	 * @private
	 * @param {LngLat} lngLat
	 */
	private saveLocation(lngLat: LngLat, address?: string): void {
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
	}

	/**
	 *	Updates the input text field with the passed address.
	 *
	 * @private
	 * @param {string} address
	 */
	private updateAddressInput(address: string | any): void {
		let addrObj;
		if (typeof address === 'string') {
			addrObj = JSON.parse(address);
		} else {
			addrObj = address;
		}
		let element: HTMLInputElement = document.querySelector('.mapboxgl-ctrl-geocoder--input');
		if (element) {
			element.value = `${addrObj['stnumber']} ${addrObj['staddress']}, ${addrObj['city']} ${addrObj['postal']}`;
		}
	}

	/**
	 * Locations found
	 * @param event
	 */
	public locationFound(event: { result: Result }): void {
		this.setMarkerLocation(new LngLat(event.result.geometry.coordinates[0], event.result.geometry.coordinates[1]));
		this.saveLocation(new LngLat(event.result.geometry.coordinates[0], event.result.geometry.coordinates[1]));
	}

	/**
	 * Sets question state
	 * @param latitude
	 * @param longitude
	 * @param location
	 */
	public setQuestionState(latitude: number, longitude: number, address: string): void {
		this.locationSearch = address;
		this.updateAddressInput(address);
		this.setMarkerLocation(new LngLat(longitude, latitude));
		this.flyToPosition([longitude, latitude]);
		this.locationLoaded = true;
	}

	/**
	 * Determines whether drag start on
	 * @param event
	 */
	public onDragStart(): void {}

	/**
	 *
	 * @param event
	 */
	public onDragEnd(event: Marker): void {
		this.flyToPosition(event.getLngLat().toArray());
		this.mapEndpointService
			.reverseGeocode(event.getLngLat().lat, event.getLngLat().lng)
			.subscribe((result: GeoLocation) => {
				this.locationSearch = result.address;
				this.mapGeocoder.control._inputEl.value = `${result.address['stnumber']} ${result.address['staddress']}, ${result.address['city']} ${result.address['postal']}`;

				let data: LocationResponseData = {
					latitude: event.getLngLat().lat,
					longitude: event.getLngLat().lng,
					address: <string>result.address,
				};

				this.saveResponse(data);
				this.surveyViewerService.updateNavigationState(true);
				this.validationState.emit(ResponseValidationState.VALID);
			});
	}

	/**
	 * Save the response to the response handler
	 *
	 * @private
	 * @param {*} coords
	 * @param {*} address
	 * @memberof MapQuestionComponent
	 */
	private saveResponse(data: LocationResponseData): void {
		this.response.emit(data);
	}

	/**
	 *
	 * @param event
	 */
	public onDrag(): void {}

	/**
	 * Determines whether question shown on
	 */
	public onQuestionShown(): void {
		if (this._map) {
			timer(5000).subscribe(() => {
				// this._map.resize();
			});
		}
	}

	public resize(): void {
		if (this._map) {
			this._map.resize();
		}
	}

	/**
	 * Determines whether question hidden on
	 */
	public onQuestionHidden(): void {}

	/**
	 * Loads configuration
	 * @param mapConfig
	 */
	public loadConfiguration(mapConfig: any): void {
		// this.accessToken = mapConfig.AccessToken;
		console.log(mapConfig);
	}

	public resetInput(): void {
		this._isMarkerAdded = false;
		this._marker.remove();
	}

	public clearLocation(): void {
		this.resetInput();
		this.validationState.emit(ResponseValidationState.INVALID);
		this.flyToPosition(this._defaultPosition);
	}
}
