import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StatedPreferenceQuestionComponent } from './stated-preference-question.component';

import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
@NgModule({
	declarations: [StatedPreferenceQuestionComponent],
	entryComponents: [StatedPreferenceQuestionComponent],
	providers: [
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-sp-question',
					id: 'stated_preference',
					component: StatedPreferenceQuestionComponent
				}
			],
			multi: true 
		}
	],
	imports: [CommonModule, HttpClientModule, FormsModule, CdkTableModule]
})
export default class TraisiStatedPreferenceQuestionViewerModule { }
