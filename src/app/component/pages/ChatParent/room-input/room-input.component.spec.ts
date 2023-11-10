import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomScreenComponent } from './room-input.component';

describe('RoomScreenComponent', () => {
  let component: RoomScreenComponent;
  let fixture: ComponentFixture<RoomScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoomScreenComponent]
    });
    fixture = TestBed.createComponent(RoomScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
