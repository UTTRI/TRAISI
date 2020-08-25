import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyAnalyzeComponent } from './survey-analyze.component';

describe('SurveyAnalyzeComponent', () => {
  let component: SurveyAnalyzeComponent;
  let fixture: ComponentFixture<SurveyAnalyzeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyAnalyzeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyAnalyzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
