import 'jquery-slimscroll';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ROUTES } from './layout.routes';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ChatSidebarComponent } from './chat-sidebar/chat-sidebar.component';
import { ChatMessageComponent } from './chat-sidebar/chat-message/chat-message.component';
import { SearchPipe } from './pipes/search.pipe';
import { TranslateLanguageLoader } from '../../../shared/services/app-translation.service';
import { ChatAppComponent } from '../chat-app/chat-app.component';
import { MainSidebarComponent } from './main-sidebar/main-sidebar.component';

export const modalModule = ModalModule.forRoot();
export const dropdownModule = BsDropdownModule.forRoot();
export const tooltipModule = TooltipModule.forRoot();
export const translateModule = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});

@NgModule({
	imports: [
		CommonModule,
		tooltipModule,
		dropdownModule,
		translateModule,
		modalModule,
		ROUTES,
		FormsModule,
		LoadingBarRouterModule,
		
	],
	declarations: [
		LayoutComponent,
		SidebarComponent,
		NavbarComponent,
		ChatSidebarComponent,
		SearchPipe,
		ChatMessageComponent,
		ChatAppComponent,
		MainSidebarComponent
	]
})
export class LayoutModule {}
