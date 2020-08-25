import { Routes, RouterModule } from '@angular/router';
import { SampleManagementComponent } from '../sample-management/sample-management.component';

const routes: Routes = [
    { path: '', component: SampleManagementComponent, data: { title: 'Manage Samples' } },
    { path: 'samples', component: SampleManagementComponent, data: { title: 'Manage Samples' } },
];

export const ROUTES = RouterModule.forChild(routes);