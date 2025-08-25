import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaIngresoPeriodicidadComponent } from './persona-ingreso-periodicidad.component';

describe('PersonaIngresoPeriodicidadComponent', () => {
  let component: PersonaIngresoPeriodicidadComponent;
  let fixture: ComponentFixture<PersonaIngresoPeriodicidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaIngresoPeriodicidadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaIngresoPeriodicidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
