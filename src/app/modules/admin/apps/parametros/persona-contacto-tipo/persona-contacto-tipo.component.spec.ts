import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaContactoTipoComponent } from './persona-contacto-tipo.component';

describe('PersonaContactoTipoComponent', () => {
  let component: PersonaContactoTipoComponent;
  let fixture: ComponentFixture<PersonaContactoTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaContactoTipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaContactoTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
