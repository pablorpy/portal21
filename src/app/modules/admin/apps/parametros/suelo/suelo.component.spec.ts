import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SueloComponent } from './suelo.component';

describe('SueloComponent', () => {
  let component: SueloComponent;
  let fixture: ComponentFixture<SueloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SueloComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SueloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
