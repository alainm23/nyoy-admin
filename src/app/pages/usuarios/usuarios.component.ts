import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Nebular
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

@Component({
  selector: 'ngx-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: any [] = [];
  empresas: any [] = [];

  form: FormGroup;
  loading: boolean = true;

  customColumn = 'Nombre';
  defaultColumns = [ 'Dirección', 'Tipo de usuario', 'Correo', 'Habilitado', 'Acciones' ];
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
      correo: new FormControl ('', [Validators.required]),
      password: new FormControl ('', [Validators.required]),
      direccion: new FormControl ('', [Validators.required]),
      tipo: new FormControl ('', [Validators.required]),
      habilitado: new FormControl (true, [Validators.required]),
      empresa_id: new FormControl ('')
    });

    this.database.get_usuarios ().subscribe ((res: any []) => {
      this.loading = false;
      this.dataSource = this.dataSourceBuilder.create (this.format_list (res));
    });

    this.database.get_empresas ().subscribe ((res: any []) => {
      this.empresas = res;
      console.log (res);
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

      data ['data'] = i;
      data ['Nombre'] = i.nombre;
      data ['Dirección'] = i.direccion;
      let tipo_usuario: string = 'Admin';
      if (i.tipo === 1) {
        tipo_usuario = 'Repartidor'
      } else if (i.tipo === -1) {
        tipo_usuario = 'Cajero';
      } else if (i.tipo === -2) {
        tipo_usuario = 'POS';
      }
      data ['Tipo de usuario'] = tipo_usuario;
      data ['Correo'] = i.correo;

      let habilitado: string = 'No';
      if (i.habilitado) {
        habilitado = 'Si';
      }
      data ['Habilitado'] = habilitado;
      data ['Acciones'] = 'accion';

      returned.push ({
        data: data
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

  change (event: any) {
    console.log (event);
    if (event === -3) {
      this.form.controls ['empresa_id'].setValidators ([Validators.required]);
    } else {
      this.form.controls ['empresa_id'].setValidators ([]);
    }

    this.form.controls ['empresa_id'].updateValueAndValidity ();
  }

  submit (dialog: any, editar: boolean) {
    this.loading = true;
    let data: any = this.form.value;
    data.habilitado = true;
    data.tipo = Number (this.form.value.tipo);

    console.log (data);

    if (editar) {
      this.database.update_usuario (data)
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
      this.database.add_usuario (data)
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
    this.form.controls ['correo'].disable ();
    this.form.controls ['password'].disable ();
    this.dialogService.open (dialog, { context: true });
  }

  delete (item: any) {
    if (confirm("¿Esta seguro que desea eliminar?")) {
      this.database.delete_usuario (item);
    }
  }

  cancelar (dialog: any) {
    dialog.close ();
  }

  update_usuario (item: any) {
    item.habilitado = !item.habilitado;
    this.loading = true;

    this.database.update_usuario (item)
        .then (() => {
          this.loading = false;
        })
        .catch ((error: any) => {
          console.log ('error', error);
          this.loading = false;
        });
  }
}
