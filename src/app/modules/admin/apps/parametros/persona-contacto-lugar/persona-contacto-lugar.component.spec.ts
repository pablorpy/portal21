import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaContactoLugarComponent } from './persona-contacto-lugar.component';

describe('PersonaContactoLugarComponent', () => {
  let component: PersonaContactoLugarComponent;
  let fixture: ComponentFixture<PersonaContactoLugarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaContactoLugarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaContactoLugarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
