import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowpostComponent } from './showpost.component';

describe('ShowpostComponent', () => {
  let component: ShowpostComponent;
  let fixture: ComponentFixture<ShowpostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowpostComponent]
    });
    fixture = TestBed.createComponent(ShowpostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
