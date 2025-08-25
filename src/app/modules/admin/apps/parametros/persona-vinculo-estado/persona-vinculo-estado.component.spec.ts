import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaVinculoEstadoComponent } from './persona-vinculo-estado.component';

describe('PersonaVinculoEstadoComponent', () => {
  let component: PersonaVinculoEstadoComponent;
  let fixture: ComponentFixture<PersonaVinculoEstadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaVinculoEstadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaVinculoEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
