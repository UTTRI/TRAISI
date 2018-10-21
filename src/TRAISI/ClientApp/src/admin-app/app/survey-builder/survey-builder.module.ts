import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyBuilderComponent } from './survey-builder.component';
import { ROUTES } from './survey-builder.routes';
import { SharedModule } from '../shared/shared.module';
import { NestedDragAndDropListComponent } from './components/nested-drag-and-drop-list/nested-drag-and-drop-list.component';
import { TranslateLanguageLoader } from '../../../shared/services/app-translation.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgxTreeSelectModule } from 'ngx-tree-select';

import { SurveyBuilderEndpointService } from './services/survey-builder-endpoint.service';
import { SurveyBuilderService } from './services/survey-builder.service';
import { QuillModule } from 'ngx-quill';
import { NgxSmoothDnDModule } from '../shared/ngx-smooth-dnd/ngx-smooth-dnd.module';
import { QuestionTypeChooserComponent } from './components/question-type-chooser/question-type-chooser.component';
import { TooltipModule, ModalModule, BsDatepickerModule, ButtonsModule, PaginationModule } from 'ngx-bootstrap';
import { WidgetModule } from '../layout/widget/widget.module';
import { FormsModule } from '@angular/forms';
import { QuestionConfigurationComponent } from './components/question-configuration/question-configuration.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { Select2Module } from 'ng2-select2';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { ChartsModule } from 'ng2-charts';
import { CheckboxComponent } from './components/question-configuration/checkbox-field/checkbox.component';
import { DateInputComponent } from './components/question-configuration/date-input-field/date-input.component';
import { DropdownListComponent } from './components/question-configuration/dropdown-list-field/dropdown-list.component';
import { MultiSelectComponent } from './components/question-configuration/multi-select-field/multi-select.component';
import { TextboxComponent } from './components/question-configuration/textbox-field/textbox.component';
import { TextAreaComponent } from './components/question-configuration/textarea-field/textarea.component';
import { NumericTextboxComponent } from './components/question-configuration/numeric-textbox-field/numeric-textbox.component';
import { SliderComponent } from './components/question-configuration/slider-field/slider.component';
import { SwitchComponent } from './components/question-configuration/switch-field/switch.component';
import { TimeInputComponent } from './components/question-configuration/time-input-field/time-input.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { LocationFieldComponent } from './components/question-configuration/location-field/location.component';
import { RadioComponent } from './components/question-configuration/radio-field/radio.component';
import { QuestionDetailsComponent } from './components/question-details/question-details.component';
import { TreeviewModule } from 'ngx-treeview';
import { QuestionConditionalsComponent } from './components/question-configuration/question-conditionals/question-conditionals.component';
import { SourceConditionalComponent } from './components/question-configuration/question-conditionals/source-conditional/conditional.component';
import { TargetConditionalComponent } from './components/question-configuration/question-conditionals/target-conditional/target-conditional.component';
import { SpecialPageBuilderComponent } from './components/special-page-builder/special-page-builder.component';
import { Header1Component } from './components/special-page-builder/header1/header1.component';
import { MainSurveyAccess1Component } from './components/special-page-builder/main-survey-access1/main-survey-access1.component';
import { TextBlock1Component } from './components/special-page-builder/text-block1/text-block1.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DynamicModule } from 'ng-dynamic-component';
import { ColorPickerModule } from 'ngx-color-picker';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgxToggleModule } from 'ngx-toggle';
import { Header2Component } from './components/special-page-builder/header2/header2.component';
import { Footer1Component } from './components/special-page-builder/footer1/footer1.component';
import { SponsorsComponent } from './components/special-page-builder/sponsors/sponsors.component';
import { QuestionViewerComponent } from './components/special-page-builder/question-viewer/question-viewer.component';
import { PrivacyConfirmationComponent } from './components/special-page-builder/privacy-confirmation/privacy-confirmation.component';
import { ContextMenuModule } from 'ngx-contextmenu';

@NgModule({
	imports: [
		CommonModule,
		WidgetModule,
		SharedModule,
		ModalModule,
		FormsModule,
		NgxSmoothDnDModule,
		TooltipModule,
		QuillModule,
		BsDatepickerModule.forRoot(),
		NgxSelectModule,
		NgxBootstrapSliderModule,
		Select2Module,
		ChartsModule,
		TreeviewModule,
		DropzoneModule,
		ColorPickerModule,
		AngularDraggableModule,
		NgxToggleModule,
		ContextMenuModule,
		PaginationModule.forRoot(),
		ButtonsModule.forRoot(),
		DynamicModule.withComponents([
			Header1Component,
			Header2Component,
			MainSurveyAccess1Component,
			TextBlock1Component,
			Footer1Component
		]),
		AmazingTimePickerModule,
		NgxTreeSelectModule.forRoot({
			allowFilter: false,
			filterPlaceholder: 'Type your filter here...',
			maxVisibleItemCount: 5,
			idField: 'value',
			textField: 'text',
			childrenField: 'children',
			allowParentSelection: true,
			expandMode: 'None'
		}),
		NgxMapboxGLModule.forRoot({
			accessToken:
				'pk.eyJ1IjoiYnJlbmRhbmJlbnRpbmciLCJhIjoiY2oyOTlwdjNjMDB5cTMzcXFsdmRyM3NnNCJ9.NXgWTnWfvGRnNgkWdd5wKg'
		}),
		ROUTES,
		TranslateModule.forChild({
			loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
		})
	],
	declarations: [
		SurveyBuilderComponent,
		QuestionTypeChooserComponent,
		NestedDragAndDropListComponent,
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
		TargetConditionalComponent,
		SpecialPageBuilderComponent,
		Header1Component,
		MainSurveyAccess1Component,
		TextBlock1Component,
		Header2Component,
		Footer1Component,
		SponsorsComponent,
		QuestionViewerComponent,
		PrivacyConfirmationComponent
	],
	providers: [SurveyBuilderEndpointService, SurveyBuilderService],
	entryComponents: [
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
		RadioComponent
	]
})
export class SurveyBuilderModule {}
