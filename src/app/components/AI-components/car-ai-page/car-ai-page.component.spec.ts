import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarAIPageComponent } from './car-ai-page.component';

describe('CarAIPageComponent', () => {
  let component: CarAIPageComponent;
  let fixture: ComponentFixture<CarAIPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarAIPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarAIPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
