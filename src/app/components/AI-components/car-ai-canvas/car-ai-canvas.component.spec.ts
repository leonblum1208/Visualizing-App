import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarAiCanvasComponent } from './car-ai-canvas.component';

describe('CarAiCanvasComponent', () => {
  let component: CarAiCanvasComponent;
  let fixture: ComponentFixture<CarAiCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarAiCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarAiCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
