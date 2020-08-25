/// <reference path="../../../../../../node_modules/@types/jasmine/index.d.ts" />

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionTypeChooserComponent } from './question-type-chooser.component';

describe('QuestionTypeChooserComponent', () => {
	let component: QuestionTypeChooserComponent;
	let fixture: ComponentFixture<QuestionTypeChooserComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [QuestionTypeChooserComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(QuestionTypeChooserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
