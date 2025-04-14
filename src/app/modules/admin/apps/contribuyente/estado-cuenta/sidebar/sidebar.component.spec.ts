import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoCuentaBoxSidebarComponent } from './sidebar.component';

describe('EstadoCuentaBoxSidebarComponent', () => {
  let component: EstadoCuentaBoxSidebarComponent;
  let fixture: ComponentFixture<EstadoCuentaBoxSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoCuentaBoxSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadoCuentaBoxSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
