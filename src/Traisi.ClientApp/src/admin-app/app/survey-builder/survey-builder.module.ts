import { NgModule, InjectionToken, ANALYZE_FOR_ENTRY_COMPONENTS } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SurveyBuilderComponent } from "./survey-builder.component";
import { ROUTES } from "./survey-builder.routes";
import { SharedModule } from "../shared/shared.module";
import { QuestionPageDisplayComponent } from "./components/nested-drag-and-drop-list/nested-drag-and-drop-list.component";
import { TranslateLanguageLoader } from "../../../shared/services/app-translation.service";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { SurveyBuilderEndpointService } from "./services/survey-builder-endpoint.service";
import { SurveyBuilderService } from "./services/survey-builder.service";
import { QuillModule } from "ngx-quill";
import { NgxSmoothDnDModule } from "ngx-smooth-dnd";
import { QuestionTypeChooserComponent } from "./components/question-type-chooser/question-type-chooser.component";
import { TooltipModule,  } from "ngx-bootstrap/tooltip";
import {  ButtonsModule } from "ngx-bootstrap/buttons";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ModalModule } from "ngx-bootstrap/modal";
import { WidgetModule } from "../layout/widget/widget.module";
import { FormsModule } from "@angular/forms";
import { QuestionConfigurationComponent } from "./components/question-configuration/question-configuration.component";
import { NgxSelectModule } from "ngx-select-ex";
import { NgSelect2Module } from "ng-select2";
import { AmazingTimePickerModule } from "amazing-time-picker";
import { CheckboxComponent } from "./components/question-configuration/checkbox-field/checkbox.component";
import { DateInputComponent } from "./components/question-configuration/date-input-field/date-input.component";
import { DropdownListComponent } from "./components/question-configuration/dropdown-list-field/dropdown-list.component";
import { MultiSelectComponent } from "./components/question-configuration/multi-select-field/multi-select.component";
import { TextboxComponent } from "./components/question-configuration/textbox-field/textbox.component";
import { TextAreaComponent } from "./components/question-configuration/textarea-field/textarea.component";
import { NumericTextboxComponent } from "./components/question-configuration/numeric-textbox-field/numeric-textbox.component";
import { SliderComponent } from "./components/question-configuration/slider-field/slider.component";
import { SwitchComponent } from "./components/question-configuration/switch-field/switch.component";
import { TimeInputComponent } from "./components/question-configuration/time-input-field/time-input.component";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import { LocationFieldComponent } from "./components/question-configuration/location-field/location.component";
import { RadioComponent } from "./components/question-configuration/radio-field/radio.component";
import { QuestionDetailsComponent } from "./components/question-details/question-details.component";
import { TreeviewModule } from "ngx-treeview";
import { QuestionConditionalsComponent } from "./components/question-configuration/question-conditionals/question-conditionals.component";
import { SourceConditionalComponent } from "./components/question-configuration/question-conditionals/source-conditional/conditional.component";
import { SpecialPageBuilderComponent } from "./components/special-page-builder/special-page-builder.component";
import { Header1Component } from "./components/special-page-builder/header1/header1.component";
import { MainSurveyAccess1Component } from "./components/special-page-builder/main-survey-access1/main-survey-access1.component";
import { TextBlock1Component } from "./components/special-page-builder/text-block1/text-block1.component";
import { DropzoneModule } from "ngx-dropzone-wrapper";
import { DynamicModule } from "ng-dynamic-component";
import { ColorPickerModule } from "ngx-color-picker";
import { AngularDraggableModule } from "angular2-draggable";
import { NgToggleModule } from "@nth-cloud/ng-toggle";
import { Header2Component } from "./components/special-page-builder/header2/header2.component";
import { Footer1Component } from "./components/special-page-builder/footer1/footer1.component";
import { SponsorsComponent } from "./components/special-page-builder/sponsors/sponsors.component";
import { QuestionViewerComponent } from "./components/special-page-builder/question-viewer/question-viewer.component";
import { PrivacyConfirmationComponent } from "./components/special-page-builder/privacy-confirmation/privacy-confirmation.component";
import { ContextMenuModule } from "ngx-contextmenu";
import { IconPickerModule } from "ngx-icon-picker";
import { CustomBuilderService } from "./services/custom-builder.service";
import { CustomBuilderContainerDirective } from "./directives/custom-builder-container.directive";
import { ScreeningQuestionsComponent } from "./components/special-page-builder/screening-questions/screening-questions.component";
import { BUILDER_SERVICE, TraisiSurveyBuilder } from "traisi-question-sdk";
import { NgxBootstrapSliderModule } from "ngx-bootstrap-slider";
import { NgSelectModule } from "@ng-select/ng-select";
import { QueryBuilderModule } from 'angular2-query-builder';
import { SurveyLogicControlComponent } from './survey-logic-control/survey-logic-control.component';
import { UtilService } from 'shared/services/util.service';
import { FilterPipe } from 'shared/pipes/ftiler.pipe';
import { SurveyLogicQueryBuilderComponent } from './components/survey-logic-query-builder/survey-logic-query-builder.component';
export const SURVEY_BUILDER = new InjectionToken("builder.service");
export const bsDatepicker = BsDatepickerModule.forRoot();
export const pagination = PaginationModule.forRoot();
export const buttons = ButtonsModule.forRoot();
export const modalModule = ModalModule.forRoot();
export const quillModule = QuillModule.forRoot();
export const dynamicWithComponents = DynamicModule.withComponents([
	Header1Component,
	Header2Component,
	MainSurveyAccess1Component,
	TextBlock1Component,
	Footer1Component
]);

export const ngxMapbox = NgxMapboxGLModule.withConfig({
	accessToken: "empty"
});

export const translateForChild = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});

@NgModule({
	imports: [
		CommonModule,
		WidgetModule,
		SharedModule,
		modalModule,
		FormsModule,
		NgxSmoothDnDModule,
		TooltipModule,
		quillModule,
		bsDatepicker,
		NgxSelectModule,
		NgSelect2Module,
		TreeviewModule,
		DropzoneModule,
		ColorPickerModule,
		AngularDraggableModule,
		NgToggleModule,
		NgxBootstrapSliderModule,
		ContextMenuModule,
		IconPickerModule,
		pagination,
		buttons,
		NgSelectModule,
		dynamicWithComponents,
		AmazingTimePickerModule,
		ngxMapbox,
		ROUTES,
		translateForChild,
		QueryBuilderModule
	],
	declarations: [
		SurveyBuilderComponent,
		QuestionTypeChooserComponent,
		QuestionPageDisplayComponent,
		QuestionConfigurationComponent,
		CheckboxComponent,
		DateInputComponent,
		DropdownListComponent,
		MultiSelectComponent,
		TextboxComponent,
		TextAreaComponent,
		NumericTextboxComponent,
		SliderComponent,
		SwitchComponent,
		TimeInputComponent,
		LocationFieldComponent,
		RadioComponent,
		QuestionDetailsComponent,
		QuestionConditionalsComponent,
		SourceConditionalComponent,
		SpecialPageBuilderComponent,
		Header1Component,
		MainSurveyAccess1Component,
		TextBlock1Component,
		Header2Component,
		Footer1Component,
		SponsorsComponent,
		QuestionViewerComponent,
		CustomBuilderContainerDirective,
		PrivacyConfirmationComponent,
		ScreeningQuestionsComponent,
		SurveyLogicControlComponent,
		FilterPipe,
		SurveyLogicQueryBuilderComponent
	],
	providers: [
		SurveyBuilderEndpointService,
		SurveyBuilderService,
		CustomBuilderService,
		UtilService,
		{ provide: SURVEY_BUILDER, useClass: SurveyBuilderService }
	],
	exports: [MainSurveyAccess1Component],
	entryComponents: [
		MainSurveyAccess1Component,
		TextBlock1Component,
		CheckboxComponent,
		DateInputComponent,
		DropdownListComponent,
		MultiSelectComponent,
		TextboxComponent,
		TextAreaComponent,
		NumericTextboxComponent,
		SliderComponent,
		SwitchComponent,
		TimeInputComponent,
		LocationFieldComponent,
		RadioComponent,
		Header1Component,
		Header2Component,Footer1Component
	]
})
export class SurveyBuilderModule {}
