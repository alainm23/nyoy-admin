import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { InsumosComponent } from '../pages/insumos/insumos.component';
import { InsumosCategoriaComponent } from '../pages/insumos-categoria/insumos-categoria.component';
import { MenuElementosComponent } from '../pages/menu-elementos/menu-elementos.component';
import { MenuComponent } from '../pages/menu/menu.component';
import { HomeComponent } from '../pages/home/home.component';
import { EmpresaCartasComponent } from '../pages/empresa-cartas/empresa-cartas.component';
import { AlmacenComponent } from '../pages/almacen/almacen.component';
import { UsuariosComponent } from '../pages/usuarios/usuarios.component';
import { ConfiguracionComponent } from '../pages/configuracion/configuracion.component';
import { PedidosComponent } from '../pages/pedidos/pedidos.component';
import { PedidosHistorialComponent } from '../pages/pedidos-historial/pedidos-historial.component';
import { GestionarMarcasComponent } from '../pages/gestionar-marcas/gestionar-marcas.component';
import { GestionarCategoriasComponent } from '../pages/gestionar-categorias/gestionar-categorias.component';
import { GestionarProductosComponent } from '../pages/gestionar-productos/gestionar-productos.component';
import { GestionarSubCategoriasComponent } from '../pages/gestionar-sub-categorias/gestionar-sub-categorias.component';
import { GestionarVentasComponent } from '../pages/gestionar-ventas/gestionar-ventas.component';
import { GestionCambiosDevolucionesComponent } from './gestion-cambios-devoluciones/gestion-cambios-devoluciones.component';
import { ReportesVentaComponent } from '../pages/reportes-venta/reportes-venta.component';
import { GestionarVentasRestauranteComponent } from '../pages/gestionar-ventas-restaurante/gestionar-ventas-restaurante.component';
import { GestionarMesasComponent } from '../pages/gestionar-mesas/gestionar-mesas.component';
import { ReportesEmpresaVentasComponent } from '../pages/reportes-empresa-ventas/reportes-empresa-ventas.component';
import { EstadisticasComponent } from '../pages/estadisticas/estadisticas.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'estadisticas/:tipo',
      component: EstadisticasComponent
    },
    {
      path: 'gestionar-ventas-restaurante',
      component: GestionarVentasRestauranteComponent,
    },
    {
      path: 'reportes-empresa-ventas',
      component: ReportesEmpresaVentasComponent
    },
    {
      path: 'gestionar-mesas/:id',
      component: GestionarMesasComponent,
    },
    {
      path: 'gestionar-marcas',
      component: GestionarMarcasComponent,
    },
    {
      path: 'gestionar-ventas',
      component: GestionarVentasComponent,
    },
    {
      path: 'gestionar-categorias',
      component: GestionarCategoriasComponent,
    },
    {
      path: 'gestionar-productos',
      component: GestionarProductosComponent,
    },
    {
      path: 'gestionar-sub-categorias',
      component: GestionarSubCategoriasComponent,
    },
    {
      path: 'gestion-cambios-devoluciones',
      component: GestionCambiosDevolucionesComponent
    },
    {
      path: 'reportes-venta',
      component: ReportesVentaComponent,
    },
    {
      path: 'pedidos',
      component: PedidosComponent,
    },
    {
      path: 'pedidos-historial',
      component: PedidosHistorialComponent,
    },
    {
      path: 'insumos',
      component: InsumosComponent,
    },
    {
      path: 'insumos-categoria',
      component: InsumosCategoriaComponent,
    },
    {
      path: 'home',
      component: HomeComponent,
    },
    {
      path: 'usuarios',
      component: UsuariosComponent,
    },
    {
      path: 'menu-elementos',
      component: MenuElementosComponent,
    },
    {
      path: 'menu',
      component: MenuComponent,
    },
    {
      path: 'cartas/:id',
      component: EmpresaCartasComponent,
    },
    {
      path: 'configuracion',
      component: ConfiguracionComponent,
    },
    {
      path: 'almacen/:id',
      component: AlmacenComponent,
    },
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
