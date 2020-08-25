import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextBlock1Component } from './text-block1.component';

describe('TextBlock1Component', () => {
  let component: TextBlock1Component;
  let fixture: ComponentFixture<TextBlock1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextBlock1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextBlock1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
