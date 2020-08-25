import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { TranslateLanguageLoader } from '../../../shared/services/app-translation.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgSelect2Module } from 'ng-select2';

import { ModalModule } from 'ngx-bootstrap/modal';
import { AccountManagementModule } from '../account-management/account-management.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ROUTES } from './surveys-management.routes';
import { SurveysManagementComponent } from './surveys-management.component';
import { BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import { BsDropdownModule} from 'ngx-bootstrap/dropdown';
import { FileUploadModule } from 'ng2-file-upload';
import { SurveysEditorComponent } from './surveys-editor/surveys-editor.component';

export const translateModuleForChild = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});

export const bsForRoot = BsDatepickerModule.forRoot();
export const bsDropdownForRoot = BsDropdownModule.forRoot();

@NgModule({
	imports: [
		CommonModule,
		bsForRoot,
		FormsModule,
		NgSelect2Module,
		SharedModule,
		FileUploadModule,
		ROUTES,
		translateModuleForChild,
		ModalModule,
		AccountManagementModule,
		NgxDatatableModule,
		TooltipModule,
		bsDropdownForRoot
	],
	declarations: [SurveysManagementComponent, SurveysEditorComponent]
})
export class SurveysManagementModule {}
