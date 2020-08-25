import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from '../../app.component';
import { LoginComponent } from '../../login/login.component';

import { TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrService, ToastrModule, ToastContainerModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';

// import { AuthService } from 'shared/services/auth.service';
import { AppTitleService } from '../../services/app-title.service';
// import { AlertService } from '../../services/alert.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationEndpoint } from '../../services/notification-endpoint.service';
import { AccountService } from '../../services/account.service';
import { AccountEndpoint } from '../../services/account-endpoint.service';
import { UserInfoComponent } from './user-info.component';
import { AuthService } from '../../../../shared/services/auth.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { TranslateLanguageLoader, AppTranslationService } from '../../../../shared/services/app-translation.service';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { LocalStoreManager } from '../../../../shared/services/local-store-manager.service';
import { EndpointFactory } from '../../../../shared/services/endpoint-factory.service';

describe('UserInfoComponent', () => {
	let component: UserInfoComponent;
	let fixture: ComponentFixture<UserInfoComponent>;

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
			declarations: [UserInfoComponent],
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

	beforeEach(() => {
		fixture = TestBed.createComponent(UserInfoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
