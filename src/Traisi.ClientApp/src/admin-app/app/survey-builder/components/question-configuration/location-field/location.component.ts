import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MapComponent } from 'ngx-mapbox-gl';
import { QuestionConfigurationDefinition } from '../../../models/question-configuration-definition.model';

import { LngLatLike, MapMouseEvent } from 'mapbox-gl';

@Component({
	selector: 'app-location',
	templateUrl: './location.component.html',
	styleUrls: ['./location.component.scss']
})
export class LocationFieldComponent implements OnInit, AfterViewInit {
	public id: number;
	public questionConfiguration: QuestionConfigurationDefinition;
	public markerPosition;


	@ViewChild('mapbox', { static: true }) mapGL: MapComponent;

	constructor(private cdRef: ChangeDetectorRef) {

	}

	ngOnInit() {
		if (this.markerPosition === undefined) {
			this.setDefaultValue();
		}
		this.configureMapSettings();
	}

	ngAfterViewInit() {

	}

	updateBounds(bounds: any) {

	}

	setDefaultValue() {
		let locSplit = this.questionConfiguration.defaultValue.split('|');
		let lng = +locSplit[0];
		let lat = +locSplit[1];
		this.markerPosition = {lng: lng, lat: lat};
	}

	getValue(){
		return JSON.stringify(this.markerPosition);
	}

	processPriorValue(last: string) {
		this.markerPosition = JSON.parse(last);
	}

	private configureMapSettings(): void {
		this.mapGL.zoom = [9];
		this.mapGL.minZoom = 7;
		this.mapGL.center = [this.markerPosition.lng, this.markerPosition.lat];
		this.mapGL.doubleClickZoom = false;
		this.mapGL.attributionControl = false;
	}

	mapClick(event: MapMouseEvent) {
		if (event.lngLat) {
			this.markerPosition = event.lngLat;
		}
	}
}
