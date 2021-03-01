import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Nebular
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

@Component({
  selector: 'ngx-gestionar-marcas',
  templateUrl: './gestionar-marcas.component.html',
  styleUrls: ['./gestionar-marcas.component.scss']
})
export class GestionarMarcasComponent implements OnInit {
  form: FormGroup;
  avatar_preview: any = null;
  loading: boolean = true;

  customColumn = 'Nombre';
  defaultColumns = [ 'Productos', 'Acciones' ];
  allColumns = [ this.customColumn, ...this.defaultColumns ];

  dataSource: NbTreeGridDataSource<any>;
  sortColumn: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup ({
      id: new FormControl (),
      nombre: new FormControl ('', [Validators.required])
    });

    this.database.get_tienda_marcas ().subscribe ((res: any []) => {
      console.log (res);
      this.loading = false;
      this.dataSource = this.dataSourceBuilder.create (this.format_list (res));
    });
  }

  updateSort (sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  format_list (res: any []) {
    let returned: any [] = [];
    res.forEach ((i: any) => {
      let data: any = {
        data: {},
      };
      data.data ['data'] = i;
      data.data ['Nombre'] = i.nombre;
      data.data ['Productos'] = i.cantidad_productos;
      data.data ['Acciones'] = 'accion';
      returned.push (data);
    });

    console.log (returned);
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
      this.database.update_tienda_marca (data)
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
    } else {
      data.id = this.database.createId ();
      data.cantidad_productos = 0;
      this.database.add_tienda_marca (data)
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
    this.form.reset ();
    this.dialogService.open (dialog, { context: false });
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
}
