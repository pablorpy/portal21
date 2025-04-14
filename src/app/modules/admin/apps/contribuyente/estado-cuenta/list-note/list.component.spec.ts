import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoCuentaListComponent } from './list.component';

describe('ListComponent', () => {
  let component: EstadoCuentaListComponent;
  let fixture: ComponentFixture<EstadoCuentaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoCuentaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadoCuentaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
