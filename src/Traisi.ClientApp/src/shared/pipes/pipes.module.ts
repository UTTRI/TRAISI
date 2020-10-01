import { NgModule, ModuleWithProviders } from '@angular/core';
import { FilterPipe } from './ftiler.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';
import { SafePipe } from './safe.pipe';

@NgModule({
	imports: [],
	declarations: [SafeHtmlPipe, SafePipe, FilterPipe],
	exports: [SafeHtmlPipe, SafePipe, FilterPipe],
})
export class PipesModule {
	public static forRoot(): ModuleWithProviders<PipesModule> {
		return {
			ngModule: PipesModule,
			providers: [],
		};
	}
}
