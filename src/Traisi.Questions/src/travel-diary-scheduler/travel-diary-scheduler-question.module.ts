import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlatpickrModule } from 'angularx-flatpickr';
import { FormsModule } from '@angular/forms';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AlertModule } from 'ngx-bootstrap/alert';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TravelDiaryQuestionComponent } from 'travel-diary/travel-diary-question.component';
import { TravelDiarySchedulerQuestionComponent } from './travel-diary-scheduler-question.component';
import { TravelDiarySchedulerItemComponent } from './components/travel-diary-scheduler-item.component';
import { TravelDiarySchedulerDialogInput } from './components/travel-diary-scheduler-dialog-input/travel-diary-scheduler-dialog-input.component';

@NgModule({
	declarations: [
		TravelDiarySchedulerQuestionComponent,
		TravelDiarySchedulerItemComponent,
		TravelDiarySchedulerDialogInput,
	],
	entryComponents: [
		TravelDiarySchedulerQuestionComponent,
		TravelDiarySchedulerItemComponent,
		TravelDiarySchedulerDialogInput,
	],
	providers: [
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-travel-diary-scheduler-question',
					id: 'travel-diary-scheduler',
					component: TravelDiarySchedulerQuestionComponent,
				},
				{
					name: 'traisi-travel-diary-scheduler-item',
					id: 'traisi-travel-diary-scheduler-item',
					component: TravelDiarySchedulerItemComponent,
				},
				{
					name: 'traisi-travel-diary-scheduler-dialog-input',
					id: 'traisi-travel-diary-scheduler-dialog-input',
					component: TravelDiarySchedulerDialogInput,
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
		,
	],
	imports: [
		RouterModule,
		CommonModule,
		FormsModule,
		HttpClientModule,
		ModalModule.forRoot(),
		FlatpickrModule.forRoot(),
		NgSelectModule,
		AlertModule.forRoot(),
		BsDropdownModule.forRoot(),
	],
	exports: [],
})
export default class TravelDiaryQuestionModule {
	static moduleName = 'travel-diary-scheduler';
	static forRoot(): ModuleWithProviders<TravelDiaryQuestionComponent> {
		return {
			ngModule: TravelDiaryQuestionComponent,
			providers: [],
		};
	}
}
export const moduleName = 'travel-diary-scheduler';
