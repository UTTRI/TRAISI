import { NgModule } from '@angular/core';
import { SurveyQuestionInternalViewDirective } from './directives/survey-question-internal-view.directive';
import { SurveyQuestionViewDirective } from './directives/survey-question-view.directive';
import { PopperContentComponent } from './components/popper/popper-content.component';

@NgModule({
	entryComponents: [PopperContentComponent],
	exports: [PopperContentComponent],
	declarations: [PopperContentComponent, SurveyQuestionInternalViewDirective, SurveyQuestionViewDirective]
})
export class TraisiSdkModule {
	public constructor() {}
}
