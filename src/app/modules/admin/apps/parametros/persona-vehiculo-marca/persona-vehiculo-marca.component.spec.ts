import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaVehiculoMarcaComponent } from './persona-vehiculo-marca.component';

describe('PersonaVehiculoMarcaComponent', () => {
  let component: PersonaVehiculoMarcaComponent;
  let fixture: ComponentFixture<PersonaVehiculoMarcaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaVehiculoMarcaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaVehiculoMarcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
