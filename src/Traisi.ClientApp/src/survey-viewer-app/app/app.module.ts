import { BrowserModule } from '@angular/platform-browser';
import { NgModule, InjectionToken, ModuleWithProviders } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, FormControlDirective, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { SurveyViewerEndpointFactory } from './services/survey-viewer-endpoint-factory.service';
import { AppRoutingModule } from './modules/routing/routing.module';
import { SurveyViewerContainerComponent } from './components/survey-viewer-container/survey-viewer-container.component';
import { SurveyViewerEndpointService } from './services/survey-viewer-endpoint.service';
import { SurveyErrorComponent } from './components/survey-error/survey-error.component';
import { SurveyStartPageComponent } from './components/survey-start-page/survey-start-page.component';
import { AppTranslationService, TranslateLanguageLoader } from '../../shared/services/app-translation.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { QuestionLoaderEndpointService } from './services/question-loader-endpoint.service';
import { QuestionContainerComponent } from './components/question-container/question-container.component';
import { QuestionPlaceholderComponent } from './components/question-placeholder/question-placeholder.component';
import { SurveyHeaderDisplayComponent } from './components/survey-header-display/survey-header-display.component';
import { SurveyTermsPageComponent } from './components/survey-terms-page/survey-terms-page.component';
import { SurveyViewerComponent } from './components/survey-viewer/survey-viewer.component';
import { QuestionLoaderService } from './services/question-loader.service';
import { SurveyViewerService } from './services/survey-viewer.service';
import { SurveyResponderEndpointService } from './services/survey-responder-endpoint.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AlertModule } from 'ngx-bootstrap/alert';
import { SurveyViewerTranslateLanguageLoader } from './services/survey-viewer-translation.service';
import { ConfigurationService } from '../../shared/services/configuration.service';
import { LocalStoreManager } from '../../shared/services/local-store-manager.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ModalModule, ModalBackdropComponent, BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { QuillModule } from 'ngx-quill';
import { SpecialPageBuilderComponent } from './components/special-page-builder/special-page-builder.component';
import { Header1Component } from './components/special-page-builder/header1/header1.component';
import { Header2Component } from './components/special-page-builder/header2/header2.component';
import { MainSurveyAccess1Component } from './components/special-page-builder/main-survey-access1/main-survey-access1.component';
import { TextBlock1Component } from './components/special-page-builder/text-block1/text-block1.component';
import { Footer1Component } from './components/special-page-builder/footer1/footer1.component';
import { PrivacyConfirmationComponent } from './components/special-page-builder/privacy-confirmation/privacy-confirmation.component';
import { SurveyViewerStateService } from './services/survey-viewer-state.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ConditionalEvaluator } from './services/conditional-evaluator/conditional-evaluator.service';
import { AdminToolbarComponent } from './components/admin-toolbar/admin-toolbar.component';
import { SurveyThankYouPageComponent } from './components/survey-thankyou-page/survey-thankyou-page.component';
import { SurveyGroupcodePageComponent } from './components/survey-groupcode-page/survey-groupcode-page.component';
import { SurveyScreeningPageComponent } from './components/survey-screening-page/survey-screening-page.component';
import { SurveyShortcodePageComponent } from './components/survey-shortcode-page/survey-shortcode-page.component';
import { SurveyShortcodeDisplayPageComponent } from './components/survey-shortcode-display-page/survey-shortcode-display-page.component';
import { SurveyViewerSession } from './services/survey-viewer-session.service';
import { SurveyViewerApiEndpointService } from './services/survey-viewer-api-endpoint.service';
import { httpInterceptorProviders } from './http-interceptors';
import { SurveyNavigationModule } from './modules/survey-navigation/survey-navigation.module';
import { SurveyViewerAuthorizationModule } from './modules/authorization/survey-viewer-authorization.module';
import { SurveyInternalViewDirective } from './directives/survey-internal-view/survey-internal-view.directive';
import { Saml2AuthorizationComponent } from './modules/authorization/saml2/saml2-authorization.component';
import { SurveyDataResolver } from './resolvers/survey-data.resolver';
import { SurveyTextTransformer } from './services/survey-text-transform/survey-text-transformer.service';
import { AuthInterceptor } from './http-interceptors/auth-interceptor';
import { ToastrModule } from 'ngx-toastr';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { QuestionConfigurationService } from './services/question-configuration.service';
import { QuestionConfigurationService as Config, TraisiValues } from 'traisi-question-sdk';
import { SurveyViewerResponseService } from './services/survey-viewer-response.service';
import { SurveyViewerRespondentService } from './services/survey-viewer-respondent.service';
import { SurveyProgressComponent } from './components/survey-progress/survey-progress.component';
import { StorageServiceModule, StorageService } from 'ngx-webstorage-service';
import { NgxPopperModule } from 'ngx-popper';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {
	CalendarModule,
	DateAdapter,
	CalendarCommonModule,
	CalendarDayModule,
	CalendarView,
	CalendarUtils,
} from 'angular-calendar';
import { SurveyViewerProviders } from './providers/survey-viewer.providers';
import { SurveyNavigatorComponent } from './components/survey-navigator/survey-navigator.component';
import { GoogleAnalyticsService } from './services/google-analytics.service';
export const calendarProps = {
	provide: DateAdapter,
	useFactory: adapterFactory,
};
export const calModule: ModuleWithProviders = CalendarModule.forRoot(calendarProps);
export const calC: ModuleWithProviders = CalendarCommonModule.forRoot(calendarProps);
export const STORAGE_TOKEN = new InjectionToken<StorageService>('STORAGE_TOKEN');

@NgModule({
	entryComponents: [ModalBackdropComponent],
	declarations: [
		AppComponent,
		SurveyViewerContainerComponent,
		SurveyErrorComponent,
		TextBlock1Component,
		Header1Component,
		Header2Component,
		MainSurveyAccess1Component,
		Footer1Component,
		SurveyStartPageComponent,
		QuestionContainerComponent,
		QuestionPlaceholderComponent,
		SurveyHeaderDisplayComponent,
		SurveyTermsPageComponent,
		SurveyViewerComponent,
		SurveyShortcodeDisplayPageComponent,
		SpecialPageBuilderComponent,
		PrivacyConfirmationComponent,
		SurveyInternalViewDirective,
		Saml2AuthorizationComponent,
		SurveyScreeningPageComponent,
		AdminToolbarComponent,
		SurveyThankYouPageComponent,
		SurveyGroupcodePageComponent,
		SurveyShortcodePageComponent,
		SurveyProgressComponent,
		SurveyNavigatorComponent,
	],
	imports: [
		BrowserModule,
		CommonModule,
		RouterModule,
		PipesModule,
		HttpClientModule,
		BrowserAnimationsModule,
		FormsModule,
		ModalModule.forRoot(),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useClass: SurveyViewerTranslateLanguageLoader,
			},
		}),
		ReactiveFormsModule,
		AppRoutingModule.forRoot(),
		BsDatepickerModule.forRoot(),
		AlertModule.forRoot(),
		PopoverModule.forRoot(),
		QuillModule.forRoot(),
		TooltipModule.forRoot(),
		TimepickerModule.forRoot(),
		SurveyNavigationModule.forRoot(),
		SurveyViewerAuthorizationModule,
		ToastrModule.forRoot(),
		calModule,
		calC,
		StorageServiceModule,
		NgxPopperModule.forRoot(),
	],
	providers: [
		LocalStoreManager,
		SurveyViewerEndpointFactory,
		QuestionLoaderEndpointService,
		AppTranslationService,
		SurveyViewerService,
		{ provide: 'SurveyViewerService', useExisting: SurveyViewerService },
		{ provide: 'SurveyViewerApiEndpointService', useClass: SurveyViewerApiEndpointService },
		SurveyViewerEndpointService,
		ConfigurationService,
		ConditionalEvaluator,
		SurveyViewerRespondentService,
		SurveyViewerResponseService,
		{ provide: TraisiValues.SurveyResponseService, useExisting: SurveyViewerResponseService },
		{ provide: TraisiValues.SurveyRespondentService, useExisting: SurveyViewerRespondentService },
		SurveyViewerStateService,
		FormControlDirective,
		FormGroupDirective,
		SurveyViewerSession,
		httpInterceptorProviders,
		SurveyResponderEndpointService,
		BsModalRef,
		{ provide: TraisiValues.QuestionLoader, useClass: QuestionLoaderService },
		{ provide: TraisiValues.SurveyAnalytics, useClass: GoogleAnalyticsService },
		{ provide: 'CONFIG_SERVICE', useExisting: QuestionConfigurationService },
		{ provide: Config, useExisting: QuestionConfigurationService },
		SurveyDataResolver,
		SurveyTextTransformer,

		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
		SurveyViewerResponseService,

		// SurveyDataResolver
	],
	bootstrap: [SurveyViewerContainerComponent],
})
export class AppModule {}
