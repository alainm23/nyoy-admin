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

@Component({
  selector: 'ngx-gestionar-categorias',
  templateUrl: './gestionar-categorias.component.html',
  styleUrls: ['./gestionar-categorias.component.scss']
})
export class GestionarCategoriasComponent implements OnInit {
  form: FormGroup;
  loading: boolean = true;
  file: any =  null;
  avatar_preview: any = null;

  customColumn = 'Nombre';
  defaultColumns = [ 'Imagen', 'Productos', 'Acciones' ];
  allColumns = [ this.customColumn, ...this.defaultColumns ];

  dataSource: NbTreeGridDataSource<any>;
  sortColumn: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>,
    private af_storage: AngularFireStorage,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup ({
      id: new FormControl (),
      nombre: new FormControl ('', [Validators.required])
    });

    this.database.get_tienda_categorias ().subscribe ((res: any []) => {
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
      data.data ['Imagen'] = i.imagen;
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

  validURL (str: string) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  submit (dialog: any, editar: boolean) {
    this.loading = true;
    let data: any = this.form.value;

    if (editar) {
      if (this.file === null) {
        this.database.update_tienda_categoria (data)
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
      data.cantidad_productos = 0;

      if (this.file == null) {
        this.database.add_tienda_categoria (data)
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
          this.database.update_tienda_categoria (data)
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
          this.database.add_tienda_categoria (data)
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
    if (dialog !== null || dialog !== undefined) {
      this.form.reset ();
      this.dialogService.open (dialog, { context: false });
    }
  }

  editar (item: any, dialog: any) {
    this.form.patchValue (item);
    this.avatar_preview = item.imagen;
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
  }

  changeListener (event: any) {
    this.file = event.target.files[0];
    this.getBase64 (this.file);
  }

  getBase64(file: any) {
    var reader = new FileReader ();
    reader.readAsDataURL(file);

    reader.onload = () => {
      this.avatar_preview = reader.result;
    };

    reader.onerror = (error) => {
      console.log (error);
    };
  }
}
