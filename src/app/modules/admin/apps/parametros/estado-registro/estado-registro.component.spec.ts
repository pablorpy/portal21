import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoRegistroComponent } from './estado-registro.component';

describe('EstadoRegistroComponent', () => {
  let component: EstadoRegistroComponent;
  let fixture: ComponentFixture<EstadoRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoRegistroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadoRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
