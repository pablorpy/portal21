import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoCuentaBoxDetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  let component: EstadoCuentaBoxDetailsComponent;
  let fixture: ComponentFixture<EstadoCuentaBoxDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoCuentaBoxDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadoCuentaBoxDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
