import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoCuentaBoxListComponent } from './list.component';

describe('EstadoCuentaBoxListComponent', () => {
  let component: EstadoCuentaBoxListComponent;
  let fixture: ComponentFixture<EstadoCuentaBoxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoCuentaBoxListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadoCuentaBoxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
