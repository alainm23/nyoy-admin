import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Nebular
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

@Component({
  selector: 'ngx-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.scss']
})
export class InsumosComponent implements OnInit {
  categorias: any [] = [];

  form: FormGroup;
  loading: boolean = true;

  customColumn = 'Nombre';
  defaultColumns = [ 'Unidad', 'Precio', 'Categoria', 'Acciones' ];
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
      nombre: new FormControl ('', [Validators.required]),
      unidad_medida: new FormControl ('', [Validators.required]),
      precio: new FormControl (0, [Validators.required]),
      categoria_id: new FormControl ('', [Validators.required])
    });

    this.database.get_insumos ().subscribe ((res: any []) => {
      this.loading = false;
      this.dataSource = this.dataSourceBuilder.create (this.format_list (res));
    });

    this.database.get_insumos_categoria ().subscribe ((res: any []) => {
      this.categorias = res;
    });
  }

  updateSort (sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  format_list (res: any []) {
    let returned: any [] = [];
    res.forEach ((i: any) => {
      returned.push ({
        data: {
          data: i.data,
          Nombre: i.data.nombre,
          Unidad: i.data.unidad_medida,
          Precio: i.data.precio,
          Categoria: i.categoria.nombre,
          Acciones: 'accion'
        },
      })
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
      this.database.update_insumo (data)
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
      this.database.add_insumo (data)
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

  eliminar (data: any) {
    console.log ('Eliminar', data);
    this.database.eliminar_insumo (data.id);
  }
}
