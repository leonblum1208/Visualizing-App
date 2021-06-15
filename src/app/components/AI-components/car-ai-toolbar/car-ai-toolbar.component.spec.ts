import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarAiToolbarComponent } from './car-ai-toolbar.component';

describe('CarAiToolbarComponent', () => {
  let component: CarAiToolbarComponent;
  let fixture: ComponentFixture<CarAiToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarAiToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarAiToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
