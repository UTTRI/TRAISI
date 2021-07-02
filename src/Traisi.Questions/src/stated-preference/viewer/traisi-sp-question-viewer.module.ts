import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StatedPreferenceQuestionComponent } from './stated-preference-question.component';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { StaticStatedPreferenceQuestionComponent } from './static-stated-preference-question.component';
@NgModule({
	declarations: [StatedPreferenceQuestionComponent,StaticStatedPreferenceQuestionComponent],
	entryComponents: [StatedPreferenceQuestionComponent,StaticStatedPreferenceQuestionComponent],
	providers: [
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-sp-question',
					id: 'stated_preference',
					component: StatedPreferenceQuestionComponent
				},
				{
					name: 'traisi-static-sp-question',
					id: 'static_stated_preference',
					component: StaticStatedPreferenceQuestionComponent
				}
			],
			multi: true 
		},
		
	],
	imports: [CommonModule, HttpClientModule, FormsModule, CdkTableModule]
})
export default class TraisiStatedPreferenceQuestionViewerModule {
	static moduleName = "stated-preference";
	static forRoot(): ModuleWithProviders<StaticStatedPreferenceQuestionComponent> {
		return {
			ngModule: StaticStatedPreferenceQuestionComponent,
			providers: [],
		};
	}
}


export const moduleName = "stated-preference";