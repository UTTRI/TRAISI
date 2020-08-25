import { Routes, RouterModule } from '@angular/router';
import { GroupsManagementComponent } from './groups-management.component';


const routes: Routes = [
	{ path: '', component: GroupsManagementComponent, data: { title: 'Manage Groups' } },
];

export const ROUTES = RouterModule.forChild(routes);
