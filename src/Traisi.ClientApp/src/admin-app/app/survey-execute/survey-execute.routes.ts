import { Routes, RouterModule } from '@angular/router';
import { SurveyExecuteComponent } from './survey-execute.component';
import { ConductSurveyComponent } from './conduct-survey/conduct-survey.component';

const routes: Routes = [
	{ path: ':id', component: SurveyExecuteComponent, data: { title: 'Execute Survey' } },
	{ path: ':id/:mode', component: ConductSurveyComponent, data: { title: 'Execute Survey' } },
];

export const ROUTES = RouterModule.forChild(routes);
