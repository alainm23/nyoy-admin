import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NbDialogService } from '@nebular/theme';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { first } from 'rxjs/operators';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'ngx-empresa-cartas',
  templateUrl: './empresa-cartas.component.html',
  styleUrls: ['./empresa-cartas.component.scss']
})
export class EmpresaCartasComponent implements OnInit {
  empresa: any;

  items: any [] = [];
  almacen_insumos: any [] = [];
  menu_elementos: any [] = [];
  menus: any [] = [];
  menus_dia: any [] = [];
  all_platos: any [] = [];
  combo_list: any [] = [];

  form: FormGroup;
  form_menu_dia: FormGroup;
  form_plato: FormGroup;

  form_promocion: FormGroup;
  form_promocion_combo: FormGroup;

  tipo_promocion: number = -1;

  loading: boolean = true;

  vista: string = 'principal';
  insumos: any [] = [];
  _insumos: any [] = [];
  para_agregar: any [] = [];
  _para_agregar: any [] = [];
  promociones: any [] = [];
  search_text: string = "";

  avatar_preview: any = null;
  file: any = null;
  file_menu: any = null;
  file_combo: any = null;

  plato_editar: boolean = false;
  plato_selected: any = '';
  empresa_id: string = '';
  insumo_selected; any;
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private af_storage: AngularFireStorage,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup ({
      id: new FormControl (),
      nombre: new FormControl ('', [Validators.required]),
      tipo_carta: new FormControl ('0', [Validators.required]),
      orden: new FormControl (0, [Validators.required]),
      precio: new FormControl (0),
      empresa_id: new FormControl (0),
      habilitado: new FormControl (true),
    });

    this.form_menu_dia = new FormGroup ({
      id: new FormControl (),
      carta_id: new FormControl (''),
      empresa_id: new FormControl (''),
      elemento_menu_id: new FormControl (''),
      menu_id: new FormControl ('', [Validators.required]),
      menu_nombre: new FormControl ('', [Validators.required]),
      stock: new FormControl (0, [Validators.required]),
      precio: new FormControl (0, [Validators.required]),
      insumo_id: new FormControl (''),
    });

    this.form_plato = new FormGroup ({
      id: new FormControl (),
      carta_id: new FormControl ('', [Validators.required]),
      empresa_id: new FormControl ('', [Validators.required]),
      nombre: new FormControl ('', [Validators.required]),
      imagen: new FormControl (''),
      resumen: new FormControl ('', [Validators.required]),
      descripcion: new FormControl ('', [Validators.required]),
      precio: new FormControl (0, [Validators.required]),
      orden: new FormControl (0, [Validators.required]),
      // es_adicional: new FormControl (0, [Validators.required]),
      habilitado: new FormControl (true, [Validators.required])
    });

    this.form_promocion = new FormGroup ({
      id: new FormControl (),
      nombre: new FormControl ('', [Validators.required]),
      descripcion: new FormControl ('', [Validators.required]),
      imagen: new FormControl (''),
      descuento: new FormControl ('', [Validators.required]),
      tipo_promocion: new FormControl ('0', [Validators.required]),
      plato_id: new FormControl (''),
    });

    this.form_promocion_combo = new FormGroup ({
      id: new FormControl (),
      descuento: new FormControl ('', [Validators.required])
    });

    this.empresa_id = this.route.snapshot.paramMap.get ('id');

    this.database.get_empresa_by_id (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any) => {
      this.empresa = res;
    });

    this.database.get_cartas_by_empresa (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any []) => {
      this.items = res;
      this.loading = false;
      console.log (res);
    });

    this.database.get_empresa_insumos_venta (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any []) => {
      this.almacen_insumos = res
    });

    this.database.get_menu_elementos ().subscribe ((res: any []) => {
      this.menu_elementos = res;
    });

    this.database.get_menus ().subscribe ((res: any) => {
      this.menus = res;
    });

    this.database.get_menus_dia (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any) => {
      this.menus_dia = res;
    });

    this.database.get_insumos ().subscribe ((res: any []) => {
      this.insumos = res;
      this._insumos = res;
    });

    this.database.get_all_platos ().subscribe ((res: any []) => {
      this.all_platos = res;
    });

    this.database.get_all_promociones ().subscribe ((res: any []) => {
      this.promociones = res;
      console.log ('promociones', res);
    });
  }

  tipoCartaChanged (val: any, data: any) {
    data.tipo_carta = this.form.value.tipo_carta;
    if (this.form.value.tipo_carta == '0') {
      this.form.controls ['precio'].setValidators ([Validators.required]);
      this.form.controls ['precio'].enable ();
    } else {
      this.form.controls ['precio'].setValidators ([]);
      this.form.controls ['precio'].disable ();
    }
  }

  uploadIMenumageAsPromise (file: any, data: any, editar: boolean = false, dialog: any) {
    const filePath = '/Menus/' + data.id;
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, file);

    task.percentageChanges().subscribe ((res: any) => {

    });

    task.snapshotChanges().pipe (
      finalize(async () => {
        let downloadURL = await fileRef.getDownloadURL ().toPromise();

        data.imagen = downloadURL;

        if (editar) {
          this.database.update_carta (data)
            .then (() => {
              dialog.close ();
              this.form.reset ();
              this.loading = false;
              this.avatar_preview = null;
              this.file_menu = null;
            })
            .catch ((error: any) => {
              console.log ('error', error);
              dialog.close ();
              this.form.reset ();
              this.loading = false;
              this.avatar_preview = null;
              this.file_menu = null;
            });
        } else {
          this.database.add_carta (data)
            .then (() => {
              dialog.close ();
              this.form.reset ();
              this.loading = false;
              this.avatar_preview = null;
              this.file_menu = null;
            })
            .catch ((error: any) => {
              console.log ('error', error);
              dialog.close ();
              this.form.reset ();
              this.loading = false;
              this.avatar_preview = null;
              this.file_menu = null;
            });
        }
      })
    )
    .subscribe ();
  }

  submit (dialog: any, editar: any) {
    this.loading = true;
    let data: any = this.form.value;

    console.log (data);
    console.log (editar);

    if (editar.editar) {
      if (this.file_menu !== null) {
        this.uploadIMenumageAsPromise (this.file_menu, data, true, dialog);
      } else {
        this.database.update_carta (data)
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
    } else {
      data.id = this.database.createId ();
      data.empresa_id = this.route.snapshot.paramMap.get ('id');

      if (this.file_menu !== null) {
        this.uploadIMenumageAsPromise (this.file_menu, data, false, dialog);
      } else {
        this.database.add_carta (data)
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
  }

  registrar_dialog (dialog: any) {
    this.form.controls ['tipo_carta'].enable ();
    this.form.controls ['tipo_carta'].setValue ('0');
    this.dialogService.open (dialog, { context: { editar: false, tipo_carta: '0' } });
  }

  editar (item: any, dialog: any) {
    console.log (item);
    this.avatar_preview = item.imagen;
    this.form.controls ['tipo_carta'].disable ();
    this.form.controls ['precio'].enable ();
    this.form.patchValue (item);
    this.dialogService.open (dialog, { context: { editar: true, tipo_carta: item.tipo_carta } });
  }

  delete (item: any) {
    if (confirm("¿Esta seguro que desea eliminar?")) {
      this.database.delete_carta (item);
    }
  }

  cancelar (dialog: any) {
    this.loading = false;

    dialog.close ();
    this.form.reset ();
    this.form_menu_dia.reset ();
    this.file_menu = null;
    this.avatar_preview = null;
  }

  cambiar_estado (item: any) {
    this.loading = true;

    if (item.habilitado === true) {
      item.habilitado = false;
    } else {
      item.habilitado = true;
    }

    this.database.update_carta (item)
      .then (() => {
        this.loading = false;
      })
      .catch ((error: any) => {
        console.log ('error', error);
        this.loading = false;
      });
  }

  registrar_menu_dia (carta: any, menu: any, dialog: any, tipo: string = 'menu') {
    console.log (menu);
    this.form_menu_dia.controls ['stock'].setValue (1);
    this.form_menu_dia.controls ['precio'].setValue (menu.precio);

    let _menus: any [] = [];
    if (tipo === 'menu') {
      _menus = this.menus.filter ((m: any) => {
        return (m.data.elemento_menu_id === menu.id) &&
          (this.menu_existe (this.get_menus (carta, menu), m.data) === undefined);
      });
    }

    this.dialogService.open (dialog, { context: {
      carta: carta,
      menu: menu,
      menus: _menus,
      tipo: tipo
    }});
  }

  menu_existe (lista: any [], menu: any) {
    console.log (lista.find (x => x.id === menu.id));
    return lista.find (x => x.menu_id === menu.id);
  }

  menu_changed (tipo: string) {
    if (tipo === 'menu') {
      let menu = this.menus.find (x => x.data.id ===  this.form_menu_dia.value.menu_id);
      this.form_menu_dia.controls ['menu_nombre'].setValue (menu.data.nombre);
      this.form_menu_dia.controls ['precio'].setValue (menu.menu_elemento.precio);
    } else {
      let insumo_almacen = this.almacen_insumos.find (x => x.data.id ===  this.form_menu_dia.value.menu_id);
      this.form_menu_dia.controls ['menu_nombre'].setValue (insumo_almacen.insumo.nombre);
      this.form_menu_dia.controls ['precio'].setValue (insumo_almacen.insumo.precio);
      this.form_menu_dia.controls ['insumo_id'].setValue (insumo_almacen.insumo.id);
    }
  }

  submit_menu_dia (dialog: any, data: any) {
    let request: any = this.form_menu_dia.value;
    request.id = this.database.createId ();
    request.carta_id = data.carta.id;
    request.empresa_id = this.route.snapshot.paramMap.get ('id');

    if (data.tipo === 'menu') {
      request.elemento_menu_id = data.menu.id;
    }

    request.tipo = data.tipo;

    this.loading = true;

    this.database.add_menu_dia (request)
      .then (() => {
        this.cancelar (dialog);
      }).catch ((error: any) => {
        console.log (error);
        this.cancelar (dialog);
      });
  }

  get_menus (carta: any, menu: any, tipo: string='menu') {
    if (tipo === 'menu') {
      return this.menus_dia.filter ((i: any) => {
        return i.carta_id === carta.id && i.elemento_menu_id === menu.id;
      });
    } else {
      return this.menus_dia.filter ((i: any) => {
        return i.carta_id === carta.id && i.tipo === tipo;
      });
    }
  }

  eliminar_menu_dia (menu: any) {
    console.log (menu);

    this.database.delete_menu_dia (menu)
      .then (() => {

      })
      .catch ((error: any) => {
        console.log (error);
      })
  }

  vista_registrar_plato (carta: any) {
    console.log (carta);

    this.vista = 'registrar';

    this.form_plato.controls ['carta_id'].setValue (carta.id);
    this.form_plato.controls ['empresa_id'].setValue (this.route.snapshot.paramMap.get ('id'));
  }

  onChange () {
    console.log (this.search_text);
    this.insumos = this._insumos;

    this.insumos = this.insumos.filter ((item: any) => {
      return item.data.nombre.toLowerCase().indexOf (this.search_text.toLowerCase()) > -1;
    });
  }

  agregar_para_agregar (event: any) {
    console.log (event);
    this.para_agregar.push ({
      id: this.database.createId (),
      insumo_id: event.id,
      nombre: event.nombre,
      cantidad: 0,
      unidad_medida: event.unidad_medida
    });
  }

  remove (item: any) {
    for ( var i = 0; i < this.para_agregar.length; i++) {
      if ( this.para_agregar[i].id === item.id) {
        this.para_agregar.splice(i, 1);
      }
    }
  }

  remove_plato_promocion (item: any) {
    for ( var i = 0; i < this.combo_list.length; i++) {
      if ( this.combo_list[i].id === item.id) {
        this.combo_list.splice(i, 1);
      }
    }
  }

  changeListener (event: any) {
    this.file = event.target.files[0];
    this.getBase64 (this.file);
  }

  change_menu_Listener (event: any) {
    this.file_menu = event.target.files[0];
    this.getBase64 (this.file_menu);
  }

  change_combo_Listener (event: any) {
    this.file_combo = event.target.files[0];
    this.getBase64 (this.file_combo);
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

  submit_plato () {
    this.loading = true;
    let data: any = this.form_plato.value;

    if (this.plato_editar) {
      if (this.file == null) {
        this.database.update_plato (data, this.para_agregar, this._para_agregar)
          .then (() => {
            this.form_plato.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
            this.vista = 'principal';
            this.para_agregar = [];
            this._para_agregar = [];
          })
          .catch ((error: any) => {
            console.log ('error', error);
            this.form_plato.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
            this.vista = 'principal';
            this.para_agregar = [];
            this._para_agregar = [];
          });
      } else {
        this.uploadImageAsPromise (this.file, data, true);
      }
    } else {
      data.id = this.database.createId ();

      if (this.file == null) {
        this.database.add_plato (data, this.para_agregar)
          .then (() => {
            this.form_plato.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
            this.vista = 'principal';
          })
          .catch ((error: any) => {
            console.log ('error', error);
            this.form_plato.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
            this.vista = 'principal';
          });
      } else {
        this.uploadImageAsPromise (this.file, data);
      }
    }
  }

  uploadImageAsPromise (file: any, data: any, editar: boolean = false) {
    const filePath = '/Platos/' + data.id;
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, file);

    task.percentageChanges().subscribe ((res: any) => {

    });

    task.snapshotChanges().pipe (
      finalize(async () => {
        let downloadURL = await fileRef.getDownloadURL ().toPromise();

        data.imagen = downloadURL;

        if (editar) {
          this.database.update_plato (data, this.para_agregar, this._para_agregar)
          .then (() => {
            this.form_plato.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
            this.vista = 'principal';
            this.plato_editar = false;
            this.para_agregar = [];
            this._para_agregar = [];
          })
          .catch ((error: any) => {
            console.log ('error', error);
            this.form_plato.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
            this.vista = 'principal';
            this.plato_editar = false;
            this.para_agregar = [];
            this._para_agregar = [];
          });
        } else {
          this.database.add_plato (data, this.para_agregar)
          .then (() => {
            this.form_plato.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
            this.vista = 'principal';
            this.plato_editar = false;
            this.para_agregar = [];
            this._para_agregar = [];
          })
          .catch ((error: any) => {
            console.log ('error', error);
            this.form_plato.reset ();
            this.loading = false;
            this.avatar_preview = null;
            this.file = null;
            this.vista = 'principal';
            this.plato_editar = false;
            this.para_agregar = [];
            this._para_agregar = [];
          });
        }
      })
    )
    .subscribe ();
  }

  cambiar_estado_plato (plato: any) {
    this.loading = true;
    plato.habilitado = !plato.habilitado;
    this.database.update_plato (plato, [], [])
      .then (() => {
        this.loading = false;
      })
      .catch ((error: any) => {
        console.log (error);
        this.loading = false;
      });
  }

  async editar_plato (plato: any) {
    this.para_agregar = [];
    this._para_agregar = [];
    console.log (plato);
    this.avatar_preview = plato.imagen;
    this.plato_editar = true;

    let res: any [] = await this.database.get_plato_insumos_by_plato_id (plato.id).pipe (first ()).toPromise ();
    console.log (res);
    res.forEach ((p_i: any) => {
      if (p_i.insumo !== undefined) {
        this.para_agregar.push ({
          id: p_i.data.id,
          insumo_id: p_i.insumo.id,
          cantidad: p_i.data.cantidad,
          unidad_medida: p_i.insumo.unidad_medida,
          nombre: p_i.insumo.nombre
        });

        this._para_agregar.push ({
          id: p_i.data.id,
          insumo_id: p_i.insumo.id,
          cantidad: p_i.data.cantidad,
          unidad_medida: p_i.insumo.unidad_medida,
          nombre: p_i.insumo.nombre
        });
      }
    });

    console.log (this.para_agregar);
    console.log (this._para_agregar);

    this.vista = 'registrar';
    this.form_plato.patchValue (plato);
  }

  uploadComboImageAsPromise (file: any, data: any, dialog: any) {
    const filePath = '/Combos/' + data.id;
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, file);

    task.percentageChanges().subscribe ((res: any) => {

    });

    task.snapshotChanges().pipe (
      finalize(async () => {
        let downloadURL = await fileRef.getDownloadURL ().toPromise();

        data.imagen = downloadURL;
        this.database.add_promocion (data)
          .then (() => {
            this.form_promocion.reset ();
            this.loading = false;
            dialog.close ();
            this.combo_list = [];
            this.avatar_preview = null;
            this.file_combo = null;
          })
          .catch ((error: any) => {
            this.form_promocion.reset ();
            console.log (error);
            dialog.close ();
            this.loading = false;
            this.avatar_preview = null;
            this.file_combo = null;
          });
      })
    )
    .subscribe ();
  }

  registrar_promocion (dialog: any, data: any) {
    this.loading = true;
    let request: any = {
      id: this.database.createId (),
      nombre: this.form_promocion.value.nombre,
      empresa_id: this.empresa_id,
      carta_id: data.id,
      descripcion: this.form_promocion.value.descripcion,
      descuento: this.form_promocion.value.descuento,
      orden: 0,
      tipo: this.form_promocion.value.tipo_promocion,
    };

    if (this.form_promocion.value.tipo_promocion === '0') {
      request.precio_total = this.form_promocion.value.plato_id.precio,
      request.plato = {
        id: this.form_promocion.value.plato_id.id,
        nombre: this.form_promocion.value.plato_id.nombre,
        imagen: this.form_promocion.value.plato_id.imagen,
        tipo: 'plato'
      }

      console.log (request);
      this.database.add_promocion (request)
        .then (() => {
          this.form_promocion.reset ();
          this.loading = false;
          dialog.close ();
          this.combo_list = [];
          this.avatar_preview = null;
          this.file_combo = null;
        })
        .catch ((error: any) => {
          this.form_promocion.reset ();
          console.log (error);
          dialog.close ();
          this.loading = false;
          this.avatar_preview = null;
          this.file_combo = null;
        });
    } else {
      let platos: any [] = [];
      let precio_total = 0;
      this.combo_list.forEach ((e: any) => {
        precio_total += e.precio - (e.precio * (request.descuento / 100)),
        platos.push ({
          id: e.id,
          empresa_id: e.empresa_id,
          imagen: e.imagen,
          nombre: e.nombre,
          precio: e.precio,
          tipo: e.tipo
        });
      });
      request.platos = platos;
      request.precio_total = precio_total;

      if (this.file_combo === null) {
        this.database.add_promocion (request)
          .then (() => {
            this.form_promocion.reset ();
            this.loading = false;
            dialog.close ();
            this.combo_list = [];
            this.avatar_preview = null;
            this.file_combo = null;
          })
          .catch ((error: any) => {
            this.form_promocion.reset ();
            console.log (error);
            dialog.close ();
            this.loading = false;
            this.avatar_preview = null;
            this.file_combo = null;
          });
      } else {
        this.uploadComboImageAsPromise (this.file_combo, request, dialog);
      }
    }
  }

  abrir_registrar_promocion (dialog: any, carta: any) {
    this.dialogService.open (dialog, {
      context: carta
    })
  }

  tipo_promocion_changed () {
    // if (this.tipo_promocion == 0) {
    //   this.form_promocion = this.form_promocion_plato;
    //   this.form_promocion.controls ['tipo_promocion'].setValue (0);
    // } else {
    //   this.form_promocion = this.form_promocion_combo;
    //   this.form_promocion.controls ['tipo_promocion'].setValue (1);
    // }
  }

  plato_selected_changed (event: any) {
    console.log (event);

    event.tipo = 'plato';
    if (this.combo_list.find (x => x.id == event.id) === undefined) {
      this.combo_list.push (event);
    }

    this.plato_selected = '';
    event = '';
  }

  insumo_selected_changed (event: any) {
    console.log (event);
    if (this.combo_list.find (x => x.id == event.insumo.id) === undefined) {
      this.combo_list.push ({
        nombre: event.insumo.nombre,
        precio: event.insumo.precio,
        id: event.insumo.id,
        empresa_id: event.data.empresa_id,
        imagen: '',
        tipo: 'insumo'
      });
    }

    this.insumo_selected = '';
    event = '';
  }

  get_promociones_by_carta (carta_id: string) {
    return this.promociones.filter ((e: any) => {
      return e.carta_id === carta_id;
    });
  }

  eliminar_promocion (data: any) {
    if (confirm("¿Esta seguro que desea eliminar esta promocion?")) {
      this.loading = true;
      this.database.delete_promocion (data).then (() => {
        this.loading = false;
      }, error => {
        console.log (error);
        this.loading = false;
      });
    }
  }

  regresar_principal () {
    this.vista = 'principal'
    this.para_agregar = [];
  }

  eliminar_plato_validar (plato: any) {
    if (plato ['resumen_' + moment ().format ('YYYY')] !== undefined) {
      if (confirm ('¿Esta seguro que desea eliminar este plato?')) {
        this.loading = true;
        this.database.delete_plato (plato.id).then (() => {
          this.loading = false;
        }, error => {
          this.loading = false;
          console.log (error);
        });
      }
    } else {
      this.loading = true;
      this.database.delete_plato (plato.id).then (() => {
        this.loading = false;
      }, error => {
        this.loading = false;
        console.log (error);
      });
    }
  }

  eliminar_carta_validar (carta: any) {
    console.log (carta);
    if (carta.data.tipo_carta === '0') {
      let menus_dia = this.menus_dia.filter ((x: any) => {
        return x.carta_id === carta.data.id;
      });

      this.database.delete_carta_menu (carta.data.id, menus_dia).then (() => {
        this.loading = false;
      }, error => {
        this.loading = false;
        console.log (error);
      });
    } else if (carta.data.tipo_carta === '1') {
      let promociones: any [] = [];
      this.promociones.forEach ((promocion: any) => {
        if (promocion.tipo === '0') {
          if (carta.platos.find (x => x.id === promocion.plato.id) !== undefined) {
            if (promociones.find (x => x.id === promocion.id) === undefined) {
              promociones.push (promocion);
            }
          }
        }

        if (promocion.tipo === '1') {
          promocion.platos.forEach ((plato: any) => {
            if (carta.platos.find (x => x.id === plato.id) !== undefined) {
              if (promociones.find (x => x.id === promocion.id) === undefined) {
                promociones.push (promocion);
              }
            }
          });
        }
      });

      if (carta.platos.length > 0) {
        if (confirm ('¿Esta seguro que quiere eliminar esta carta?')) {
          console.log (promociones);
          this.loading = true;
          this.database.delete_carta_extra (carta.data.id, carta.platos, promociones).then (() => {
            this.loading = false;
          }, error => {
            this.loading = false;
            console.log (error);
          });
        }
      } else {
        this.loading = true;
        console.log (promociones);
        this.database.delete_carta_extra (carta.data.id, carta.platos, promociones).then (() => {
          this.loading = false;
        }, error => {
          this.loading = false;
          console.log (error);
        });
      }
    } else if (carta.data.tipo_carta === '2') {
      if (confirm ('¿Esta seguro que quiere eliminar esta carta tipo promoción?')) {
        this.loading = true;
        let promociones: any [] = this.get_promociones_by_carta (carta.data.id);
        console.log (promociones);
        this.database.delete_carta_promocion (carta.data.id, promociones).then (() => {
          this.loading = false;
        }, error => {
          this.loading = false;
          console.log (error);
        });
      }
    }
  }
}
