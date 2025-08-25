import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaAhorroTipoComponent } from './persona-ahorro-tipo.component';

describe('PersonaAhorroTipoComponent', () => {
  let component: PersonaAhorroTipoComponent;
  let fixture: ComponentFixture<PersonaAhorroTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaAhorroTipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaAhorroTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
