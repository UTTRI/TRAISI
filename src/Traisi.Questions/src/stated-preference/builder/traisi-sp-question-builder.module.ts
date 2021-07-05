import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StatedPreferenceBuilderComponent } from './stated-preference-builder.component';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { StaticStatedPreferenceBuilderComponent } from './static-stated-preference-builder.component';
require('jsoneditor');
@NgModule({
	declarations: [StaticStatedPreferenceBuilderComponent],
	entryComponents: [StaticStatedPreferenceBuilderComponent],
	providers: [
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-static-sp-custom-builder',
					id: 'traisi-questions-sp-builder.module.js',
					component: StaticStatedPreferenceBuilderComponent
				}
			],
			multi: true
		}
	],
	imports: [CommonModule, HttpClientModule, FormsModule]
})
export default class TraisiStatedPreferenceQuestionBuilderModule { }
