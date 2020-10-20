import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { concat, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, tap, debounceTime, switchMap, catchError, map } from 'rxjs/operators';
import { GeoServiceClient } from 'shared/geoservice-api-client.service';
import { MapLocation } from 'shared/models/map-location.model';
import templateString from './location-lookup.component.html';
import styleString from './location-lookup.component.scss';

@Component({
	selector: 'traisi-location-lookup',
	template: '' + templateString,
	providers: [GeoServiceClient],
	encapsulation: ViewEncapsulation.None,
	entryComponents: [],
	styles: ['' + styleString],
})
export class LocationLookupComponent implements OnInit {
	@Output()
	public locationSelected: EventEmitter<MapLocation> = new EventEmitter(true);

	public addressResults$: Observable<MapLocation[] | any>;

	public addressInput$ = new Subject<string>();

	public addressesLoading: boolean = false;

	@Input()
	public addressInputModel: any = null;

	public constructor(private _geoService: GeoServiceClient) {}

	public ngOnInit(): void {
		this._initializeAddressSearch();
	}

	private _initializeAddressSearch(): void {
		this.addressResults$ = concat(
			of([]), // default items
			this.addressInput$.pipe(
				distinctUntilChanged(),
				tap(() => (this.addressesLoading = true)),
				debounceTime(1000),
				switchMap((term) =>
					this._geoService.addressCompletion(term).pipe(
						catchError((err) => {
							return of([]);
						}),

						// empty list on error
						tap((x) => {
							this.addressesLoading = false;
						})
					)
				)
			)
		);
	}

	/**
	 *
	 * @param $event
	 */
	private retrieveLocationInfo($event: MapLocation): void {
		this._geoService.locationInfo($event.address.id).subscribe((x: MapLocation) => {
			this.locationSelected.emit(x);
		});
	}

	/**
	 *
	 * @param $event
	 */
	public addressChanged($event: MapLocation): void {
		this.retrieveLocationInfo($event);
	}
}
