import { Routes, RouterModule } from '@angular/router';
import { SurveyExportresponsesComponent } from './survey-exportresponses.component';

const routes: Routes = [
	{ path: ':id', component: SurveyExportresponsesComponent, data: { title: 'Export Responses' } },
	
	];

export const ROUTES = RouterModule.forChild(routes);
