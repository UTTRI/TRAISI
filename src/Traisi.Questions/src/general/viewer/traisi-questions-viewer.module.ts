import { NgModule, ModuleWithProviders } from '@angular/core';
import { TextQuestionComponent } from './text-question/text-question.component';
import { RadioQuestionComponent } from './radio-question/radio-question.component';
import { HttpClientModule } from '@angular/common/http';
import { CheckboxQuestionComponent } from './checkbox-question/checkbox-question.component';
import { LikertQuestionComponent } from './likert-question/likert-question.component';
import { MatrixQuestionComponent } from './matrix-question/matrix-question.component';
import { NumberQuestionComponent } from './number-question/number-question.component';
import { RangeQuestionComponent } from './range-question/range-question.component';
import { SelectQuestionComponent } from './select-question/select-question.component';
import { HeadingQuestionComponent } from './heading-question/heading-question.component';
import { DateQuestionComponent } from './date-question/date-question.component';
import { TimeQuestionComponent } from './time-question/time-question.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HouseholdQuestionComponent } from './household-question/household-question.component';
import { TextMaskModule } from 'angular2-text-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { NumberQuestionValidatorDirective } from './number-question/number-question-validator.directive';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SliderQuestionComponent } from './slider-question/slider-question.component';
import { ContactInformationQuestionComponent } from './contact-information-question/contact-information-question.component';
import { NgxMaskModule, IConfig } from 'ngx-mask'
export const forRoot: ModuleWithProviders = BsDatepickerModule.forRoot();
export const tooltipForRoot: ModuleWithProviders = TooltipModule.forRoot();
@NgModule({
	declarations: [
		TextQuestionComponent,
		RadioQuestionComponent,
		NumberQuestionComponent,
		RangeQuestionComponent,
		CheckboxQuestionComponent,
		SelectQuestionComponent,
		HeadingQuestionComponent,
		TimeQuestionComponent,
		DateQuestionComponent,
		LikertQuestionComponent,
		NumberQuestionValidatorDirective,
		HouseholdQuestionComponent,
		SliderQuestionComponent,
		MatrixQuestionComponent,
		ContactInformationQuestionComponent
	],
	bootstrap: [TextQuestionComponent],
	entryComponents: [
		TextQuestionComponent,
		RadioQuestionComponent,
		NumberQuestionComponent,
		RangeQuestionComponent,
		CheckboxQuestionComponent,
		SelectQuestionComponent,
		HeadingQuestionComponent,
		TimeQuestionComponent,
		DateQuestionComponent,
		LikertQuestionComponent,
		HouseholdQuestionComponent,
		MatrixQuestionComponent,
		SliderQuestionComponent,
		ContactInformationQuestionComponent
	],
	providers: [
		{
			provide: 'test',
			useValue: {
				component: TextQuestionComponent
			}
		},
		{
			provide: 'traisi-text-question',
			useValue: {
				component: TextQuestionComponent
			}
		},
		{
			provide: 'traisi-radio-question',
			useValue: {
				component: RadioQuestionComponent
			}
		},
		{
			provide: 'widgets',
			multi: true,
			useValue: [
				{
					name: 'traisi-text-question',
					id: 'text',
					component: TextQuestionComponent
				},
				{
					name: 'traisi-radio-question',
					id: 'radio',
					component: RadioQuestionComponent
				},
				{
					name: 'traisi-checkbox-question',
					id: 'checkbox',
					component: CheckboxQuestionComponent
				},
				{
					name: 'traisi-likert-question',
					id: 'likert',
					component: LikertQuestionComponent
				},
				{
					name: 'traisi-matrix-question',
					id: 'matrix',
					component: MatrixQuestionComponent
				},
				{
					name: 'traisi-number-question',
					id: 'number',
					component: NumberQuestionComponent
				},
				{
					name: 'traisi-range-question',
					id: 'range',
					component: RangeQuestionComponent
				},
				{
					name: 'traisi-select-question',
					id: 'select',
					component: SelectQuestionComponent
				},
				{
					name: 'traisi-heading-question',
					id: 'heading',
					component: HeadingQuestionComponent
				},
				{
					name: 'traisi-date-question',
					id: 'date',
					component: DateQuestionComponent
				},
				{
					name: 'traisi-time-question',
					id: 'time',
					component: TimeQuestionComponent
				},
				{
					name: 'traisi-household-question',
					id: 'household',
					component: HouseholdQuestionComponent
				},
				{
					name: 'traisi-slider-question',
					id: 'slider',
					component: SliderQuestionComponent
				},
				{
					name: 'traisi-contact-information-question',
					id: 'contact-information',
					component: ContactInformationQuestionComponent
				},
				{
					name: 'traisi-matrix-question',
					id: 'matrix-qauestion',
					component: MatrixQuestionComponent
				}
			]
		}
	],
	id: 'traisi-questions',
	imports: [CommonModule, FormsModule, HttpClientModule, forRoot, tooltipForRoot, TextMaskModule, NgSelectModule, TimepickerModule,NgxMaskModule.forRoot()]
})
export default class TraisiQuestions {
	static moduleName = "general"; 
	static forRoot(): ModuleWithProviders<TraisiQuestions> {
		return {
			ngModule: TraisiQuestions,
			providers: [TextQuestionComponent]
		};
	}
}

export const moduleName = "general";