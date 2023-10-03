import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowalltradeComponent } from './showalltrade.component';

describe('ShowalltradeComponent', () => {
  let component: ShowalltradeComponent;
  let fixture: ComponentFixture<ShowalltradeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowalltradeComponent]
    });
    fixture = TestBed.createComponent(ShowalltradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
