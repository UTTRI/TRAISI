/// <reference path="../../../node_modules/@types/jasmine/index.d.ts" />

import { RouterTestingModule } from '@angular/router/testing'
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {BrowserTestingModule} from '@angular/platform-browser/testing';
import { PipesModule } from '../../shared/pipes/pipes.module';


describe('AppComponent', () => {
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AppComponent], imports: [BrowserTestingModule, RouterTestingModule, PipesModule.forRoot()]
		}).compileComponents();
	}));
	it('should create the app', async(() => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	}));

});
