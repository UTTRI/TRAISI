import { Routes, RouterModule } from '@angular/router';
import { SurveyBuilderComponent } from './survey-builder.component';
import { QuestionTypeChooserComponent } from './components/question-type-chooser/question-type-chooser.component';

const routes: Routes = [
	{ path: ':id', component: SurveyBuilderComponent, data: { title: 'Survey Builder', hasSidebar: true }, },
];

export const ROUTES = RouterModule.forChild(routes);
