import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeningQuestionsComponent } from './screening-questions.component';

describe('ScreeningQuestionsComponent', () => {
  let component: ScreeningQuestionsComponent;
  let fixture: ComponentFixture<ScreeningQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreeningQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreeningQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
