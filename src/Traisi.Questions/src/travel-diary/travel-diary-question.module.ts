import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TravelDiaryQuestionComponent } from './travel-diary-question.component';
import { CalendarModule, DateAdapter, CalendarCommonModule, CalendarDayModule } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { FormsModule } from '@angular/forms';
import { TravelDiaryEditDialogComponent } from './components/travel-diary-edit-dialog.component';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { DayViewSchedulerComponent } from './components/day-view-scheduler.component';
import { TravelDiaryEventDisplayComponent } from './components/travel-diary-event-display.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ReturnTimeValidatorDirective } from './validators/return-time.directive';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TravelDiaryLinearViewComponent } from './components/travel-diary-linear-view.component';
import { TravelDiaryLinearViewEventDisplayComponent } from './components/travel-diary-linear-view-event-display/travel-diary-linear-view-event-display.component';

export const calendarProps = {
	provide: DateAdapter,
	useFactory: adapterFactory,
};
export const calModule: ModuleWithProviders = CalendarModule.forRoot(calendarProps);

@NgModule({
	declarations: [
		TravelDiaryQuestionComponent,
		TravelDiaryEditDialogComponent,
		DayViewSchedulerComponent,
		TravelDiaryEventDisplayComponent,
		ReturnTimeValidatorDirective,
		TravelDiaryLinearViewComponent,
		TravelDiaryLinearViewEventDisplayComponent
	],
	entryComponents: [
		TravelDiaryQuestionComponent,
		TravelDiaryEditDialogComponent,
		DayViewSchedulerComponent,
		TravelDiaryEventDisplayComponent,
		TravelDiaryLinearViewComponent,
		TravelDiaryLinearViewEventDisplayComponent
	],
	providers: [
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-travel-diary-question',
					id: 'travel-diary',
					component: TravelDiaryQuestionComponent,
				},
				{
					name: 'traisi-travel-diary-edit-dialog',
					id: 'travel-diary-edit-dialog',
					component: TravelDiaryEditDialogComponent,
				},
				{
					name: 'traisi-travel-dairy-day-view-scheduler',
					id: 'travel-diary-scheduler',
					component: DayViewSchedulerComponent,
				},
				{
					name: 'traisi-travel-dairy-event-display',
					id: 'travel-diary-event-display',
					component: TravelDiaryEventDisplayComponent,
				},
				{
					name: 'traisi-travel-dairy-linear-view',
					id: 'travel-diary-linear-view',
					component: TravelDiaryLinearViewComponent,
				},
				{
					name: 'traisi-travel-diary-linear-view-event-display',
					id: 'travel-diary-linear-view-event-display',
					component: TravelDiaryLinearViewEventDisplayComponent,
				},
				{
					name: 'returnTime',
					id: 'travel-diary-returnTime',
					component: ReturnTimeValidatorDirective,
				},
			],
			multi: true,
		},
		{
			provide: 'dependencies',
			useValue: {
				dependency: true,
				name: 'location',
			},
		},
		ReturnTimeValidatorDirective,
	],
	imports: [
		RouterModule,
		CommonModule,
		FormsModule,
		HttpClientModule,
		ModalModule.forRoot(),
		FlatpickrModule.forRoot(),
		CalendarModule.forRoot(calendarProps),
		CalendarCommonModule.forRoot(calendarProps),
		CalendarDayModule,
		NgSelectModule,
		AlertModule.forRoot(),
		BsDropdownModule.forRoot(),
		PopoverModule.forRoot(),
	],
	exports: [CalendarDayModule, CalendarModule, CalendarCommonModule],
})
export default class TravelDiaryQuestionModule {
	static moduleName = "travel-diary"; 
	static forRoot(): ModuleWithProviders<TravelDiaryQuestionComponent> {
		return {
			ngModule: TravelDiaryQuestionComponent,
			providers: [],
		};
	}
}
export const moduleName = "travel-diary";