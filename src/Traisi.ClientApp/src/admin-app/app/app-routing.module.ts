import { NgModule } from "@angular/core";
import { RouterModule, PreloadAllModules, NoPreloading } from "@angular/router";

import { AuthService } from "../../shared/services/auth.service";
import { AuthGuard } from "./services/auth-guard.service";
import { ErrorComponent } from "./error/error.component";

export const routingModule = RouterModule.forRoot(
	[
		{
			path: "",
			redirectTo: "app",
			pathMatch: "full"
		},
		/*{
			path: 'app/survey-viewer',
			canActivate: [AuthGuard],
			loadChildren:
				'./survey-viewer/survey-viewer.module#SurveyViewerModule'
		},*/
		{
			path: "app",
			canActivate: [AuthGuard],
			loadChildren: () =>
				import("./layout/layout.module").then(m => m.LayoutModule)
		},
		{
			path: "login",
			loadChildren: () =>
				import("./login/login.module").then(m => m.LoginModule)
		},
		{
			path: "error",
			component: ErrorComponent
		},
		{
			path: "**",
			component: ErrorComponent
		}
	],
	{
		useHash: false,
		preloadingStrategy: PreloadAllModules
	}
);

@NgModule({
	imports: [routingModule],
	exports: [RouterModule],
	providers: [AuthService, AuthGuard]
})
export class AppRoutingModule {}
