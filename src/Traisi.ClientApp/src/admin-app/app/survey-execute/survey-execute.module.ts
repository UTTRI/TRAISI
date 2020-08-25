import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { TranslateLanguageLoader } from "../../../shared/services/app-translation.service";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { ButtonsModule } from "ngx-bootstrap/buttons";
import { SurveyExecuteComponent } from "./survey-execute.component";
import { ROUTES } from "./survey-execute.routes";
import { ConductSurveyComponent } from "./conduct-survey/conduct-survey.component";
import { DropzoneModule } from "ngx-dropzone-wrapper";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { SampleEditorComponent } from 'app/sample-management/sample-editor/sample-editor.component';
import { SampleManagementModule } from 'app/sample-management/sample-management.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FileUploadModule } from 'ng2-file-upload';
import { NgSelect2Module } from 'ng-select2';

export const buttonsModule = ButtonsModule.forRoot();
export const translateModule = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});

@NgModule({
	imports: [
		CommonModule,
		ROUTES,
		FormsModule,
		SharedModule,
		buttonsModule,
		translateModule,
		DropzoneModule,
		NgxDatatableModule,
		SampleManagementModule,
		NgSelect2Module,	
		FileUploadModule,
		ModalModule
	],
	declarations: [SurveyExecuteComponent, ConductSurveyComponent],
	providers: []
})
export class SurveyExecuteModule {}
