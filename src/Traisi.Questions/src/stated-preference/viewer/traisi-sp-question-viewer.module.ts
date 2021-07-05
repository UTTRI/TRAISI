import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { StaticStatedPreferenceQuestionComponent } from './static-stated-preference-question.component';
@NgModule({
	declarations: [StaticStatedPreferenceQuestionComponent],
	entryComponents: [StaticStatedPreferenceQuestionComponent],
	providers: [
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-static-sp-question',
					id: 'static_stated_preference',
					component: StaticStatedPreferenceQuestionComponent
				}
			],
			multi: true 
		},
		
	],
	imports: [CommonModule, HttpClientModule, FormsModule]
})
export default class TraisiStatedPreferenceQuestionViewerModule {
	static moduleName = "static-stated-preference";
	static forRoot(): ModuleWithProviders<StaticStatedPreferenceQuestionComponent> {
		return {
			ngModule: StaticStatedPreferenceQuestionComponent,
			providers: [],
		};
	}
}


export const moduleName = "static-stated-preference";