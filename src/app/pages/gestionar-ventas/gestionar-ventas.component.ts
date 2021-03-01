import { Component, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { NbDialogService } from '@nebular/theme';
import { elementAt, filter, finalize } from 'rxjs/operators';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Nebular
import { NbToastrService, NbGlobalPosition, NbComponentStatus, NbIconConfig } from '@nebular/theme';
import * as moment from 'moment';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';


// AlgoliaSearch’
const algoliasearch = require('algoliasearch');
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ngx-gestionar-ventas',
  templateUrl: './gestionar-ventas.component.html',
  styleUrls: ['./gestionar-ventas.component.scss']
})
export class GestionarVentasComponent implements OnInit {
  @ViewChild('input') input: ElementRef;

  search_text: string = '';
  loading: boolean = false;
  search_loading: boolean = false;
  ver_ventas: boolean = false;
  productos_busqueda: any [] = [];
  form_venta: FormGroup;
  form_abrir_caja: FormGroup;

  lista: Map<string, any> = new Map<string, any> ();
  client: any;
  algolia_index: any;

  caja_data: any = {
    id: '',
    nombre: '',
    instancia_actual: null,
    cajero_actual: null,
    caja_abierta: false
  };
  cajeros: any [] = [];
  productos: any [] = [];
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
    private auth: AuthService
  ) {
  }

  ngOnInit (): void {
    this.form_venta = new FormGroup ({
      tipo: new FormControl ('rapido', [Validators.required]),
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
      imprimir_ticket: new FormControl (true)
    });

    this.form_abrir_caja = new FormGroup ({
      monto_apertura: new FormControl ('', [Validators.required, Validators.min (1)]),
      admi_correo: new FormControl ('', [Validators.required, Validators.email]),
      admi_password: new FormControl ('', [Validators.required]),
      cajero_actual: new FormControl ('', [Validators.required])
    });

    this.client = algoliasearch (environment.algolia.appId, environment.algolia.apiKey, { protocol: 'https:' });
    this.algolia_index = this.client.initIndex(environment.algolia.indexName);

    this.database.get_pos_data (this.auth.usuario.id + moment ().format ('[-]DD[-]MM[-]YYYY')).subscribe ((res: any) => {
      console.log (res);
      this.caja_data = res;
    });

    this.database.get_usuarios_by_tipo (-1).subscribe ((res: any []) => {
      this.cajeros = res;
    });
  }

  get_cajeros_validos (lista: any []) {
    return lista.filter ((e: any) => {
      return e.id !== this.caja_data.cajero_actual.cajero_id;
    });
  }

  ngAfterViewInit () {
    // server-side search
    fromEvent (this.input.nativeElement, 'keyup')
      .pipe(
          filter(Boolean),
          debounceTime(0),
          distinctUntilChanged(),
          tap ((text) => {
            if (this.input.nativeElement.value.trim () !== '' && this.input.nativeElement.value.length > 1) {
              this.onSearchType (this.input.nativeElement.value);
            }
          })
      )
      .subscribe();
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

  async selectProducto (producto: any) {
    if (this.lista.get (producto.objectID) === undefined) {
      let p: any = await this.database.get_producto_by_id (producto.objectID);
      this.lista.set (p.id, {
        id: p.id,
        nombre: p.nombre,
        cantidad: 1,
        orden: this.lista.size + 1,
        precio: p.precio_venta,
        stock: p.stock,
        categoria_id: p.categoria_id,
        marca_id: p.marca_id,
        subcategoria_id: p.subcategoria_id
      });
    } else {
      this.lista.get (producto.objectID).cantidad++;
    }

    this.input.nativeElement.value = "";
    this.input.nativeElement.focus ();
    this.showToast ('El propucto se agrego correctamente', true, 'basic');
  }

  eliminar_producto (producto_id: string) {
    this.lista.delete (producto_id);
  }

  get_total () {
    let total: number = 0;
    this.lista.forEach (element => {
      total += element.precio * element.cantidad;
    });

    return this.get_total_format (total);
  }

  onSearchType (value: string) {
    this.search_loading = true;
    this.productos_busqueda = [];

    this.algolia_index.search (value)
    .then ((data: any)=>{
      this.search_loading = false;

      if (data.hits.find ((x: any) => x.id === value) !== undefined) {
        console.log (data.hits.find ((x: any) => x.id === value));
        this.selectProducto (data.hits.find ((x: any) => x.id === value));
        return;
      }

      if (data.hits.find ((x: any) => x.sku === value) !== undefined) {
        this.selectProducto (data.hits.find ((x: any) => x.sku === value));
        return;
      }

      this.productos_busqueda = data.hits;
    })
    .catch ((err: any) => {
      this.search_loading = false;
      console.log (err);
    });
  }

  get_total_format (value: number) {
    return Math.round(value * 100) / 100;
  }

  get_cantidad_articulos () {
    let cantidad: number = 0;
    this.lista.forEach ((i: any) => {
      cantidad += i.cantidad;
    });

    return cantidad;
  }

  cobrar_confirmar (dialog: any) {
    this.dialogService.open (dialog);
  }

  calcular_cambio () {
    return this.form_venta.value.importe - this.get_total ();
  }

  descartar_confirm () {
    if (confirm ('¿Esta seguro que desea descartar esta Orden?')) {
      this.descartar ();
    }
  }

  descartar () {
    this.lista.clear ();
    this.form_venta.reset ();

    this.form_venta.controls ['tipo'].setValue ('rapido');
    this.form_venta.controls ['tipo_pago'].setValue ('efectivo');
    this.form_venta.controls ['tipo_comprobante'].setValue ('boleta');
    this.form_venta.controls ['imprimir_ticket'].setValue (true);
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

  showToast (mensaje: string, preventDuplicates, status: NbComponentStatus) {
    const iconConfig: NbIconConfig = { icon: 'checkmark-circle-outline', pack: 'eva' };
    this.toastrService.show (
      mensaje,
      'Mensaje',
      { preventDuplicates, status });
  }

  abrir_caja (dialog: any) {
    this.dialogService.open (dialog);
  }

  validar_admi (ref: any) {
    this.loading = true;
    const cajero_correo = this.form_abrir_caja.value.admi_correo;
    const cajero_password = this.form_abrir_caja.value.admi_password;

    if (cajero_correo === this.form_abrir_caja.value.cajero_actual.correo && cajero_password && this.form_abrir_caja.value.cajero_actual.password) {
      this.abri_caja_data (ref);
    } else {
      this.database.validar_admin_is_valid (this.form_abrir_caja.value.admi_correo, this.form_abrir_caja.value.admi_password).then ((res: any []) => {
        if (res.length > 0) {
          this.abri_caja_data (ref);
        } else {
          this.loading = false;
          alert ('Usuario invalido');
        }
      }).catch ((error: any) => {
        this.loading = false;
        console.log (error);
      });
    }
  }

  abri_caja_data (ref: any) {
    let data: any = {
      id: this.auth.usuario.id + moment ().format ('[-]DD[-]MM[-]YYYY'),
      fecha: moment ().format ('DD[-]MM[-]YYYY'),
      hora: moment ().format ('h:mm'),
      nombre: this.auth.usuario.nombre,
      cajero_actual: {
        tmp_id: this.database.createId (),
        cajero_id: this.form_abrir_caja.value.cajero_actual.id,
        nombre: this.form_abrir_caja.value.cajero_actual.nombre,
        fecha_entrada: moment ().format ('L'),
        hora_entrada: moment ().format ('h:mm'),
        monto_apertura: this.form_abrir_caja.value.monto_apertura
      },
      instancia_actual: {
        tmp_id: this.database.createId (),
        monto_apertura: this.form_abrir_caja.value.monto_apertura,
        fecha_apertura: moment ().format ('L'),
        hora_apertura: moment ().format ('h:mm'),
      },
      caja_abierta: true,
    };

    this.database.add_post_data (data).then (() => {
      this.showToast ('La caja se abrio correctamente', false, 'success');
      ref.close ();
      this.loading = false;
    })
    .catch ((error: any) => {
      console.log (error);
      this.loading = false;
    });
  }

  caja_abierta () {
    if (this.caja_data === undefined) {
      return false;
    }

    if (this.caja_data.cajero_actual !== null && this.caja_data.caja_abierta === true) {
      return true;
    }

    return false;
  }

  submit (ref: any) {
    this.loading = true;

    let lista: any [] = [];
    this.lista.forEach ((value: any) => {
      lista.push (value);
    });

    let data: any = {
      id: this.database.createId (),
      fecha: moment ().format ('YYYY[-]MM[-]DD'),
      hora: moment ().format ('HH:mm'),
      importe: this.form_venta.value.importe,
      pos_id: this.caja_data.id,
      pos_nombre: this.caja_data.nombre,
      cajero_id: this.caja_data.cajero_actual.cajero_id,
      cajero_tmp_id: this.caja_data.cajero_actual.tmp_id,
      cajero_nombre: this.caja_data.cajero_actual.nombre,
      instancia_id: this.caja_data.instancia_actual.tmp_id,
      total: this.get_total (),
      tipo_comprobante: this.form_venta.value.tipo_comprobante,
      nro_comprobante: this.form_venta.value.nro_comprobante,
      cliente_nombre: this.form_venta.value.cliente_nombre,
      productos: lista
    };

    this.database.registrar_venta (this.caja_data, data)
      .then (() => {
        this.loading = false;
        console.log ('Registrado correctamente');
        this.showToast ('Registro exitoso', false, 'success');
        this.descartar ();
        ref.close ();
      })
      .catch (() => {
        this.loading = false;
        ref.close ();
      });
  }

  get_registrar_nombre () {
    return 'Registrar ' + this.search_text;
  }

  async confirmar_cambio_cajero (dialog: any) {
    const res = await this.database.get_ventas_por_client_tmp (this.caja_data.id, this.caja_data.cajero_actual.tmp_id);
    this.dialogService.open (dialog, {
      context: {
        ventas: res
      }
    });
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

  cambiar_cajero (ref: any) {
    this.loading = true;
    this.loading = true;
    const cajero_correo = this.form_abrir_caja.value.admi_correo;
    const cajero_password = this.form_abrir_caja.value.admi_password;

    if (cajero_correo === this.form_abrir_caja.value.cajero_actual.correo && cajero_password && this.form_abrir_caja.value.cajero_actual.password) {
      this.cambiar_caja_data (ref);
    } else {
      this.database.validar_admin_is_valid (this.form_abrir_caja.value.admi_correo, this.form_abrir_caja.value.admi_password).then ((res: any []) => {
        if (res.length > 0) {
          this.cambiar_caja_data (ref);
        } else {
          this.loading = false;
          alert ('Usuario invalido');
        }
      }).catch ((error: any) => {
        this.loading = false;
        console.log (error);
      });
    }
  }

  cambiar_caja_data (ref: any) {
    let data: any = {
      id: this.auth.usuario.id + moment ().format ('[-]DD[-]MM[-]YYYY'),
      nombre: this.auth.usuario.nombre,
      monto_apertura: this.form_abrir_caja.value.monto_apertura,
      fecha_apertura: moment ().format ('L'),
      hora_apertura: moment ().format ('h:mm'),
      cajero_actual: {
        tmp_id: this.database.createId (),
        cajero_id: this.form_abrir_caja.value.cajero_actual.id,
        nombre: this.form_abrir_caja.value.cajero_actual.nombre,
        fecha_entrada: moment ().format ('L'),
        hora_entrada: moment ().format ('h:mm'),
        monto_apertura: this.form_abrir_caja.value.monto_apertura
      },
      caja_abierta: true
    };

    this.database.update_post_data (data).then (() => {
      this.showToast ('La caja se cambio correctamente', false, 'success');
      ref.close ();
      this.loading = false;
    })
    .catch ((error: any) => {
      console.log (error);
      this.loading = false;
    });
  }

  valid_max_min (value: number, max: number, min: number) {
    if (value > max) {
      value = max;
    }

    if (value < min) {
      value = min;
    }
  }

  validar_cambiar_cajero (total: any) {
    let returned: boolean = true;
    let value = (total + this.caja_data.cajero_actual.monto_apertura) - this.form_abrir_caja.value.monto_apertura;
    if (this.form_abrir_caja.valid && value >= 0) {
      returned = false;
    }

    return returned;
  }

  async reporte_cajero (dialog: any) {
    let res = await this.database.get_ventas_por_client_tmp (this.caja_data.id, this.caja_data.cajero_actual.tmp_id);
    this.dialogService.open (dialog, {
      context: {
        ventas: res
      }
    });
  }

  async reporte_total (dialog: any) {
    let res = await this.database.get_ventas_total (this.caja_data.id, this.caja_data.instancia_actual.tmp_id);
    this.dialogService.open (dialog, {
      context: {
        ventas: res
      }
    });
  }

  confirmar_cerrar_caja (dialog: any) {
    this.dialogService.open (dialog);
  }

  cerrar_caja (ref: any) {
    this.loading = true;

    this.database.validar_admin_is_valid (this.form_abrir_caja.value.admi_correo, this.form_abrir_caja.value.admi_password)
    .then ((res: any []) => {
      if (res.length > 0) {
        this.database.cerrar_pos (this.caja_data)
          .then (() => {
            this.showToast ('La caja se cerro correctamente', false, 'success');
            this.loading = false;
            ref.close ();
          })
          .catch ((error: any) => {
            this.loading = false;
            console.log (error);
          });
      } else {
        this.loading = false;
        alert ("!Usuario invalido¡");
      }
    })
    .catch ((error: any) => {
      this.loading = false;
      console.log (error);
    });
  }

  async agregar_nota_credito () {
    let id = prompt ('Ingrese la nota de credito');
    let nota_c: any = await this.database.get_nota_credito (id);
    console.log (nota_c);

    this.lista.set (nota_c.id, {
      id: nota_c.id,
      nombre: 'Nota de credito',
      cantidad: 1,
      orden: this.lista.size + 1,
      precio: -nota_c.total,
      stock: 1,
      categoria_id: '',
      marca_id: '',
      subcategoria_id: '',
      es_producto: false
    });
  }
}
