import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { TranslateLanguageLoader } from '../../../shared/services/app-translation.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { GroupsManagementComponent } from './groups-management.component';
import { ROUTES } from './groups-management.routes';
import { ModalModule } from 'ngx-bootstrap/modal';

import { MonacoEditorModule } from 'ngx-monaco-editor';

export const translateModuleForChild = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});
@NgModule({
	imports: [
		CommonModule,
		ROUTES,
		FormsModule,
		SharedModule,
		ModalModule,
		translateModuleForChild,
		NgxDatatableModule,
		MonacoEditorModule
	],
	declarations: [GroupsManagementComponent]
})
export class GroupsManagementModule {}
