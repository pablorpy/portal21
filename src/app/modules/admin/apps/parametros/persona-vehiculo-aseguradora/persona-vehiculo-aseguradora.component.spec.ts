import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaVehiculoAseguradoraComponent } from './persona-vehiculo-aseguradora.component';

describe('PersonaVehiculoAseguradoraComponent', () => {
  let component: PersonaVehiculoAseguradoraComponent;
  let fixture: ComponentFixture<PersonaVehiculoAseguradoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaVehiculoAseguradoraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaVehiculoAseguradoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
