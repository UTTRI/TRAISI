import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES } from './routes';
import { AuthService } from 'shared/services/auth.service';
import { EndpointFactory } from 'shared/services/endpoint-factory.service';

@NgModule({
	imports: [CommonModule, ROUTES],
	declarations: [],
	exports: [RouterModule]
})
export class AppRoutingModule {
	public static forRoot(): ModuleWithProviders<AppRoutingModule> {
		return {
			ngModule: AppRoutingModule,
			providers: [AuthService, EndpointFactory]
		};
	}
}
