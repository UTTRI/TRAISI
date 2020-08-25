import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { WidgetModule } from '../layout/widget/widget.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateLanguageLoader } from '../../../shared/services/app-translation.service';

export const routes = [{ path: '', component: DashboardComponent, pathMatch: 'full' }];
export const routerForChild = RouterModule.forChild(routes);
export const translateForChild = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});
@NgModule({
	imports: [CommonModule, routerForChild, WidgetModule, NgxEchartsModule, translateForChild],
	declarations: [DashboardComponent]
})
export class DashboardModule {
	public static routes = routes;
}
