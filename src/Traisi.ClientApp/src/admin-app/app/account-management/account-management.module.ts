import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { TranslateLanguageLoader } from '../../../shared/services/app-translation.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgSelect2Module  } from 'ng-select2';

import { ROUTES } from './account-management.routes';

export const translateForChild = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});

// @dynamic
@NgModule({
	imports: [CommonModule, FormsModule, NgSelect2Module, ROUTES, translateForChild],
	declarations: [UserPreferencesComponent, UserInfoComponent],
	exports: [UserInfoComponent]
})
export class AccountManagementModule {}
