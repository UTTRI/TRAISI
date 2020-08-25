import { NgModule, ModuleWithProviders } from '@angular/core';
import { SurveyNavigator } from './services/survey-navigator/survey-navigator.service';
import { ViewTransformer } from './services/survey-navigator/view-transformer.service';

@NgModule({
	imports: [],
	declarations: [],
	providers: [],
	exports: [],
})
export class SurveyNavigationModule {
	public static forRoot(): ModuleWithProviders<SurveyNavigationModule> {
		return {
			ngModule: SurveyNavigationModule,
			providers: [SurveyNavigator, ViewTransformer],
		};
	}
}
