import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { TranslateLanguageLoader } from "../../../shared/services/app-translation.service";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { ButtonsModule } from "ngx-bootstrap/buttons";
import { SurveyAnalyzeComponent } from "./survey-analyze.component";
import { ROUTES } from "./survey-analyze.routes";
import { DropzoneModule } from "ngx-dropzone-wrapper";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgSelectModule } from "@ng-select/ng-select";

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
		NgSelectModule,
		NgxDatatableModule
	],
	declarations: [SurveyAnalyzeComponent],
	providers: []
})
export class SurveyAnalyzeModule {}
