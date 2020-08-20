import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateLanguageLoader } from '../../../shared/services/app-translation.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccountManagementModule } from '../account-management/account-management.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ROUTES } from './sample-management.routes';

import { SharedModule } from '../shared/shared.module';
//import { GroupByPipe } from '../pipes/group-by.pipe';
import { FileUploadModule, FileSelectDirective } from 'ng2-file-upload';
import { BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import { BsDropdownModule} from 'ngx-bootstrap/dropdown';

import { NgSelectModule } from '@ng-select/ng-select';
import { SampleManagementComponent } from './sample-management.component';
import { SampleEditorComponent } from './sample-editor/sample-editor.component';
import { NgSelect2Component } from 'ng-select2';

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
		SharedModule,
		ROUTES,
		translateModuleForChild,
		ModalModule,
		AccountManagementModule,
		NgxDatatableModule,
		TooltipModule,
		bsDropdownForRoot,
		NgSelectModule,
		FileUploadModule
	],
	declarations: [ SampleManagementComponent, SampleEditorComponent],
	exports :  [ SampleEditorComponent ]
})
export class SampleManagementModule {}
