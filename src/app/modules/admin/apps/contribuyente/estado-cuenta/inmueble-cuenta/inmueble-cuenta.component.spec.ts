import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InmuebleCuentaComponent } from './inmueble-cuenta.component';

describe('InmuebleCuentaComponent', () => {
  let component: InmuebleCuentaComponent;
  let fixture: ComponentFixture<InmuebleCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InmuebleCuentaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InmuebleCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
