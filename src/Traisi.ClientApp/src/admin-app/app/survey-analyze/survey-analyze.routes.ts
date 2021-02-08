import { Routes, RouterModule } from '@angular/router';
import { SurveyAnalyzeComponent } from './survey-analyze.component';
 
const routes: Routes = [
	{ path: ':id', component: SurveyAnalyzeComponent, data: { title: 'Survey Analyze' } },

];

export const ROUTES = RouterModule.forChild(routes);
