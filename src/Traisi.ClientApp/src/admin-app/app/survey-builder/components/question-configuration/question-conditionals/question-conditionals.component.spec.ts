/// <reference path="../../../../../../../node_modules/@types/jasmine/index.d.ts" />

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionConditionalsComponent } from './question-conditionals.component';

describe('QuestionConditionalsComponent', () => {
	let component: QuestionConditionalsComponent;
	let fixture: ComponentFixture<QuestionConditionalsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [QuestionConditionalsComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(QuestionConditionalsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
