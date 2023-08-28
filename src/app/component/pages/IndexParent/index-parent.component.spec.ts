import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexParentComponent } from './index-parent.component';

describe('IndexParentComponent', () => {
  let component: IndexParentComponent;
  let fixture: ComponentFixture<IndexParentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndexParentComponent]
    });
    fixture = TestBed.createComponent(IndexParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
