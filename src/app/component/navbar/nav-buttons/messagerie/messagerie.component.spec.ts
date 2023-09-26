import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagerieComponent } from './messagerie.component';

describe('MessagerieComponent', () => {
  let component: MessagerieComponent;
  let fixture: ComponentFixture<MessagerieComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessagerieComponent]
    });
    fixture = TestBed.createComponent(MessagerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
