import { Routes, RouterModule } from '@angular/router';
import { UsersManagementComponent } from './users-management/users-management.component';
import { RolesManagementComponent} from './roles-management/roles-management.component';

const routes: Routes = [
	{ path: '', component: UsersManagementComponent, data: { title: 'Manage Users' } },
	{ path: 'roles', component: RolesManagementComponent, data: { title: 'Manage Roles' } },
];

export const ROUTES = RouterModule.forChild(routes);
