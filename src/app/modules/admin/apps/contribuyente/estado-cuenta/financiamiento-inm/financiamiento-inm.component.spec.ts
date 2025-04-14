import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanciamientoInmComponent } from './financiamiento-inm.component';

describe('FinanciamientoInmComponent', () => {
  let component: FinanciamientoInmComponent;
  let fixture: ComponentFixture<FinanciamientoInmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanciamientoInmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanciamientoInmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
