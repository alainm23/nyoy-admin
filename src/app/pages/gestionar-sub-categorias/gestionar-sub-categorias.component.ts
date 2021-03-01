import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Nebular
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

@Component({
  selector: 'ngx-gestionar-sub-categorias',
  templateUrl: './gestionar-sub-categorias.component.html',
  styleUrls: ['./gestionar-sub-categorias.component.scss']
})
export class GestionarSubCategoriasComponent implements OnInit {
  categorias: any [] = [];
  form: FormGroup;
  loading: boolean = true;

  customColumn = 'Nombre';
  defaultColumns = [ 'Categorias', 'Acciones' ];
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
      categoria_id: new FormControl ('', [Validators.required]),
    });

    this.database.get_tienda_categorias ().subscribe ((res: any []) => {
      this.categorias = res;
    });

    this.database.get_tienda_sub_categorias ().subscribe ((res: any []) => {
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
      returned.push ({
        data: {
          data: i,
          Nombre: i.nombre,
          Categorias: this.categorias.find ((x => x.id === i.categoria_id)).nombre,
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
      this.database.update_tienda_sub_categoria (data)
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
      this.database.add_tienda_sub_categoria (data)
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
    console.log (item);
    this.form.patchValue (item);
    this.dialogService.open (dialog, { context: true });
  }

  delete (item: any) {
    if (confirm("¿Esta seguro que desea eliminar?")) {
      this.database.delete_insumo_categoria (item);
    }
  }

  cancelar (dialog: any) {
    dialog.close ();
  }
}
