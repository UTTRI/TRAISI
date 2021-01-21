import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// RECOMMENDED
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { LocationLookupComponent } from 'shared/components/location-lookup.component';
import { GeoServiceClient } from 'shared/geoservice-api-client.service';
import { MapEndpointService } from '../map-question/services/mapservice.service';
import { TravelDiaryLoggerComponent } from './travel-diary-logger.component';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot()    
  ],
  providers : [ 
    GeoServiceClient,
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-travel-diary-logger',
					id: 'location',
					component: TravelDiaryLoggerComponent,
				},
				{
					name: 'traisi-location-lookup',
					id: 'location-lookup',
					component: LocationLookupComponent,
				},
			],
			multi: true,
		},
    MapEndpointService
   ]

})
export class TravelDiaryLoggerModule
{

}