import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'ngx-reportes-venta',
  templateUrl: './reportes-venta.component.html',
  styleUrls: ['./reportes-venta.component.scss']
})
export class ReportesVentaComponent implements OnInit {
  cajeros: any [] = [];
  categorias: any [] = [];
  cajero_seleccionado: any = '0';
  caja_data: any;
  reporte_tipo: string = 'productos';

  lista: any [] = [];
  _lista: any [] = [];
  lista_respuesta: any [] = [];
  mapa_respuesta: Map <string, any> = new Map <string, any []> ();

  hora_inicio: any = '';
  hora_fin: any = '';
  constructor (private database: DatabaseService, private auth: AuthService) { }

  ngOnInit (): void {
    this.database.get_pos_data (this.auth.usuario.id + moment ().format ('[-]DD[-]MM[-]YYYY')).subscribe ((res: any) => {
      this.caja_data = res;

      this.database.get_ventas_total_subscribe (this.caja_data.id).subscribe ((res: any) => {
        this.lista = res;
        this._lista = res;
        console.log (res);
      });
    });

    this.database.get_cajeros_por_pos (this.auth.usuario.id + moment ().format ('[-]DD[-]MM[-]YYYY')).subscribe ((res: any []) => {
      this.cajeros = res;
    });

    this.database.get_tienda_categorias ().subscribe ((res: any) => {
      this.categorias = res;
    });
  }

  async get_ventas_por_client_tmp () {
    this.lista = await this.database.get_ventas_por_client_tmp (this.caja_data.id, this.caja_data.cajero_actual.tmp_id);
  }

  async get_ventas_total () {
    // this.lista = await this.database.get_ventas_total (this.caja_data.id);
    // console.log (this.lista);
  }

  async submit () {
    this.lista = this._lista;
    this.lista_respuesta = [];
    this.mapa_respuesta.clear ();

    if (this.reporte_tipo === 'productos') {
      this.lista_respuesta = this.lista.filter ((item: any) => {
        console.log (item);
        console.log ('Valor: ', this.validar_cajero (item) || this.validar_fecha (item));
        return this.validar_item (item);
      });
    } else if (this.reporte_tipo === 'categorias') {
      console.log ('enbtro aqui', this.lista);
      this.lista.forEach ((venta: any) => {
        console.log (venta);

        venta.productos.forEach ((producto: any) => {
          if (this.mapa_respuesta.get (producto.categoria_id) === undefined) {
            this.mapa_respuesta.set (producto.categoria_id, {
              cantidad: producto.cantidad,
              precio: producto.precio * producto.cantidad
            });
          } else {
            let update = this.mapa_respuesta.get (producto.categoria_id);
            update.cantidad += producto.cantidad;
            update.precio += producto.precio * producto.cantidad;
            this.mapa_respuesta.set (producto.categoria_id, update);
          }
        });
      });

      console.log (this.mapa_respuesta);
    }
  }

  validar_item (item: any) {
    let s_date = moment (item.fecha + ' ' + this.hora_inicio);
    let f_date = moment (item.fecha + ' ' + this.hora_fin);
    let tiempo_valid = s_date.isValid () && f_date.isValid () && this.hora_inicio !== '' && this.hora_fin !== '';

    if (this.cajero_seleccionado !== '0' && tiempo_valid) {
      return this.validar_cajero (item) && this.validar_fecha (item);
    } else {
      if (this.cajero_seleccionado !== '0' && tiempo_valid === false) {
        return this.validar_cajero (item);
      } else if (this.cajero_seleccionado !== '0' && tiempo_valid === true) {
        return this.validar_fecha (item);
      } else if (this.cajero_seleccionado === '0' && tiempo_valid === true) {
        return this.validar_fecha (item);
      } else {
        return true;
      }
    }
  }

  validar_cajero (item: any) {
    if (this.cajero_seleccionado === '0') {
      return true;
    }

    return item.cajero_tmp_id === this.cajero_seleccionado;
  }

  validar_fecha (item: any) {
    let s_date = moment (item.fecha + ' ' + this.hora_inicio);
    let f_date = moment (item.fecha + ' ' + this.hora_fin);

    if (s_date.isValid () && f_date.isValid ()) {
      return moment (item.fecha + ' ' + item.hora).isBetween (s_date, f_date);
    }

    return true;
  }

  get_total_format (value: number) {
    return Math.round(value * 100) / 100;
  }

  get_total_lista (ventas: any []) {
    let total: number = 0;

    ventas.forEach ((venta: any) => {
      venta.productos.forEach ((producto: any) => {
        total += producto.cantidad * producto.precio;
      });
    });

    return this.get_total_format (total);
  }

  limpiar () {
    this.lista = [];
  }

  get_nombre (key: string) {
    return this.categorias.find ((x => x.id === key)).nombre;
  }

  get_total_map () {
    let total: number = 0;

    this.mapa_respuesta.forEach ((value: any, key: string) => {
        total += value.cantidad * value.precio;
    });

    return total;
  }
}
