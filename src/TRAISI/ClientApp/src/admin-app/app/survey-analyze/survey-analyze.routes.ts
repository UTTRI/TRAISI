import { Routes, RouterModule } from '@angular/router';
import { SurveyAnalyzeComponent } from './survey-analyze.component';
 
const routes: Routes = [
	{ path: '', component: SurveyAnalyzeComponent, data: { title: 'Execute Survey' } },
	
];

export const ROUTES = RouterModule.forChild(routes);
