import { NgModule, ModuleWithProviders } from '@angular/core';
import { MapQuestionComponent } from './map-question.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MapEndpointService } from './services/mapservice.service';
import { GeoServiceClient } from '../shared/geoservice-api-client.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { LocationLookupComponent } from './../shared/components/location-lookup.component';

// export const ngxMapWithConfig = NgxMapboxGLModule

@NgModule({
	declarations: [MapQuestionComponent, LocationLookupComponent],
	entryComponents: [MapQuestionComponent, LocationLookupComponent],
	providers: [
		GeoServiceClient,
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-map-question',
					id: 'location',
					component: MapQuestionComponent,
				},
				{
					name: 'traisi-location-lookup',
					id: 'location-lookup',
					component: LocationLookupComponent,
				},
			],
			multi: true,
		},
		MapEndpointService,
	],
	imports: [CommonModule, NgxMapboxGLModule, HttpClientModule, NgSelectModule, CommonModule, FormsModule],
})
export default class TraisiMapQuestion {
	static forRoot(): ModuleWithProviders<TraisiMapQuestion> {
		return {
			ngModule: TraisiMapQuestion,
			providers: [],
		};
	}
}
