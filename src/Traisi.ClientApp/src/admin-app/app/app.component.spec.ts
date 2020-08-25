/// <reference path="../../../node_modules/@types/jasmine/index.d.ts" />

import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';

import { TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { AppTitleService } from './services/app-title.service';
import { AppTranslationService, TranslateLanguageLoader } from '../../shared/services/app-translation.service';
import { ConfigurationService } from '../../shared/services/configuration.service';
import { AlertService } from '../../shared/services/alert.service';
import { LocalStoreManager } from '../../shared/services/local-store-manager.service';
import { EndpointFactory } from '../../shared/services/endpoint-factory.service';
import { NotificationService } from './services/notification.service';
import { NotificationEndpoint } from './services/notification-endpoint.service';
import { AccountService } from './services/account.service';
import { AccountEndpoint } from './services/account-endpoint.service';
import { ToastrModule, ToastContainerModule } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';

describe('AppComponent', () => {
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				FormsModule,
				RouterTestingModule,
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateLanguageLoader
					}
				}),
				NgxDatatableModule,
				TooltipModule.forRoot(),
				PopoverModule.forRoot(),
				ModalModule.forRoot(),
				ToastrModule.forRoot({ positionClass: 'inline' }),
				ToastContainerModule
			],
			declarations: [AppComponent, LoginComponent],
			providers: [
				AuthService,
				AlertService,
				ConfigurationService,
				AppTitleService,
				AppTranslationService,
				NotificationService,
				NotificationEndpoint,
				AccountService,
				AccountEndpoint,
				LocalStoreManager,
				EndpointFactory,
				TranslatePipe
			]
		}).compileComponents();
	}));

	it('should create the app', async(() => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	}));

	/* it('should render Loaded! in a h1 tag', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('h1').textContent).toContain('Loaded!');
    }));*/
});
