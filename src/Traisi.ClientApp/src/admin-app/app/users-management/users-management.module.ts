import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateLanguageLoader } from '../../../shared/services/app-translation.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccountManagementModule } from '../account-management/account-management.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ROUTES } from './users-management.routes';

import { UsersManagementComponent } from './users-management/users-management.component';
import { RolesManagementComponent } from './roles-management/roles-management.component';
import { RoleEditorComponent } from './roles-management/role-editor.component';
import { SharedModule } from '../shared/shared.module';
import { GroupByPipe } from '../pipes/group-by.pipe';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
export const translateModuleForChild = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
		ROUTES,
		translateModuleForChild,
		ModalModule,
		AccountManagementModule,
		NgxDatatableModule,
		TooltipModule,
		NgSelectModule
	],
	declarations: [UsersManagementComponent, RolesManagementComponent, RoleEditorComponent, GroupByPipe]
})
export class UsersManagementModule {}
