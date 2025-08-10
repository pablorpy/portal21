import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaConstruccionComponent } from './categoria-construccion.component';

describe('CategoriaConstruccionComponent', () => {
  let component: CategoriaConstruccionComponent;
  let fixture: ComponentFixture<CategoriaConstruccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaConstruccionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriaConstruccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
