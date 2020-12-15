import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { ChatAppComponent } from '../chat-app/chat-app.component';

const routes: Routes = [
	{
		path: '',
		component: LayoutComponent,
		children: [
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{
				path: 'dashboard',
				loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
				data: { test: false }
			},
			{
				path: 'account',
				loadChildren: () => import('../account-management/account-management.module').then(m => m.AccountManagementModule)
			},
			{
				path: 'users',
				loadChildren: () => import('../users-management/users-management.module').then(m => m.UsersManagementModule)
			},
			{
				path: 'surveys',
				loadChildren: () => import('../surveys-management/surveys-management.module').then(m => m.SurveysManagementModule)
			},
			{
				path: 'groups',
				loadChildren: () => import('../groups-management/groups-management.module').then(m => m.GroupsManagementModule)
			},
			{
				path: 'survey-builder',
				loadChildren: () => import('../survey-builder/survey-builder.module').then(m => m.SurveyBuilderModule),
				data: { hasSidebar: true }
			},
			{
				path: 'survey-execute',
				loadChildren: () => import('../survey-execute/survey-execute.module').then(m => m.SurveyExecuteModule)
			},
			{
				path: 'survey-analyze',
				loadChildren: () => import('../survey-analyze/survey-analyze.module').then(m => m.SurveyAnalyzeModule)
			},
			{
				path: 'survey-exportresponses',
				loadChildren: () => import('../survey-exportresponses/survey-exportresponses.module').then(m => m.SurveyExportresponsesModule)
			},
			{
				path: 'samples',
				loadChildren: () => import('../sample-management/sample-management.module').then(m => m.SampleManagementModule),
				data: { hasSidebar: true }
			},
			{
				path: 'smartphonedata',
				loadChildren: () => import('../smartphonedata-management/smartphonedata-management.module').then(m => m.SmartphonedataManagementModule),
				data: { hasSidebar: true }
			},
			{
				path: 'chat',
				component: ChatAppComponent
			}
		]
	}
];

export const ROUTES = RouterModule.forChild(routes);
