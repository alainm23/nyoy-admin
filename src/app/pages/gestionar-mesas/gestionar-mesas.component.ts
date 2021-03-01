import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-gestionar-mesas',
  templateUrl: './gestionar-mesas.component.html',
  styleUrls: ['./gestionar-mesas.component.scss']
})
export class GestionarMesasComponent implements OnInit {
  subscribe_01: any;
  items: any [] = [];
  is_loading: boolean = true;
  show_nuevo: boolean = false;
  is_nuevo_loading: boolean = false;
  nuevo: string = "";
  empresa_id: string;

  constructor(private database: DatabaseService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.empresa_id = this.route.snapshot.paramMap.get ('id');

    this.subscribe_01 = this.database.get_mesas_empresas (this.empresa_id).subscribe ((response: any []) => {
      this.items = response.reverse ();
      this.is_loading = false;
    });
  }

  ngOnDestroy () {
    if (this.subscribe_01 !== null && this.subscribe_01 !== undefined) {
      this.subscribe_01.unsubscribe ();
    }
  }

  eliminar (item: any) {
    var opcion = confirm("Eliminar?");
    if (opcion == true) {
      this.database.delete_mesa (item);
    } else {
      console.log ("Cancelar");
    }
  }

  editar (item: any) {
    item.edit = true;
  }

  cancel (item: any) {
    item.edit = false;
  }

  guardar (item: any) {
    let nombre = (<HTMLInputElement> document.getElementById (item.id)).value;

    if (nombre !== "") {
      item.nombre = nombre;

      this.database.update_mesa (item)
        .then (() => {
          console.log ("Actualizado");
          item.edit = false;
        })
        .catch ((error) => {
          console.log ("error", error);
          item.edit = false;
        });
    } else {
    }
  }

  cancel_nuevo () {
    this.show_nuevo = false;
    this.nuevo = "";
  }

  guardar_nuevo () {
    if (this.nuevo != "") {
      this.is_nuevo_loading = true;

      let item: any = {
        id: this.database.createId (),
        empresa_id: this.empresa_id,
        nombre: this.nuevo,
        habilitado: true,
        fecha_agregada: new Date ().toISOString ()
      };

      this.database.add_mesa (item)
        .then (() => {
          this.nuevo = "";
          this.show_nuevo = false;
          this.is_nuevo_loading = false;
        })
        .catch (error => {

        });
    } else {

    }
  }

  agregar_nuevo () {
    this.show_nuevo = true;
  }
}
