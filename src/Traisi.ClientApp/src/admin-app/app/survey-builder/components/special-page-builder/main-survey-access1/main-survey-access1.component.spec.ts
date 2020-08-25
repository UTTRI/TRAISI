import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSurveyAccess1Component } from './main-survey-access1.component';

describe('MainSurveyAccess1Component', () => {
  let component: MainSurveyAccess1Component;
  let fixture: ComponentFixture<MainSurveyAccess1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainSurveyAccess1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainSurveyAccess1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
