import { NgModule } from '@angular/core';
import {
  NbMenuModule,
  NbButtonModule,
  NbCardModule,
  NbDialogModule,
  NbInputModule,
  NbIconModule,
  NbSpinnerModule,
  NbSelectModule,
  NbBadgeModule,
  NbListModule,
  NbAccordionModule,
  NbTreeGridModule,
  NbAutocompleteModule,
  NbDatepickerModule,
  NbToggleModule,
  NbPopoverModule,
  NbUserModule,
  NbFormFieldModule,
  NbLayoutModule,
  NbSidebarModule,
  NbCheckboxModule,
  NbTooltipModule
} from '@nebular/theme';

import { ColorPickerModule } from 'ngx-color-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { InsumosComponent } from './insumos/insumos.component';
import { InsumosCategoriaComponent } from './insumos-categoria/insumos-categoria.component';
import { HomeComponent } from './home/home.component';
import { MenuElementosComponent } from './menu-elementos/menu-elementos.component';
import { MenuComponent } from './menu/menu.component';
import { EmpresaCartasComponent } from './empresa-cartas/empresa-cartas.component';
import { AlmacenComponent } from './almacen/almacen.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { OrderModule } from 'ngx-order-pipe';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidosHistorialComponent } from './pedidos-historial/pedidos-historial.component';
import { GestionarMarcasComponent } from './gestionar-marcas/gestionar-marcas.component';
import { GestionarCategoriasComponent } from './gestionar-categorias/gestionar-categorias.component';
import { GestionarProductosComponent } from './gestionar-productos/gestionar-productos.component';
import { GestionarSubCategoriasComponent } from './gestionar-sub-categorias/gestionar-sub-categorias.component';
import { GestionarVentasComponent } from './gestionar-ventas/gestionar-ventas.component';
import { GestionCambiosDevolucionesComponent } from './gestion-cambios-devoluciones/gestion-cambios-devoluciones.component';
import { ReportesVentaComponent } from './reportes-venta/reportes-venta.component';
import { GestionarVentasRestauranteComponent } from './gestionar-ventas-restaurante/gestionar-ventas-restaurante.component';
import { GestionarRestauranteMesasComponent } from './gestionar-restaurante-mesas/gestionar-restaurante-mesas.component';
import { GestionarMesasComponent } from './gestionar-mesas/gestionar-mesas.component';
import { ReportesEmpresaVentasComponent } from './reportes-empresa-ventas/reportes-empresa-ventas.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';

@NgModule({
  imports: [
    NbDialogModule.forChild (),
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    MiscellaneousModule,
    NbButtonModule,
    NbCardModule,
    NbInputModule,
    FormsModule,
    ReactiveFormsModule,
    NbIconModule,
    NbSpinnerModule,
    NbTooltipModule,
    NbSelectModule,
    ColorPickerModule,
    NbBadgeModule,
    NbListModule,
    NbAccordionModule,
    NbTreeGridModule,
    NbAutocompleteModule,
    NbDatepickerModule,
    NbToggleModule,
    OrderModule,
    NbPopoverModule,
    NbUserModule,
    NbFormFieldModule,
    NbLayoutModule,
    NbSidebarModule,
    NbCheckboxModule
  ],
  declarations: [
    PagesComponent,
    InsumosComponent,
    InsumosCategoriaComponent,
    HomeComponent,
    MenuElementosComponent,
    MenuComponent,
    EmpresaCartasComponent,
    AlmacenComponent,
    UsuariosComponent,
    ConfiguracionComponent,
    PedidosComponent,
    PedidosHistorialComponent,
    GestionarMarcasComponent,
    GestionarCategoriasComponent,
    GestionarProductosComponent,
    GestionarSubCategoriasComponent,
    GestionarVentasComponent,
    GestionCambiosDevolucionesComponent,
    ReportesVentaComponent,
    GestionarVentasRestauranteComponent,
    GestionarRestauranteMesasComponent,
    GestionarMesasComponent,
    ReportesEmpresaVentasComponent,
    EstadisticasComponent
  ]
})
export class PagesModule {
}
