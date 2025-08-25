import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaSeparacionBienComponent } from './persona-separacion-bien.component';

describe('PersonaSeparacionBienComponent', () => {
  let component: PersonaSeparacionBienComponent;
  let fixture: ComponentFixture<PersonaSeparacionBienComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaSeparacionBienComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaSeparacionBienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
