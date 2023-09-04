import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatParentComponent } from './chat-parent.component';

describe('ChatParentComponent', () => {
  let component: ChatParentComponent;
  let fixture: ComponentFixture<ChatParentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatParentComponent]
    });
    fixture = TestBed.createComponent(ChatParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
