import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import {
	CalendarModule,
	DateAdapter,
	CalendarCommonModule,
	CalendarDayModule
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { FormsModule } from '@angular/forms';
import { RouteSelectQuestionComponent } from './route-select-question.component';
import { GeoServiceClient } from '../shared/geoservice-api-client.service';
import { RouteDisplayComponent } from './components/route-display.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouteDetailDialogComponent } from './components/route-detail-dialog.component';
import { ModalModule } from 'ngx-bootstrap/modal';
@NgModule({
	declarations: [RouteSelectQuestionComponent, RouteDisplayComponent, RouteDetailDialogComponent],
	entryComponents: [RouteSelectQuestionComponent, RouteDisplayComponent, RouteDetailDialogComponent],
	providers: [
		GeoServiceClient,
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-route-select-question',
					id: 'route-select',
					component: RouteSelectQuestionComponent,
				},
				{
					name: 'traisi-route-display',
					id: 'route-display',
					component: RouteDisplayComponent,
				},
				{
					name: 'traisi-route-detail-dialog',
					id: 'route-detail-dialog',
					component: RouteDetailDialogComponent,
				},
			],
			multi: true,
		},
	],
	imports: [CommonModule, FormsModule,ModalModule.forRoot()],
	exports: [],
})
export default class RouteSelectQuestionModule {
	static forRoot(): ModuleWithProviders<RouteSelectQuestionModule> {
		return {
			ngModule: RouteSelectQuestionModule,
			providers: [RouteSelectQuestionComponent],
		};
	}
}
