import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NestedDragAndDropListComponent } from './nested-drag-and-drop-list.component';

describe('NestedDragAndDropListComponent', () => {
	let component: NestedDragAndDropListComponent;
	let fixture: ComponentFixture<NestedDragAndDropListComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ NestedDragAndDropListComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NestedDragAndDropListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
