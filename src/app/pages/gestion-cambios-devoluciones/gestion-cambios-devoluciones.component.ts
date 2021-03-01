import { Component, OnInit } from '@angular/core';

// Servicios
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { FormGroup , FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'ngx-gestion-cambios-devoluciones',
  templateUrl: './gestion-cambios-devoluciones.component.html',
  styleUrls: ['./gestion-cambios-devoluciones.component.scss']
})
export class GestionCambiosDevolucionesComponent implements OnInit {
  es_usuario_valido: boolean = false;
  form: FormGroup;
  pos: any [] = [];
  instancias: any = [];
  pos_seleccionado;
  fecha_seleccionada: string = '';
  codigo: string = '';

  venta: any = {
    productos: []
  };
  lista_devolucion: Map <string, any> = new Map <string, any> ();
  constructor (private auth: AuthService, private database: DatabaseService) { }

  ngOnInit (): void {
    this.form = new FormGroup ({
      email: new FormControl ('', [Validators.required, Validators.email]),
      password: new FormControl ('', Validators.required)
    });

    if (this.auth.usuario.tipo === 0) {
      this.es_usuario_valido = true;
    }

    this.database.get_usuarios_by_tipo (-2).subscribe ((res: any []) => {
      this.pos = res;
    });
  }

  validar_usuario () {
    this.database.validar_admin_is_valid (this.form.value.email, this.form.value.password).then ((res: any []) => {
      if (res.length > 0) {
        this.es_usuario_valido = true;
      } else {
        alert ('Este usuario no exixte o no tiene los permisos necesarios');
      }
    });
  }

  buscar_venta () {
    const id = this.pos_seleccionado.id + moment (this.fecha_seleccionada).format ('[-]DD[-]MM[-]YYYY');
    this.database.get_venta_by_pos (id, this.codigo).subscribe ((res: any) => {
      this.venta = res;
    });
  }

  get_total_format (value: number) {
    return Math.round(value * 100) / 100;
  }

  get_total_lista (productos: any []) {
    let total: number = 0;

    productos.forEach ((producto: any) => {
      total += producto.cantidad * producto.precio;
    });

    return this.get_total_format (total);
  }

  verificar_producto (checked: any, item: any) {
    console.log (checked);

    if (checked.target.checked === true) {
      this.lista_devolucion.set (item.id, item);
    } else {
      if (this.lista_devolucion.has (item.id)) {
        this.lista_devolucion.delete (item.id);
      }
    }

    console.log (this.lista_devolucion);
  }

  get_total_devolucion () {
    let total: number = 0;

    this.lista_devolucion.forEach ((producto: any) => {
      total += producto.devolucion * producto.precio;
    });

    return this.get_total_format (total);
  }

  generar () {
    let productos: any [] = [];
    this.lista_devolucion.forEach ((producto: any) => {
      productos.push (producto);
    });

    let data: any = {
      productos: productos,
      total: this.get_total_devolucion (),
      fecha: moment ().format ('L'),
      hora: moment ().format ('h:mm'),
      id: this.database.createId (),
    }

    console.log (data);

    this.database.add_nota_credito (data).then ((_: any) => {
      alert ('Nota de credito: ' + data.id);
    }).catch ((error: any) => {
      console.log (error);
    });
  }
}
