import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartphonedataManagementComponent } from './smartphonedata-management.component';

describe('SmartphonedataManagementComponent', () => {
  let component: SmartphonedataManagementComponent;
  let fixture: ComponentFixture<SmartphonedataManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartphonedataManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartphonedataManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
