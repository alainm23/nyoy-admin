import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { first, map } from 'rxjs/operators';

@Component({
  selector: 'ngx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  items: any [] = [];
  _items: any [] = [];

  avatar_preview: any = null;
  file: any = null;

  form: FormGroup;
  loading: boolean = true;

  text: string = '';
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private af_storage: AngularFireStorage,
    private afs: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup ({
      id: new FormControl (),
      nombre: new FormControl ('', [Validators.required]),
      linea_comida: new FormControl ('', [Validators.required]),
      logotipo: new FormControl (''),
      telefono: new FormControl ('', [Validators.required]),
      correo: new FormControl ('', [Validators.required]),
      orden: new FormControl (0),
      color: new FormControl ('#3689e6', [Validators.required]),
      habilitado: new FormControl (true)
    });

    this.database.get_empresas ().subscribe ((res: any []) => {
      this.items = res;
      this._items = res;
      this.loading = false;
      console.log (res);
    });
  }

  submit (dialog: any, editar: boolean) {
    this.loading = true;
    let data: any = this.form.value;

    if (editar) {
      if (this.file === null) {
        this.database.update_empresa (data)
        .then (() => {
          this.cancelar (dialog);
        })
        .catch ((error: any) => {
          console.log ('error', error);
          this.cancelar (dialog);
        });
      } else {
        this.uploadImageAsPromise (this.file, data, dialog, true);
      }
    } else {
      data.id = this.database.createId ();

      if (this.file === null) {
        this.database.add_empresa (data)
          .then (() => {
            this.cancelar (dialog);
          })
          .catch ((error: any) => {
            console.log ('error', error);
            this.cancelar (dialog);
          });
      } else {
        this.uploadImageAsPromise (this.file, data, dialog);
      }
    }
  }

  uploadImageAsPromise (file: any, data: any, dialog: any, edit: boolean = false) {
    const filePath = 'Empresas/' + data.id;
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, file);

    task.percentageChanges().subscribe ((res: any) => {

    });

    task.snapshotChanges().pipe (
      finalize(async () => {
        let downloadURL = await fileRef.getDownloadURL ().toPromise();

        data.logotipo = downloadURL;

        if (edit) {
          this.database.update_empresa (data)
            .then (() => {
              this.cancelar (dialog);
            })
            .catch ((error: any) => {
              console.log ('error', error);
              this.cancelar (dialog);
            });
        } else {
          this.database.add_empresa (data)
          .then (() => {
            this.cancelar (dialog);
          })
          .catch ((error: any) => {
            console.log ('error', error);
            this.cancelar (dialog);
          });
        }
      })
    )
    .subscribe ();
  }

  registrar_dialog (dialog: any) {
    this.dialogService.open (dialog, { context: false });
  }

  editar (item: any, dialog: any) {
    this.form.patchValue (item);
    this.dialogService.open (dialog, { context: true });
    this.avatar_preview = item.logotipo;
  }

  delete (item: any) {
    if (confirm("¿Esta seguro que desea eliminar?")) {
      this.database.delete_empresa (item);
    }
  }

  cancelar (dialog: any) {
    this.loading = false;

    this.file = null;
    this.avatar_preview = "";

    dialog.close ();
    this.form.reset ();
  }

  cambiar_estado (item: any) {
    this.loading = true;

    item.habilitado = !item.habilitado;
    this.database.update_empresa (item)
      .then (() => {
        this.loading = false;
      })
      .catch ((error: any) => {
        console.log ('error', error);
        this.loading = false;
      });
  }

  filter () {
    // console.log (this.search_text);
    // console.log (this.search_text);

    // this.items = this._items;

    // if (this.elemento_filtro === 'todos') {
    //   this.items = this.items.filter ((item: any) => {
    //     return item.data.nombre.toLowerCase().indexOf (this.search_text.toLowerCase()) > -1;
    //   });
    // } else {
    //   this.items = this.items.filter ((item: any) => {
    //     return (item.data.nombre.toLowerCase().indexOf (this.search_text.toLowerCase()) > -1) && item.menu_elemento.id === this.elemento_filtro;
    //   });
    // }
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

    };
  }

  getTextColor(color) {
    let rgba: any = this.hexToRgb (color).match(/\d+/g);
    if ((rgba[0] * 0.299) + (rgba[1] * 0.587) + (rgba[2] * 0.114) > 186) {
        return 'black';
    } else {
        return 'white';
    }
  }

  hexToRgb (hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b;
  }

  async export () {
    let data = await this.afs.collection ('Ventas_Tienda_Producto').valueChanges ().pipe (first ()).toPromise ();
    const jsonContent = JSON.stringify(data);
    console.log (jsonContent);
  }

  handleFileInput (files: FileList) {
    console.log (files);
  }

  async import () {
    let list: any [] = JSON.parse (this.text);

    // const wordsPerLine = Math.ceil(list.length / 2)
    // const result = [[], []]

    // for (let line = 0; line < 2; line++) {
    //   for (let i = 0; i < wordsPerLine; i++) {
    //     const value = list[i + line * wordsPerLine]
    //     if (!value) continue //avoid adding "undefined" values
    //     result[line].push(value)
    //   }
    // }

    // console.log (result);

    // result.forEach (async (l) => {
    //   let batch = this.afs.firestore.batch ();
    //   l.forEach ((item: any) => {
    //     batch.set (
    //       this.afs.collection ('Tienda_Productos').doc (item.id).ref,
    //       item
    //     );
    //   });

    //   await batch.commit ().then (() => {
    //     console.log ('Finalizado')
    //   }, error => {
    //     console.log (error);
    //   });
    // });

    console.log (list);
    let batch = this.afs.firestore.batch ();
    list.forEach ((item: any) => {
      batch.set (
        this.afs.collection ('Ventas_Tienda_Producto').doc (item.id).ref,
        item
      );
    });

    await batch.commit ().then (() => {
      console.log ('Finalizado')
    }, error => {
      console.log (error);
    });
  }
}
