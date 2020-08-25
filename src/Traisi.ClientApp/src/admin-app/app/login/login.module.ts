import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";

import { LoginComponent } from "./login.component";
import { TranslateLanguageLoader } from "../../../shared/services/app-translation.service";

export const routes = [
	{ path: "", component: LoginComponent, pathMatch: "full" }
];

export const routesModule = RouterModule.forChild(routes);
export const translateModule = TranslateModule.forChild({
	loader: { provide: TranslateLoader, useClass: TranslateLanguageLoader }
});

@NgModule({
	declarations: [LoginComponent],
	imports: [CommonModule, FormsModule, routesModule, translateModule]
})
export class LoginModule {
	static routes = routes;
}
