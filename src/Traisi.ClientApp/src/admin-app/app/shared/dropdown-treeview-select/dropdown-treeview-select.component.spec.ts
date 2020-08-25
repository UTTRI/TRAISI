import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownTreeviewSelectComponent } from './dropdown-treeview-select.component';

describe('DropdownTreeviewSelectComponent', () => {
	let component: DropdownTreeviewSelectComponent;
	let fixture: ComponentFixture<DropdownTreeviewSelectComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DropdownTreeviewSelectComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DropdownTreeviewSelectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
