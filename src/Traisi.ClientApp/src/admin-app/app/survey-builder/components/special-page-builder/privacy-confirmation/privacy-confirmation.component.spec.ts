import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyConfirmationComponent } from './privacy-confirmation.component';

describe('PrivacyConfirmationComponent', () => {
  let component: PrivacyConfirmationComponent;
  let fixture: ComponentFixture<PrivacyConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
