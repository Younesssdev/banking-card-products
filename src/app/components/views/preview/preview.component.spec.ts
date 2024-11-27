import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { previewComponent } from './preview.component';

describe('GridComponent', () => {
  let component: previewComponent;
  let fixture: ComponentFixture<previewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ previewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(previewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
