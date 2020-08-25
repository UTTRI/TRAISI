import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialPageBuilderComponent } from './special-page-builder.component';

describe('SpecialPageBuilderComponent', () => {
  let component: SpecialPageBuilderComponent;
  let fixture: ComponentFixture<SpecialPageBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialPageBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialPageBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
