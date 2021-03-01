import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsumosCategoriaComponent } from './insumos-categoria.component';

describe('InsumosCategoriaComponent', () => {
  let component: InsumosCategoriaComponent;
  let fixture: ComponentFixture<InsumosCategoriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsumosCategoriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsumosCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
