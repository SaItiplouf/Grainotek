import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletetradedialogComponent } from './deletetradedialog.component';

describe('DeletetradedialogComponent', () => {
  let component: DeletetradedialogComponent;
  let fixture: ComponentFixture<DeletetradedialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeletetradedialogComponent]
    });
    fixture = TestBed.createComponent(DeletetradedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
