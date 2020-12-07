import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyExportresponsesComponent } from './survey-exportresponses.component';

describe('SurveyExportresponsesComponent', () => {
  let component: SurveyExportresponsesComponent;
  let fixture: ComponentFixture<SurveyExportresponsesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyExportresponsesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyExportresponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
