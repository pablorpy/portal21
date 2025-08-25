import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaTipoComponent } from './persona-tipo.component';

describe('PersonaTipoComponent', () => {
  let component: PersonaTipoComponent;
  let fixture: ComponentFixture<PersonaTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaTipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
