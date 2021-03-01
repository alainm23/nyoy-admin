import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Nebular
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import * as moment from 'moment';

@Component({
  selector: 'ngx-gestionar-productos',
  templateUrl: './gestionar-productos.component.html',
  styleUrls: ['./gestionar-productos.component.scss']
})
export class GestionarProductosComponent implements OnInit {
  categorias: any [] = [];
  subcategorias: any [] = [];
  _subcategorias: any [] = [];
  productos: any [] = [];
  marcas: any [] = [];
  producto_seleccionado: any;
  form: FormGroup;
  form_movimiento: FormGroup;
  loading: boolean = false;
  file: any =  null;
  avatar_preview: any = null;
  productos_para_registrar: any [] = [];

  categorias_subscribe: any = null;
  marcas_subscribe: any = null;
  subcategorias_subscribe: any = null;

  customColumn = 'Nombre';
  defaultColumns = [ 'SKU', 'Imagen', 'Categoria', 'Sub Categoria', 'Marca', 'Precio', 'Stock', 'Acciones' ];
  allColumns = [ this.customColumn, ...this.defaultColumns ];

  dataSource: NbTreeGridDataSource<any>;
  sortColumn: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  selectedItem: any;
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>,
    private af_storage: AngularFireStorage,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup ({
      id: new FormControl (),
      sku: new FormControl (''),
      nombre: new FormControl ('', [Validators.required]),
      categoria_id: new FormControl ('', [Validators.required]),
      subcategoria_id: new FormControl ('', [Validators.required]),
      marca_id: new FormControl (0),
      precio_compra: new FormControl ('', [Validators.required]),
      precio_venta: new FormControl ('', [Validators.required]),
      medida: new FormControl ('', [Validators.required]),
    });

    this.form_movimiento = new FormGroup ({
      fecha: new FormControl ('', [Validators.required]),
      anio: new FormControl ('', [Validators.required]),
      mes: new FormControl ('', [Validators.required]),
      dia: new FormControl ('', [Validators.required]),
      tipo_comprobante: new FormControl ('boleta'),
      nro_comprobante: new FormControl (''),
    });

    this.categorias_subscribe = this.database.get_tienda_categorias ().subscribe ((res: any []) => {
      this.categorias = res;
      if (res.length > 0) {
        this.selectedItem = res [0];
        this.categoriaSelected (this.selectedItem);
      }
      this.check_loading ();
    });

    this.marcas_subscribe = this.database.get_tienda_marcas ().subscribe ((res: any) => {
      this.marcas = res;
      this.check_loading ();
    });

    this.subcategorias_subscribe = this.database.get_tienda_sub_categorias ().subscribe ((res: any) => {
      this._subcategorias = res;
      this.check_loading ();
    });
  }

  check_loading () {
    if (this.categorias_subscribe !== null && this.marcas_subscribe !== null && this.subcategorias_subscribe !== null) {
      this.database.get_tienda_productos ().subscribe ((res: any []) => {
        this.loading = false;
        this.productos = res;
        console.log (res);
      });
    }
  }

  updateSort (sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  format_list (res: any []) {
    let returned: any [] = [];
    res.forEach ((i: any) => {
      let data: any = {
        data: {}
      };
      data.data ['data'] = i;
      if (i.sku !== undefined) {
        data.data ['SKU'] = i.sku;
      }

      data.data ['Imagen'] = i.imagen;
      data.data ['Nombre'] = i.nombre;

      data.data ['Categoria'] = this.categorias.find ((x => x.id === i.categoria_id)).nombre;
      data.data ['Sub Categoria'] = this._subcategorias.find ((x => x.id === i.subcategoria_id)).nombre;
      if (i.marca_id !== null) {
        data.data ['Marca'] = this.marcas.find ((x => x.id === i.marca_id)).nombre;
      }
      data.data ['Precio'] = i.precio_venta;
      data.data ['Stock'] = i.stock;

      data.data ['Acciones'] = 'accion';
      returned.push (data);
    });

    return returned;
  }

  getSortDirection (column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + (nextColumnStep * index);
  }

  submit (dialog: any, editar: boolean) {
    this.loading = true;
    let data: any = this.form.value;

    if (editar) {
      if (this.file === null) {
        this.database.update_tienda_producto (data)
          .then (() => {
            dialog.close ();
            this.form.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
          })
          .catch ((error: any) => {
            console.log ('error', error);
            dialog.close ();
            this.form.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
          });
      } else {
        this.uploadImageAsPromise (this.file, data, true, dialog);
      }
    } else {
      data.id = this.database.createId ();
      data.stock = 0;
      data.habilitado = true;

      if (this.file == null) {
        this.database.add_tienda_producto (data)
          .then (() => {
            dialog.close ();
            this.form.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
          })
          .catch ((error: any) => {
            console.log ('error', error);
            dialog.close ();
            this.form.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
          });
      } else {
        this.uploadImageAsPromise (this.file, data, false, dialog);
      }
    }
  }

  uploadImageAsPromise (file: any, data: any, editar: boolean = false, dialog: any) {
    const filePath = 'Platos/' + data.id;
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, file);

    task.percentageChanges().subscribe ((res: any) => {

    });

    task.snapshotChanges().pipe (
      finalize(async () => {
        let downloadURL = await fileRef.getDownloadURL ().toPromise();
        data.imagen = downloadURL;
        if (editar) {
          this.database.update_tienda_producto (data)
            .then (() => {
              dialog.close ();
              this.form.reset ();
              this.loading = false;
              this.avatar_preview = null;
              this.file = null;
            })
            .catch ((error: any) => {
              console.log ('error', error);
              dialog.close ();
              this.form.reset ();
              this.loading = false;
              this.avatar_preview = null;
              this.file = null;
            });
        } else {
          this.database.add_tienda_producto (data)
            .then (() => {
              dialog.close ();
              this.form.reset ();
              this.loading = false;
              this.avatar_preview = null;
              this.file = null;
            })
            .catch ((error: any) => {
              console.log ('error', error);
              dialog.close ();
              this.form.reset ();
              this.loading = false;
              this.avatar_preview = null;
              this.file = null;
            });
        }
      })
    )
    .subscribe ();
  }

  registrar_dialog (dialog: any) {
    this.form.reset ();
    this.dialogService.open (dialog, { context: false });
  }

  editar (item: any, dialog: any) {
    this.onCategoriaSelected (item.categoria_id);
    this.avatar_preview = item.imagen;
    this.form.patchValue (item);
    this.dialogService.open (dialog, { context: true });
  }

  delete (item: any) {
    if (confirm("¿Esta seguro que desea eliminar?")) {
      this.database.delete_insumo (item);
    }
  }

  cancelar (dialog: any) {
    dialog.close ();
    this.avatar_preview = null;
    this.file = null;
    this.form.reset ();
  }

  onCategoriaSelected (categoria_id: string) {
    this.loading = true;
    this.database.get_tienda_sub_categorias_by_categoria (categoria_id).subscribe ((res: any []) => {
      this.subcategorias = res;
      this.loading = false;
    });
  }

  changeListener (event: any) {
    this.file = event.target.files[0];
    this.getBase64 (this.file);
  }

  getBase64 (file: any) {
    var reader = new FileReader ();
    reader.readAsDataURL(file);

    reader.onload = () => {
      this.avatar_preview = reader.result;
    };

    reader.onerror = (error) => {
      console.log (error);
    };
  }

  fecha_cambio () {
    this.form_movimiento.controls ['anio'].setValue (moment (this.form.value.fecha).format ('YYYY'));
    this.form_movimiento.controls ['mes'].setValue (moment (this.form.value.fecha).format ('MM'));
    this.form_movimiento.controls ['dia'].setValue (moment (this.form.value.fecha).format ('DD'));
  }

  open_registrar_movimiento_dialog (dialog: any) {
    this.form_movimiento.reset ();
    this.form_movimiento.controls ['tipo_comprobante'].setValue ('boleta');
    this.form_movimiento.controls ['nro_comprobante'].setValue ('');

    this.dialogService.open (dialog);
  }

  selectProducto (producto: any) {
    let p = this.productos.find (x => x.id === producto);

    if (this.productos_para_registrar.find (x => x.id === p.id) === undefined) {
      this.productos_para_registrar.push ({
        id: p.id,
        nombre: p.nombre,
        cantidad: 0,
        precio: p.precio_venta
      });
    }

    this.producto_seleccionado = '';
  }

  get_precio_total () {
    let total: number = 0;

    this.productos_para_registrar.forEach ((i: any) => {
      total += i.cantidad * i.precio;
    });

    return total;
  }

  remove (item: any) {
    for( var i = 0; i < this.productos_para_registrar.length; i++) {
      if ( this.productos_para_registrar[i].id === item.id) {
        this.productos_para_registrar.splice(i, 1);
      }
    }
  }

  registrar_ingresos_insumo (dialog: any) {
    this.productos_para_registrar.forEach ((i: any) => {
      i.fecha = this.form_movimiento.value.fecha,
      i.anio = this.form_movimiento.value.anio,
      i.mes = this.form_movimiento.value.mes,
      i.dia = this.form_movimiento.value.dia,
      i.tipo_comprobante = this.form_movimiento.value.tipo_comprobante,
      i.nro_comprobante = this.form_movimiento.value.nro_comprobante
    });

    console.log (this.productos_para_registrar);

    this.database.add_ingresos_tieda_producto (this.productos_para_registrar)
      .then (() => {
        this.productos_para_registrar = [];
        dialog.close ();
      })
      .catch ((error: any) => {
        console.log (error);
      });
  }

  cambiar_estado (item: any) {
    this.loading = true;
    console.log (item);
    item.habilitado = !item.habilitado;
    this.database.update_tienda_producto (item)
      .then (() => {
        this.loading = false;
      })
      .catch ((error: any) => {
        console.log ('error', error);
        this.loading = false;
      });
  }

  categoriaSelected (event: any) {
    this.loading = true;

    this.database.get_tienda_productos_by_categoria (event.id).subscribe ((res: any []) => {
      this.dataSource = this.dataSourceBuilder.create (this.format_list (res));
      this.loading = false;
    });
  }
}
