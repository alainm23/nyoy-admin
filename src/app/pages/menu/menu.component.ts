import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Nebular
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

@Component({
  selector: 'ngx-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  elementos: any [] = [];

  form: FormGroup;
  loading: boolean = true;

  customColumn = 'Nombre';
  defaultColumns = [ 'Menu', 'Acciones' ];
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
      // precio: new FormControl (0),
      elemento_menu_id: new FormControl ('', [Validators.required])
    });

    this.database.get_menus ().subscribe ((res: any []) => {
      this.loading = false;
      this.dataSource = this.dataSourceBuilder.create (this.format_list (res));
    });

    this.database.get_menu_elementos ().subscribe ((res: any []) => {
      this.elementos = res;
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
          Menu: i.menu_elemento.nombre,
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
      this.database.update_menu (data)
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
      this.database.add_menu (data)
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
    this.dialogService.open (dialog, { context: false });
  }

  editar (item: any, dialog: any) {
    this.form.patchValue (item);
    this.dialogService.open (dialog, { context: true });
  }

  delete (item: any) {
    if (confirm("¿Esta seguro que desea eliminar?")) {
      this.database.delete_menu (item);
    }
  }

  cancelar (dialog: any) {
    dialog.close ();
    this.form.reset ();
  }
}
