import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyExecuteComponent } from './survey-execute.component';

describe('SurveyExecuteComponent', () => {
  let component: SurveyExecuteComponent;
  let fixture: ComponentFixture<SurveyExecuteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyExecuteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
