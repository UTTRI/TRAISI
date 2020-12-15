import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule, PreloadAllModules, NoPreloading } from "@angular/router";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {TranslateModule, TranslateLoader, TranslatePipe} from "@ngx-translate/core";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { ToastrModule, ToastContainerModule } from "ngx-toastr";
import { ModalModule } from "ngx-bootstrap/modal";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { PopoverModule } from "ngx-bootstrap/popover";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { ButtonsModule } from "ngx-bootstrap/buttons";
import { AppRoutingModule } from "./app-routing.module";
import {
	AppTranslationService,
	TranslateLanguageLoader
} from "../../shared/services/app-translation.service";
import { LocalStoreManager } from "../../shared/services/local-store-manager.service";
import { EndpointFactory } from "../../shared/services/endpoint-factory.service";
import { EqualValidator } from "./directives/equal-validator.directive";
import { LastElementDirective } from "./directives/last-element.directive";
import { AutofocusDirective } from "./directives/autofocus.directive";
import { BootstrapTabDirective } from "./directives/bootstrap-tab.directive";
import { BootstrapToggleDirective } from "./directives/bootstrap-toggle.directive";
import { BootstrapSelectDirective } from "./directives/bootstrap-select.directive";
import { BootstrapDatepickerDirective } from "./directives/bootstrap-datepicker.directive";
import { AppComponent } from "./app.component";
import { AppConfig } from "./app.config";
import { ErrorComponent } from "./error/error.component";
import { SharedModule } from "./shared/shared.module";
import { TitleCasePipe } from "@angular/common";
import { MonacoEditorModule, NgxMonacoEditorConfig } from "ngx-monaco-editor";
import { TreeviewModule } from "ngx-treeview";
import { ContextMenuModule } from "ngx-contextmenu";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { TokenInterceptor } from "../../shared/interceptors/token.interceptor";
import { NgSelectModule } from '@ng-select/ng-select';
import "pace-progressbar";
import { SmartphonedataManagementComponent } from './smartphonedata-management/smartphonedata-management.component';

export function monacoLoad() {}

const monacoConfig: NgxMonacoEditorConfig = {
	baseUrl: "./assets", // configure base path for monaco editor
	defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
	onMonacoLoad: monacoLoad // here monaco object will be available as window.monaco use this function to extend monaco editor functionality.
};

const APP_PROVIDERS = [AppConfig];

@NgModule({
	bootstrap: [AppComponent],
	declarations: [
		AppComponent,
		ErrorComponent,
		EqualValidator,
		LastElementDirective,
		AutofocusDirective,
		BootstrapTabDirective,
		BootstrapToggleDirective,
		BootstrapDatepickerDirective,
		BootstrapSelectDirective
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		AppRoutingModule,
		HttpClientModule,
		SharedModule,
		NgSelectModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useClass: TranslateLanguageLoader
			}
		}),
		NgxDatatableModule,
		TooltipModule.forRoot(),
		PopoverModule.forRoot(),
		CarouselModule.forRoot(),
		ButtonsModule.forRoot(),
		ModalModule.forRoot(),
		TreeviewModule.forRoot(),
		ContextMenuModule.forRoot({
			autoFocus: true
		}),
		MonacoEditorModule.forRoot(monacoConfig),
		ToastrModule.forRoot({
			positionClass: "toast-top-right",
			progressBar: true,
			timeOut: 4000,
			closeButton: false,
			tapToDismiss: true
		}),
		ToastContainerModule
	],
	providers: [
		APP_PROVIDERS,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptor,
			multi: true
		},
		AppTranslationService,
		LocalStoreManager,
		EndpointFactory,
		TranslatePipe,
		TitleCasePipe
	]
})
export class AppModule {
	constructor() {}
}
