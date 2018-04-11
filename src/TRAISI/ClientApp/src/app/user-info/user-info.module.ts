import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { UserInfoComponent } from './user-info.component';
import { TranslateLanguageLoader } from '../services/app-translation.service';
import { Select2Module } from 'ng2-select2';

export const routes = [
  { path: '', component: UserInfoComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Select2Module,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useClass: TranslateLanguageLoader}
    })
  ],
  declarations: [UserInfoComponent]
})
export class UserInfoModule {
  static routes = routes;
}
