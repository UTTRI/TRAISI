/// <reference path="../../../../../../../../node_modules/@types/jasmine/index.d.ts" />

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceConditionalComponent } from './conditional.component';

describe('ConditionalComponent', () => {
	let component: SourceConditionalComponent;
	let fixture: ComponentFixture<SourceConditionalComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SourceConditionalComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SourceConditionalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
