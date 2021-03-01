import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import * as moment from 'moment';
import { first } from 'rxjs/operators';

@Component({
  selector: 'ngx-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit {
  tipo: string;
  loading: boolean = false;

  empresas: any [] = [];
  meses: any [] = ['01', '02', '03', '04', '05', '06',
                   '07', '08', '09', '10', '11', '12']
  empresas_map: Map <string, any> = new Map <string, any> ();
  gastos_map: Map <string, any> = new Map <string, any> ();
  ingresos_map: Map <string, any> = new Map <string, any> ();
  tipo_reporte: string = 'diario';
  tipo_filtro: string = 'ingresos';
  fecha_seleccionada: string = moment ().format ('YYYY[-]MM[-]DD');
  mes_seleccionado: string = moment ().format ('MM');
  anio_seleccionado: string = moment ().format ('YYYY');
  empresa_seleccionada: any;
  ventas_total: number = 0;
  compras_total: number = 0;
  constructor (
    private route: ActivatedRoute,
    private database: DatabaseService
  ) { }

  ngOnInit(): void {
    this.tipo = this.route.snapshot.paramMap.get ('tipo');
    console.log (this.tipo);

    this.database.get_empresas ().subscribe ((res: any []) => {
      this.empresas = res;

      if (res.length > 0) {
        this.empresa_seleccionada = res [0].id;
      }

      res.forEach ((empresa: any) => {
        this.empresas_map [empresa.id] = empresa;
      });

      this.mostrar_estadisticas ();
    });
  }

  async mostrar_estadisticas () {
    this.loading = true;
    this.ventas_total = 0;
    this.compras_total = 0;
    this.gastos_map.clear ();
    this.ingresos_map.clear ();

    if (this.tipo_reporte === 'diario') {
      const empresa: any = this.empresas_map [this.empresa_seleccionada];
      const dia = this.fecha_seleccionada.split ('-') [2]
      const mes = this.fecha_seleccionada.split ('-') [1]
      const anio = this.fecha_seleccionada.split ('-') [0]

      let res: any [] = await this.database.get_ingresos_insumo_empresa_dia (empresa.id, dia, mes, anio).pipe (first ()).toPromise ();
      res.forEach ((insumo: any) => {
        if (this.gastos_map.has (insumo.insumo_id)) {
          this.gastos_map.get (insumo.insumo_id).cantidad += insumo.cantidad;
          this.gastos_map.get (insumo.insumo_id).precio += insumo.precio * insumo.cantidad;
        } else {
          this.gastos_map.set (insumo.insumo_id, {
            nombre: insumo.nombre,
            cantidad: insumo.cantidad,
            precio: insumo.precio * insumo.cantidad
          });
        }
      });

      this.gastos_map.forEach ((value: any) => {
        this.compras_total += value.precio;
      });

      res = await this.database.get_pedidos_platos_dia_dia (empresa.id, dia, mes, anio).pipe (first ()).toPromise ();
      console.log (res);
      res.forEach ((pedido: any) => {
        pedido.platos.forEach ((plato: any) => {
          if (empresa.id === plato.empresa_id) {
            if (plato.tipo === 'extra') {
              if (this.ingresos_map.has (plato.plato_id)) {
                this.ingresos_map.get (plato.plato_id).cantidad += plato.cantidad;
                this.ingresos_map.get (plato.plato_id).precio += plato.precio * plato.cantidad;
              } else {
                this.ingresos_map.set (plato.plato_id, {
                  nombre: plato.plato_nombre,
                  cantidad: plato.cantidad,
                  precio: plato.precio * plato.cantidad,
                  tipo: 'Plato'
                });
              }
            } else if (plato.tipo === 'menu') {
              if (this.ingresos_map.has (plato.carta_id)) {
                this.ingresos_map.get (plato.carta_id).cantidad += 1;
                this.ingresos_map.get (plato.carta_id).precio += plato.precio;
              } else {
                this.ingresos_map.set (plato.carta_id, {
                  nombre: plato.menu_nombre,
                  cantidad: 1,
                  precio: plato.precio,
                  tipo: 'Menu'
                });
              }
            } else if (plato.tipo === 'promocion' && plato.promocion_tipo === '0') {
              if (this.ingresos_map.has (plato.plato_id)) {
                this.ingresos_map.get (plato.plato_id).cantidad += plato.cantidad;
                this.ingresos_map.get (plato.plato_id).precio += plato.precio * plato.cantidad;
              } else {
                this.ingresos_map.set (plato.plato_id, {
                  nombre: plato.plato_nombre,
                  cantidad: plato.cantidad,
                  precio: plato.precio * plato.cantidad,
                  tipo: 'Plato'
                });
              }
            } else if (plato.tipo === 'promocion' && plato.promocion_tipo === '1') {
              plato.platos.forEach ((element: any) => {
                if (this.ingresos_map.has (element.id)) {
                  this.ingresos_map.get (element.id).cantidad += plato.cantidad;
                  this.ingresos_map.get (element.id).precio += element.precio * plato.cantidad;
                } else {
                  this.ingresos_map.set (element.id, {
                    nombre: element.nombre,
                    cantidad: plato.cantidad,
                    precio: element.precio * plato.cantidad,
                    tipo: 'Plato'
                  });
                }
              });
            }
          }
        });
      });

      res = await this.database.get_restaurante_pedidos_dia (empresa.id, dia, mes, anio).pipe (first ()).toPromise ();
      // console.log (res);
      res.forEach ((pedido: any) => {
        pedido.platos.forEach ((plato: any) => {
          if (empresa.id === plato.empresa_id) {
            if (plato.tipo === 'plato') {
              if (this.ingresos_map.has (plato.plato_id)) {
                this.ingresos_map.get (plato.plato_id).cantidad += plato.cantidad;
                this.ingresos_map.get (plato.plato_id).precio += plato.precio * plato.cantidad;
              } else {
                this.ingresos_map.set (plato.plato_id, {
                  nombre: plato.nombre,
                  cantidad: plato.cantidad,
                  precio: plato.precio * plato.cantidad,
                  tipo: 'Plato'
                });
              }
            }
          }
        });
      });

      // console.log (this.ingresos_map);
      this.ingresos_map.forEach ((value: any) => {
        this.ventas_total += value.precio;
      });

      this.loading = false;
    } else if (this.tipo_reporte === 'mensual') {
      const empresa: any = this.empresas_map [this.empresa_seleccionada];

      if (this.validar_valor (empresa, 'resumen_' + this.anio_seleccionado)) {
        if (this.validar_valor (empresa ['resumen_' + this.anio_seleccionado], 'monto_vendido_' + this.mes_seleccionado)) {
          this.ventas_total = empresa ['resumen_' + this.anio_seleccionado] ['monto_vendido_' + this.mes_seleccionado];
        } else {
          this.ventas_total = 0;
        }
      } else {
        this.ventas_total = 0;
      }

      if (this.validar_valor (empresa, 'resumen_' + this.anio_seleccionado)) {
        if (this.validar_valor (empresa ['resumen_' + this.anio_seleccionado], 'monto_comprado_' + this.mes_seleccionado)) {
          this.compras_total = empresa ['resumen_' + this.anio_seleccionado] ['monto_comprado_' + this.mes_seleccionado];
        } else {
          this.compras_total = 0;
        }
      } else {
        this.compras_total = 0;
      }

      let res: any [] = await this.database.get_ingresos_insumo_empresa_mes (empresa.id, this.mes_seleccionado, this.anio_seleccionado).pipe (first ()).toPromise ();
      res.forEach ((insumo: any) => {
        if (this.gastos_map.has (insumo.insumo_id)) {
          this.gastos_map.get (insumo.insumo_id).cantidad += insumo.cantidad;
          this.gastos_map.get (insumo.insumo_id).precio += insumo.precio * insumo.cantidad;
        } else {
          this.gastos_map.set (insumo.insumo_id, {
            nombre: insumo.nombre,
            cantidad: insumo.cantidad,
            precio: insumo.precio * insumo.cantidad
          });
        }
      });

      res = await this.database.get_pedidos_platos_dia_mes (empresa.id, this.mes_seleccionado, this.anio_seleccionado).pipe (first ()).toPromise ();
      res.forEach ((pedido: any) => {
        pedido.platos.forEach ((plato: any) => {
          if (empresa.id === plato.empresa_id) {
            if (plato.tipo === 'extra') {
              if (this.ingresos_map.has (plato.plato_id)) {
                this.ingresos_map.get (plato.plato_id).cantidad += plato.cantidad;
                this.ingresos_map.get (plato.plato_id).precio += plato.precio * plato.cantidad;
              } else {
                this.ingresos_map.set (plato.plato_id, {
                  nombre: plato.plato_nombre,
                  cantidad: plato.cantidad,
                  precio: plato.precio * plato.cantidad,
                  tipo: 'Plato'
                });
              }
            } else if (plato.tipo === 'menu') {
              if (this.ingresos_map.has (plato.carta_id)) {
                this.ingresos_map.get (plato.carta_id).cantidad += 1;
                this.ingresos_map.get (plato.carta_id).precio += plato.precio;
              } else {
                this.ingresos_map.set (plato.carta_id, {
                  nombre: plato.menu_nombre,
                  cantidad: 1,
                  precio: plato.precio,
                  tipo: 'Menu'
                });
              }
            } else if (plato.tipo === 'promocion' && plato.promocion_tipo === '0') {
              if (this.ingresos_map.has (plato.plato_id)) {
                this.ingresos_map.get (plato.plato_id).cantidad += plato.cantidad;
                this.ingresos_map.get (plato.plato_id).precio += plato.precio * plato.cantidad;
              } else {
                this.ingresos_map.set (plato.plato_id, {
                  nombre: plato.plato_nombre,
                  cantidad: plato.cantidad,
                  precio: plato.precio * plato.cantidad,
                  tipo: 'Plato'
                });
              }
            } else if (plato.tipo === 'promocion' && plato.promocion_tipo === '1') {
              plato.platos.forEach ((element: any) => {
                if (this.ingresos_map.has (element.id)) {
                  this.ingresos_map.get (element.id).cantidad += plato.cantidad;
                  this.ingresos_map.get (element.id).precio += element.precio * plato.cantidad;
                } else {
                  this.ingresos_map.set (element.id, {
                    nombre: element.nombre,
                    cantidad: plato.cantidad,
                    precio: element.precio * plato.cantidad,
                    tipo: 'Plato'
                  });
                }
              });
            }
          }
        });
      });

      res = await this.database.get_restaurante_pedidos_mes (empresa.id, this.mes_seleccionado, this.anio_seleccionado).pipe (first ()).toPromise ();
      res.forEach ((pedido: any) => {
        pedido.platos.forEach ((plato: any) => {
          if (empresa.id === plato.empresa_id) {
            if (plato.tipo === 'plato') {
              if (this.ingresos_map.has (plato.plato_id)) {
                this.ingresos_map.get (plato.plato_id).cantidad += plato.cantidad;
                this.ingresos_map.get (plato.plato_id).precio += plato.precio * plato.cantidad;
              } else {
                this.ingresos_map.set (plato.plato_id, {
                  nombre: plato.nombre,
                  cantidad: plato.cantidad,
                  precio: plato.precio * plato.cantidad,
                  tipo: 'Plato'
                });
              }
            }
          }
        });
      });

      this.loading = false;
    } else if (this.tipo_reporte === 'anual') {
      // const empresa: any = this.empresas_map [this.empresa_seleccionada];
      // console.log (empresa);
      // this.ventas_total = 0;
      // this.compras_total = 0;
      // if (this.validar_valor (empresa, 'resumen_' + this.anio_seleccionado)) {
      //   this.meses.forEach ((mes: any) => {
      //     if (this.validar_valor (empresa ['resumen_' + this.anio_seleccionado], 'monto_vendido_' + mes)) {
      //       this.ventas_total += empresa ['resumen_' + this.anio_seleccionado] ['monto_vendido_' + mes];
      //     }

      //     if (this.validar_valor (empresa ['resumen_' + this.anio_seleccionado], 'monto_comprado_' + mes)) {
      //       this.compras_total += empresa ['resumen_' + this.anio_seleccionado] ['monto_comprado_' + mes];
      //     }
      //   });
      // }

      // let res: any [] = await this.database.get_ingresos_insumo_empresa_anio (empresa.id, this.anio_seleccionado).pipe (first ()).toPromise ();
      // console.log (res);
      // res.forEach ((i: any) => {
      //   this.lista.push ({
      //     tipo: 'egreso',
      //     cantidad: i.cantidad,
      //     precio: i.precio,
      //     nombre: i.nombre,
      //     tipo_comprobante: i.tipo_comprobante,
      //     nro_comprobante: i.nro_comprobante,
      //     fecha: i.fecha
      //   });
      // });

      // res = await this.database.get_pedidos_platos_dia_anio (empresa.id, this.anio_seleccionado).pipe (first ()).toPromise ();
      // res.forEach ((i: any) => {
      //   this.lista.push ({
      //     tipo: 'ingreso',
      //     cantidad: i.platos.length,
      //     precio: i.monto_total,
      //     nombre: 'App Pedido',
      //     tipo_comprobante: 'ninguno',
      //     nro_comprobante: '',
      //     fecha: i.fecha.substring (0, 10)
      //   });
      // });

      // res = await this.database.get_restaurante_pedidos_anio (empresa.id, this.anio_seleccionado).pipe (first ()).toPromise ();
      // res.forEach ((i: any) => {
      //   this.lista.push ({
      //     tipo: 'ingreso',
      //     cantidad: i.platos.length,
      //     precio: i.monto_total,
      //     nombre: 'Restaurante Pedido',
      //     tipo_comprobante: i.tipo_comprobante,
      //     nro_comprobante: '',
      //     fecha: i.fecha
      //   });
      // });

      this.loading = false;
    }
  }

  validar_valor (object: any, value: string) {
    if (object [value] === null || object [value] === undefined) {
      return false;
    }

    return true;
  }

  tipo_reporte_changed () {
    if (this.tipo_reporte === 'diario') {
      this.fecha_seleccionada = moment ().format ('YYYY[-]MM[-]DD');
    } else if (this.tipo_reporte === 'mensual') {
      this.mes_seleccionado = moment ().format ('MM');
      this.anio_seleccionado = moment ().format ('YYYY');
    } else if (this.tipo_reporte === 'anual') {
      this.anio_seleccionado = moment ().format ('YYYY');
    }

    this.mostrar_estadisticas ();
  }

  capitalize (name: string) {
    if (name === undefined || name === null) {
      return '';
    }

    return name.charAt (0).toUpperCase () + name.slice (1);
  }

  get_ganancia () {
    return this.ventas_total - this.compras_total;
  }
}
