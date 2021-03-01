import { Component, OnInit } from '@angular/core';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';

import * as moment from 'moment';

// Nebular
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

@Component({
  selector: 'ngx-almacen',
  templateUrl: './almacen.component.html',
  styleUrls: ['./almacen.component.scss']
})
export class AlmacenComponent implements OnInit {
  items: any [] = [];
  _items: any [] = [];
  para_agregar: any [] = [];
  elementos: any [] = [];
  insumos: any [] = [];
  _insumos: any [] = [];
  form: FormGroup;

  loading: boolean = true;
  search_text: string = "";
  elemento_filtro: string = "todos";

  vista: string = "principal";

  customColumn = 'Nombre';
  defaultColumns = [ 'Stock', 'Vender', 'Cantidad comprada (' + moment ().format ('MMMM, YYYY') + ')', 'Monto comprado (' + moment ().format ('MMMM, YYYY') + ')'];
  allColumns = [ this.customColumn, ...this.defaultColumns ];

  dataSource: NbTreeGridDataSource<any>;
  sortColumn: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  constructor (
    private dialogService: NbDialogService,
    private route: ActivatedRoute,
    private database: DatabaseService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>) { }

  ngOnInit (): void {
    this.form = new FormGroup ({
      fecha: new FormControl ('', [Validators.required]),
      anio: new FormControl ('', [Validators.required]),
      mes: new FormControl ('', [Validators.required]),
      dia: new FormControl ('', [Validators.required]),
      tipo_comprobante: new FormControl ('ninguno'),
      nro_comprobante: new FormControl (''),
    });

    this.database.get_insumos ().subscribe ((res: any []) => {
      this.insumos = res;
      this._insumos = res;
    });

    this.database.get_empresa_insumos (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any []) => {
      console.log (res);
      this.dataSource = this.dataSourceBuilder.create (this.format_list (res));
      this.loading = false;
    });
  }

  updateSort (sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  format_list (res: any []) {
    let returned: any [] = [];
    res.forEach ((i: any) => {
      let data: any = {};
      data ['Nombre'] = i.insumo.nombre;
      data ['Stock'] = i.data.stock + ' (' + i.insumo.unidad_medida + ')';

      let ofrecer_en_menu = 'Si';
      if (i.data.ofrecer_en_menu === false) {
        ofrecer_en_menu =  'No';
      }
      data ['Vender'] = ofrecer_en_menu;

      let cantidad_comprada: number = 0;
      if (this.valid_value (i.data, 'resumen_' + moment ().format ('YYYY'))) {
        if (this.valid_value (i.data ['resumen_' + moment ().format ('YYYY')], 'cantidad_comprada_' + moment ().format ('MM'))) {
          cantidad_comprada = i.data ['resumen_' + moment ().format ('YYYY')] ['cantidad_comprada_' + moment ().format ('MM')];
        }
      }
      data ['Cantidad comprada (' + moment ().format ('MMMM, YYYY') + ')'] = cantidad_comprada;

      let monto_comprado: number = 0;
      if (this.valid_value (i.data, 'resumen_' + moment ().format ('YYYY'))) {
        if (this.valid_value (i.data ['resumen_' + moment ().format ('YYYY')], 'monto_comprado_' + moment ().format ('MM'))) {
          monto_comprado = i.data ['resumen_' + moment ().format ('YYYY')] ['monto_comprado_' + moment ().format ('MM')];
        }
      }
      data ['Monto comprado (' + moment ().format ('MMMM, YYYY') + ')'] = monto_comprado;

      data ['data'] = i.data;

      returned.push ({
        data: data
      })
    });

    return returned;
  }

  get_monto_comprado_column () {
    return 'Monto comprado (' + moment ().format ('MMMM, YYYY') + ')';
  }

  valid_value (object: any, value: string) {
    if (object [value] === null || object [value] === undefined) {
      return false;
    }

    return true;
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
      // this.database.update_insumo (data)
      //   .then (() => {
      //     dialog.close ();
      //     this.form.reset ();
      //     this.loading = false;
      //   })
      //   .catch ((error: any) => {
      //     console.log ('error', error);
      //     dialog.close ();
      //     this.form.reset ();
      //     this.loading = false;
      //   });
    } else {
      data.id = this.database.createId ();
      data.empresa_id = this.route.snapshot.paramMap.get ('id');

      this.database.add_empresa_insumo (data)
        .then (() => {
          dialog.close ();
          this.form.reset ();
          this.loading = false;
        })
        .catch ((error: any) => {
          console.log ('error', error);
          dialog.close ();
          this.form.reset ();
          this.loading = false;
        });
    }
  }

  registrar_dialog (dialog: any) {
    this.vista = 'registrar';
    // this.dialogService.open (dialog, { context: false });
  }

  editar (item: any, dialog: any) {
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
  }

  // filter () {
  //   console.log (this.search_text);
  //   console.log (this.search_text);

  //   this.items = this._items;

  //   if (this.elemento_filtro === 'todos') {
  //     this.items = this.items.filter ((item: any) => {
  //       return item.insumo.nombre.toLowerCase().indexOf (this.search_text.toLowerCase()) > -1;
  //     });
  //   } else {
  //     this.items = this.items.filter ((item: any) => {
  //       return (item.insumo.nombre.toLowerCase().indexOf (this.search_text.toLowerCase()) > -1) && item.insumo.id === this.elemento_filtro;
  //     });
  //   }
  // }

  onChange () {
    console.log (this.search_text);
    this.insumos = this._insumos;

    this.insumos = this.insumos.filter ((item: any) => {
      return item.data.nombre.toLowerCase().indexOf (this.search_text.toLowerCase()) > -1;
    });
  }

  agregar_para_agregar (event: any) {
    this.search_text = "";
    console.log (event);
    this.para_agregar.push ({
      id: this.database.createId (),
      nombre: event.nombre,
      cantidad: 0,
      precio: event.precio,
      empresa_id: this.route.snapshot.paramMap.get ('id'),
      insumo_id: event.id,
      unidad_medida: event.unidad_medida
    });
  }

  remove (item: any) {
    for( var i = 0; i < this.para_agregar.length; i++) {
      if ( this.para_agregar[i].id === item.id) {
        this.para_agregar.splice(i, 1);
      }
    }
  }

  get_precio_total () {
    let total: number = 0;

    this.para_agregar.forEach ((i: any) => {
      total += i.cantidad * i.precio;
    });

    return total;
  }

  continuar (dialog: any) {
    this.form.controls ['fecha'].setValue (moment ().format ('YYYY[-]MM[-]DD'));
    this.form.controls ['anio'].setValue (moment (this.form.value.fecha).format ('YYYY'));
    this.form.controls ['mes'].setValue (moment (this.form.value.fecha).format ('MM'));
    this.form.controls ['dia'].setValue (moment (this.form.value.fecha).format ('DD'));
    this.dialogService.open (dialog);
  }

  fecha_cambio () {
    this.form.controls ['anio'].setValue (moment (this.form.value.fecha).format ('YYYY'));
    this.form.controls ['mes'].setValue (moment (this.form.value.fecha).format ('MM'));
    this.form.controls ['dia'].setValue (moment (this.form.value.fecha).format ('DD'));
  }

  registrar_ingresos_insumo (dialog: any) {
    this.para_agregar.forEach ((i: any) => {
      i.fecha = this.form.value.fecha,
      i.anio = this.form.value.anio,
      i.mes = this.form.value.mes,
      i.dia = this.form.value.dia,
      i.tipo_comprobante = this.form.value.tipo_comprobante,
      i.nro_comprobante = this.form.value.nro_comprobante
    });

    this.database.add_ingresos_insumo_empresa (this.para_agregar)
      .then (() => {
        this.para_agregar = [];
        dialog.close ();
      })
      .catch ((error: any) => {
        console.log (error);
      });
  }

  update_vender (data: any) {
    this.loading = true;
    console.log (data);
    data.ofrecer_en_menu = !data.ofrecer_en_menu;

    this.database.update_empresa_insumo (data)
      .then (() => {
        this.loading = false;
      })
      .catch ((error: any) => {
        console.log (error);
        this.loading = false;
      })
  }
}
