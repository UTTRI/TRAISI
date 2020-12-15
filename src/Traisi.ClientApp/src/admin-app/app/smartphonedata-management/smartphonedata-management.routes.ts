import { Routes, RouterModule } from '@angular/router';
import { SmartphonedataManagementComponent } from '../smartphonedata-management/smartphonedata-management.component';

const routes: Routes = [
    { path: '', component: SmartphonedataManagementComponent, data: { title: 'Manage Smartphone Data' } },
    { path: 'smartphonedata', component: SmartphonedataManagementComponent, data: { title: 'Manage Smartphone Data' } },
];

export const ROUTES = RouterModule.forChild(routes);