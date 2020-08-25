import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StatedPreferenceBuilderComponent } from './stated-preference-builder.component';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { NgJsonEditorModule } from 'ang-jsoneditor';
require('jsoneditor');
@NgModule({
	declarations: [ StatedPreferenceBuilderComponent],
	entryComponents: [ StatedPreferenceBuilderComponent],
	providers: [
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-sp-custom-builder',
					id: 'stated_preference_custom_builder',
					component: StatedPreferenceBuilderComponent
				}
			],
			multi: true
		}
	],
	imports: [CommonModule, HttpClientModule, FormsModule, CdkTableModule,NgJsonEditorModule]
})
export default class TraisiStatedPreferenceQuestionBuilderModule {}
