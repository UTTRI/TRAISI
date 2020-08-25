import { NgModule, ModuleWithProviders } from '@angular/core';
import { MapQuestionComponent } from './map-question.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MapEndpointService } from './services/mapservice.service';

// export const ngxMapWithConfig = NgxMapboxGLModule

@NgModule({
	declarations: [MapQuestionComponent],
	entryComponents: [MapQuestionComponent],
	providers: [
		{
			provide: 'widgets',
			useValue: [
				{
					name: 'traisi-map-question',
					id: 'location',
					component: MapQuestionComponent
				}
			],
			multi: true
		},
		MapEndpointService
	],
	imports: [CommonModule, NgxMapboxGLModule, HttpClientModule]
})
export default class TraisiMapQuestion {
	static forRoot(): ModuleWithProviders<TraisiMapQuestion> {
		return {
			ngModule: TraisiMapQuestion,
			providers: []
		};
	}
}
