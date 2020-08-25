import { Routes, RouterModule } from '@angular/router';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';

const routes: Routes = [
	{ path: 'info', component: UserInfoComponent, data: { title: 'Account Info' } },
	{ path: 'preferences', component: UserPreferencesComponent, data: { title: 'Account Preferences' } }
];

export const ROUTES = RouterModule.forChild(routes);
