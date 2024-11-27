import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { attributesComponent } from './attributes.component';

describe('GridComponent', () => {
  let component: attributesComponent;
  let fixture: ComponentFixture<attributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ attributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(attributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
