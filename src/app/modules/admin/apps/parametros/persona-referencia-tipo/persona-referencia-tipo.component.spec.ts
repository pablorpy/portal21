import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaReferenciaTipoComponent } from './persona-referencia-tipo.component';

describe('PersonaReferenciaTipoComponent', () => {
  let component: PersonaReferenciaTipoComponent;
  let fixture: ComponentFixture<PersonaReferenciaTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaReferenciaTipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaReferenciaTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
