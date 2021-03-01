import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import { NbComponentStatus, NbDialogService, NbIconConfig, NbToastrService } from '@nebular/theme';
import { StockService } from '../../services/stock.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-gestionar-ventas-restaurante',
  templateUrl: './gestionar-ventas-restaurante.component.html',
  styleUrls: ['./gestionar-ventas-restaurante.component.scss']
})
export class GestionarVentasRestauranteComponent implements OnInit {
  usuario: any;
  empresa_pos: any = {
    id: '',
    nombre: '',
    instancia_actual: null,
    caja_abierta: false
  };

  // Forms
  form_abrir_caja: FormGroup;
  form_venta: FormGroup;

  // Selectables
  mesa_seleccionada: any = null;

  // Auxiliares
  cartas: any [] = [];
  mesas: any [] = [];
  carta: any = {
    platos: []
  };

  // Loading
  loading: boolean = false;
  cartas_loading: boolean = false;
  mesas_loading: boolean = false;

  constructor (
    private database: DatabaseService,
    private auth: AuthService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService,
    private stock: StockService) { }

  async ngOnInit () {
    this.form_abrir_caja = new FormGroup ({
      monto_apertura: new FormControl ('', [Validators.required, Validators.min (1)]),
      admi_correo: new FormControl ('', [Validators.required, Validators.email]),
      admi_password: new FormControl ('', [Validators.required])
    });

    this.form_venta = new FormGroup ({
      // tipo: new FormControl ('rapido', [Validators.required]),
      importe: new FormControl ('', [Validators.required]),
      fecha: new FormControl (''),
      anio: new FormControl (''),
      mes: new FormControl (''),
      dia: new FormControl (''),
      tipo_comprobante: new FormControl ('boleta'),
      tipo_pago: new FormControl ('efectivo'),
      tarjeta_cod_ref: new FormControl (''),
      nro_comprobante: new FormControl (''),
      cliente_nombre: new FormControl (''),
      // imprimir_ticket: new FormControl (true)
    });

    this.auth.authState ().subscribe ((usuario: firebase.User) => {
      if (usuario) {
        this.database.get_usuario_by_id (usuario.uid).subscribe ((res: any) => {
          if (res !== undefined) {
            this.usuario = res;
            this.get_data ();
          }
        });
      } else {

      }
    });
  }

  get_data () {
    this.stock.init_stock (this.usuario.empresa_id);

    this.database.get_restaurante_venta_data (this.usuario.empresa_id + moment ().format ('[-]DD[-]MM[-]YYYY')).subscribe ((res: any) => {
      if (res !== undefined) {
        this.empresa_pos = res;
      }
    });

    this.cartas_loading = true;
    this.database.get_cartas_by_empresa (this.usuario.empresa_id).subscribe ((res: any []) => {
      this.cartas = res.filter ((i: any) => {
        return i.data.habilitado === true;
      });

      if (this.cartas.length > 0) {
        this.carta = this.cartas [0];
      }

      this.cartas_loading = false;
    });

    this.mesas_loading = true;
    this.database.get_mesas_empresas (this.usuario.empresa_id).subscribe ((res: any []) => {
      this.mesas = res;
      this.mesas_loading = false;
    });
  }

  async seleccionar_carta (item: any) {
    this.carta = item;

    if (item.data.tipo_carta === '0') {
      this.carta.menus_dia = await this.database.get_menu_elementos_by_carta (item.data.id).pipe (first ()).toPromise ();
    }

    if (item.data.tipo_carta === '2') {
      this.carta.promociones = await this.database.get_promociones_by_carta (item.data.id).pipe (first ()).toPromise ();
    }
  }

  abrir_caja (dialog: any) {
    this.dialogService.open (dialog);
  }

  validar_admi (ref: any) {
    // this.loading = true;
    // const cajero_correo = this.form_abrir_caja.value.admi_correo;
    // const cajero_password = this.form_abrir_caja.value.admi_password;

    // if (cajero_correo === this.form_abrir_caja.value.cajero_actual.correo && cajero_password && this.form_abrir_caja.value.cajero_actual.password) {
      this.abri_caja_data (ref);
    // } else {
    //   this.database.validar_admin_is_valid (this.form_abrir_caja.value.admi_correo, this.form_abrir_caja.value.admi_password).then ((res: any []) => {
    //     if (res.length > 0) {
    //       this.abri_caja_data (ref);
    //     } else {
    //       this.loading = false;
    //       alert ('Usuario invalido');
    //     }
    //   }).catch ((error: any) => {
    //     this.loading = false;
    //     console.log (error);
    //   });
    // }
  }

  abri_caja_data (ref: any) {
    let data: any = {
      id: this.usuario.empresa_id + moment ().format ('[-]DD[-]MM[-]YYYY'),
      fecha: moment ().format ('DD[-]MM[-]YYYY'),
      hora: moment ().format ('h:mm'),
      instancia_actual: {
        tmp_id: this.database.createId (),
        monto_apertura: this.form_abrir_caja.value.monto_apertura,
        fecha_apertura: moment ().format ('L'),
        hora_apertura: moment ().format ('h:mm')
      },
      caja_abierta: true,
    };

    this.database.add_post_empresa_data (data).then (() => {
      this.showToast ('La caja se abrio correctamente', false, 'success');
      ref.close ();
      this.loading = false;
    })
    .catch ((error: any) => {
      console.log (error);
      this.loading = false;
    });
  }

  showToast (mensaje: string, preventDuplicates, status: NbComponentStatus) {
    const iconConfig: NbIconConfig = { icon: 'checkmark-circle-outline', pack: 'eva' };
    this.toastrService.show (
      mensaje,
      'Mensaje',
      { preventDuplicates, status });
  }

  async select_mesa (mesa: any) {
    if (mesa.disponible === true || mesa.disponible === undefined) {
      this.mesa_seleccionada = {
        id: this.database.createId (),
        mesa_id: mesa.id,
        nombre: mesa.nombre,
        platos: [],
        estado: 0
      };
    } else {
      this.mesa_seleccionada = await this.database.get_restaurante_pedido_by_id (mesa.pedido_id);
    }

    this.mesa_seleccionada.platos.forEach ((plato: any) => {
      if (plato.tipo === 'menu') {
        this.stock.cantidad_elementos_menu_tmp [plato.elemento_menu_id] = plato.cantidad;
      }
    });
  }

  validar_estado () {
    let returned: boolean = true;

    // if (this.mesa_seleccionada.estado === 1) {
    //   returned = confirm ("¿Esta seguro que desea agregar este plato al pedido?");
    // }

    return returned;
  }

  async add_plato_actualizar (plato: any) {
    if (plato.tipo === 'plato') {
      this.add_plato (plato.id);
    } else {
      this.add_menu_dia_carrito (plato);
    }
  }

  async add_plato (plato_id: any) {
    if (this.mesa_seleccionada !== null) {
      this.cartas_loading = true;

      let plato: any = await this.database.get_plato_by_id (plato_id).pipe (first ()).toPromise ();

      if (this.mesa_seleccionada.platos instanceof Array && this.mesa_seleccionada.platos.find ((e: any) => e.id === plato_id)) {
        let cantidad = this.mesa_seleccionada.platos.find ((e: any) => e.id === plato_id).cantidad;
        if (this.stock.check_valid (plato [0].data, plato [0].insumos, cantidad + 1)) {
          this.mesa_seleccionada.platos.find ((e: any) => e.id === plato_id).cantidad++;

          if (this.mesa_seleccionada.estado === 1) {
            this.database.update_restaurante_pedido (this.mesa_seleccionada).then (() => {
              this.cartas_loading = false;
              this.showToast ('El plato se agrego correctamente', true, 'success');
            }, error => {
              this.cartas_loading = false;
              console.log (error);
            });
          } else {
            this.showToast ('El plato se agrego correctamente', true, 'success');
            this.cartas_loading = false;
          }
        } else {
          this.cartas_loading = false;
          this.showToast ('Stock no disponible', true, 'danger');
        }
      } else {
        if (this.stock.check_valid (plato [0].data, plato [0].insumos, 1)) {
          if ((this.mesa_seleccionada.platos instanceof Array) === false) {
            this.mesa_seleccionada.platos = [];
          }

          this.mesa_seleccionada.platos.push ({
            id: plato_id,
            carta_id: plato [0].data.carta_id,
            plato_id: plato [0].data.id,
            empresa_id: this.usuario.empresa_id,
            precio: plato [0].data.precio,
            nombre: plato [0].data.nombre,
            cantidad: 1,
            orden: this.mesa_seleccionada.platos.length + 1,
            insumos: plato [0].insumos,
            tipo: 'plato'
          });

          this.showToast ('El plato se agrego correctamente', true, 'success');
        } else {
          this.showToast ('Stock no disponible', true, 'danger');
        }

        this.cartas_loading = false;
      }
    }
  }

  get_total () {
    let cantidad: number = 0;
    let menus_cartas: Map <string, any []> = new Map <string, any []> ();

    if (this.mesa_seleccionada.platos instanceof Array) {
      this.mesa_seleccionada.platos.forEach ((e: any) => {
        if (e.tipo === 'plato') {
          cantidad += e.precio * e.cantidad;
        } else if (e.tipo === 'menu') {
          if (menus_cartas.has (e.carta_id)) {
            menus_cartas.get (e.carta_id).push (e);
          } else {
            menus_cartas.set (e.carta_id, [e]);
          }
        }
      });
    }

    cantidad += this.calcular_precio_por_carta (menus_cartas);

    return this.get_total_format (cantidad);
  }

  calcular_precio_por_carta (cartas: Map <string, any []>) {
    let total: number = 0;

    cartas.forEach ((value: any [], key: string) => {
      total += this.get_precio_menu_carta (key, value);
    });

    return total;
  }

  get_precio_menu_carta (key: string, values: any []) {
    let total: number = 0;
    let cantidad_elementos_menu_tmp = this.stock.get_cantidad_elementos_menu_tmp ();
    let menus_completos: number = 0;

    values.forEach ((value: any) => {
      cantidad_elementos_menu_tmp [value.elemento_menu_id] = value.cantidad
    });

    menus_completos = this.calcular_menus_completos (cantidad_elementos_menu_tmp);

    values.forEach ((value: any) => {
      total += (value.cantidad - menus_completos) * value.precio;
    });

    return total + (menus_completos * this.cartas.find (x => x.data.id === key).data.precio);
  }

  calcular_menus_completos (cantidad_elementos_menu_tmp: any []) {
    let mayor = 0;
    for  (let key in cantidad_elementos_menu_tmp) {
      if (cantidad_elementos_menu_tmp [key] > mayor) {
        mayor = cantidad_elementos_menu_tmp [key];
      }
    }

    let menus_completos: number = mayor;
    for (let index = mayor; index > 0; index--) {
      let completo: boolean = true;
      for (let key in cantidad_elementos_menu_tmp) {
        if (cantidad_elementos_menu_tmp [key] < index) {
          completo = false;
          menus_completos--;
          break;
        }
      }
    }

    return menus_completos;
  }

  get_platos_format (list: any []) {
    if (list instanceof Array) {
      let returned: any [] = [];
      let menus_cartas: Map <string, any []> = new Map <string, any []> ();

      list.forEach ((e: any) => {
        if (e.tipo === 'plato' || e.tipo === 'menu-completo' || e.tipo === 'promocion') {
          returned.push (e);
        } else if (e.tipo === 'menu') {
          if (menus_cartas.has (e.carta_id)) {
            menus_cartas.get (e.carta_id).push (e);
          } else {
            menus_cartas.set (e.carta_id, [e]);
          }
        }
      });

      menus_cartas.forEach ((values: any [], key: string) => {
        let cantidad_elementos_menu_tmp = this.stock.get_cantidad_elementos_menu_tmp ();
        let menus_completos: number = 0;

        values.forEach ((value: any) => {
          cantidad_elementos_menu_tmp [value.elemento_menu_id] = value.cantidad
        });

        menus_completos = this.calcular_menus_completos (cantidad_elementos_menu_tmp);

        values.forEach ((value: any) => {
          if (value.cantidad - menus_completos > 0) {
            value.menus_completos = menus_completos;
            returned.push (value)
          }
        });

        for (let index = 0; index < menus_completos; index++) {
          if (returned.find (x => x.id === key)) {
            returned.find (x => x.id === key).cantidad++;
          } else {
            returned.push ({
              id: this.cartas.find (x => x.data.id === key).data.id,
              nombre: this.cartas.find (x => x.data.id === key).data.nombre,
              carta_id: this.cartas.find (x => x.data.id === key).data.id,
              empresa_id: this.usuario.empresa_id,
              carta_precio: this.carta.data.precio,
              cantidad: 1,
              orden: this.mesa_seleccionada.platos.length + 1,
              precio: this.cartas.find (x => x.data.id === key).data.precio,
              tipo: 'menu-completo',
              menus: values
            });
          }
        }
      });
      return returned;
    } else {
      return [];
    }
  }

  get_total_format (value: number) {
    return Math.round (value * 100) / 100;
  }

  eliminar_producto (plato: any) {
    if (plato.tipo === 'menu') {
      this.stock.remove_menu (plato);
    }

    for (let index = 0; index < this.mesa_seleccionada.platos.length; index++) {
      if (this.mesa_seleccionada.platos [index].id === plato.id) {
        this.mesa_seleccionada.platos.splice (index, 1);
      }
    }

    if (this.mesa_seleccionada.estado === 1) {
      this.database.update_restaurante_pedido (this.mesa_seleccionada).then (() => {
        // if (plato.tipo === 'menu') {
        //   this.stock.cantidad_elementos_menu_tmp [plato.elemento_menu_id] = plato.cantidad;
        // }
      }, error => {
        console.log (error);
      });
    }
  }

  remove_plato (plato: any) {
    // if (confirm ("¿Esta seguro que desea descontar este plato al pedido?")) {-
      plato.cantidad--;
      this.database.update_restaurante_pedido (this.mesa_seleccionada).then (() => {
        // if (plato.tipo === 'menu') {
        //   this.stock.cantidad_elementos_menu_tmp [plato.elemento_menu_id] = plato.cantidad;
        // }
      }, error => {
        console.log (error);
      });
    // }
  }

  crear_pedido () {
    let request: any = {};
    request.id = this.mesa_seleccionada.id;
    request.mesa_id = this.mesa_seleccionada.mesa_id;
    request.nombre = this.mesa_seleccionada.nombre;
    request.estado = 1;
    request.tmp_id = this.empresa_pos.instancia_actual.tmp_id;

    request.platos = this.get_platos_format (this.mesa_seleccionada.platos);

    console.log (request);

    this.database.registrar_restaurante_pedido (this.usuario.empresa_id, request).then (() => {
      this.cancelar ();
      this.showToast ('Tu pedido fue procesado', true, 'success');
    }).catch ((error: any) => {
      console.log (error);
    });
  }

  cancelar () {
    this.mesa_seleccionada = null;
    this.stock.clean_cache ();
  }

  open_pago (dialog: any) {
    this.dialogService.open (dialog);
  }

  calcular_cambio () {
    return this.form_venta.value.importe - this.get_total ();
  }

  validar_cobrar () {
    let returned: boolean = true;
    if (this.form_venta.value.tipo_pago === 'efectivo') {
      if (this.calcular_cambio () > 0 && this.form_venta.value.importe !== 0) {
        returned = false;
      }
    } else {
      returned = this.form_venta.invalid;
    }

    return returned;
  }

  cambiar_tipo_pago (tipo: string) {
    this.form_venta.controls ['tipo_pago'].setValue (tipo);

    this.form_venta.controls ['importe'].setValue (null);
    this.form_venta.controls ['tarjeta_cod_ref'].setValue (null);

    if (tipo === 'efectivo') {
      this.form_venta.controls ['importe'].setValidators ([Validators.required]);
      this.form_venta.controls ['tarjeta_cod_ref'].setValidators ([]);
    } else {
      this.form_venta.controls ['importe'].setValidators ([]);
      this.form_venta.controls ['tarjeta_cod_ref'].setValidators ([Validators.required]);
    }

    this.form_venta.controls ['tarjeta_cod_ref'].updateValueAndValidity ();
    this.form_venta.controls ['importe'].updateValueAndValidity ();
  }

  submit (ref: any) {
    this.mesa_seleccionada.estado = 2;
    this.mesa_seleccionada.pedido_id = '';
    this.mesa_seleccionada.disponible = true;
    this.mesa_seleccionada.importe = this.form_venta.value.importe;
    this.mesa_seleccionada.tipo_comprobante = this.form_venta.value.tipo_comprobante;
    // this.mesa_seleccionada.nro_comprobante = this.form_venta.value.nro_comprobante;
    this.mesa_seleccionada.monto_total = this.get_total ();
    this.mesa_seleccionada.fecha = moment ().format ('YYYY[-]MM[-]DD');
    this.mesa_seleccionada.hora = moment ().format ('HH:mm');
    this.mesa_seleccionada.mes = moment ().format ('MM');
    this.mesa_seleccionada.dia = moment ().format ('DD');
    this.mesa_seleccionada.anio = moment ().format ('YYYY');
    this.mesa_seleccionada.empresa_id = this.usuario.empresa_id;

    this.database.finalizar_restaurante_pedido (this.usuario.empresa_id, this.mesa_seleccionada).then (() => {
      ref.close ();
      this.cancelar ();
      this.form_venta.reset ();
      this.form_abrir_caja.reset ();
    }, error => {
      console.log (error);
      ref.close ();
    });
  }

  add_menu_dia_carrito (menu_dia: any) {
    if (this.mesa_seleccionada !== null) {
      if (this.validar_estado ()) {
        if (this.mesa_seleccionada.platos instanceof Array && this.mesa_seleccionada.platos.find ((e: any) => e.id === menu_dia.id)) {
          let cantidad = this.mesa_seleccionada.platos.find ((e: any) => e.id === menu_dia.id).cantidad;
          if (this.stock.check_menu (menu_dia, cantidad + 1)) {
            this.mesa_seleccionada.platos.find ((e: any) => e.id === menu_dia.id).cantidad++;

            if (this.mesa_seleccionada.estado === 1) {
              this.database.update_restaurante_pedido (this.mesa_seleccionada);
            }
          } else {
            this.showToast ('Stock no disponible', true, 'danger');
          }
        } else {
          if (this.stock.check_menu (menu_dia, 1)) {
            if ((this.mesa_seleccionada.platos instanceof Array) === false) {
              this.mesa_seleccionada.platos = [];
            }

            this.mesa_seleccionada.platos.push ({
              id: menu_dia.id,
              menu_id: menu_dia.menu_id,
              nombre: menu_dia.menu_nombre,
              carta_id: menu_dia.carta_id,
              empresa_id: this.usuario.empresa_id,
              carta_precio: this.carta.data.precio,
              elemento_menu_id: menu_dia.elemento_menu_id,
              cantidad: 1,
              orden: this.mesa_seleccionada.platos.length + 1,
              precio: this.stock.get_menu_elemento_precio (menu_dia.elemento_menu_id),
              tipo: 'menu'
            });
          } else {
            this.showToast ('Stock no disponible', true, 'danger');
          }
        }
      }
    }
  }

  get_tipo_plato_lista (tipo: string) {
    if (tipo === 'menu') {
      return 'Plato';
    } else if (tipo === 'plato') {
      return 'Extra';
    } else if (tipo === 'menu-completo') {
      return 'Menu Completo';
    }

    return '';
  }

  add_promocion (plato: any) {
    console.log (plato);

    if (this.mesa_seleccionada !== null) {
      if (this.mesa_seleccionada.platos instanceof Array && this.mesa_seleccionada.platos.find ((e: any) => e.id === plato.id)) {
        let cantidad = this.mesa_seleccionada.platos.find ((e: any) => e.id === plato.id).cantidad;
          if (this.stock.verificar_agregar_carrito_promocion (plato.empresa_id, plato.insumos, cantidad + 1)) {
            this.mesa_seleccionada.platos.find ((e: any) => e.id === plato.id).cantidad++;
          } else {
            console.log ('No Stock');
          }
      } else {
        if (plato.tipo === '0') {
          if (this.stock.verificar_agregar_carrito_promocion (plato.empresa_id, plato.insumos, 1)) {
            if ((this.mesa_seleccionada.platos instanceof Array) === false) {
              this.mesa_seleccionada.platos = [];
            }

            this.mesa_seleccionada.platos.push ({
              id: plato.id,
              nombre: plato.nombre,
              carta_id: plato.carta_id,
              empresa_id: plato.empresa_id,
              cantidad: 1,
              orden: this.mesa_seleccionada.platos.length + 1,
              precio: plato.precio_total,
              tipo: 'promocion',
              promocion_tipo: plato.tipo
            });
          } else {
            console.log ('No Stock');
          }
        } else if (plato.tipo === '1') {

        }
      }
    }
  }

  async confirmar_cerrar_caja (dialog: any) {
    let ventas = await this.database.get_restaurante_ventas_instancia (this.empresa_pos.instancia_actual.tmp_id);
    this.dialogService.open (dialog, {
      context: {
        ventas: ventas
      }
    });
  }

  cerrar_caja (ref: any, data: any) {
    console.log (data);
    console.log (this.empresa_pos);

    this.database.cerrar_caja_post_empresa (this.empresa_pos).then (() => {
      ref.close ();
    }).catch ((error: any) => {
      console.log (error);
      ref.close ();
    });
  }

  get_total_lista (ventas: any []) {
    let total: number = 0;

    ventas.forEach ((venta: any) => {
      total += venta.monto_total;
    });

    return this.get_total_format (total);
  }
}
