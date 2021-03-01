import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'ngx-reportes-empresa-ventas',
  templateUrl: './reportes-empresa-ventas.component.html',
  styleUrls: ['./reportes-empresa-ventas.component.scss']
})
export class ReportesEmpresaVentasComponent implements OnInit {
  usuario: any;

  // Aux
  ventas: any [] = [];
  empresas: any [] = [];
  instancias: any [] = [];
  reporte_tipo: string = 'diario';
  empresa_reporte: any = null;
  instancia_seleccionada: any = null;

  constructor (private database: DatabaseService, private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.authState ().subscribe ((usuario: firebase.User) => {
      if (usuario) {
        this.database.get_usuario_by_id (usuario.uid).subscribe ((res: any) => {
          if (res !== undefined) {
            this.usuario = res;
            this.get_data ();
          }
        });
      } else {

      }
    });
  }

  get_data () {
    this.database.get_empresas ().subscribe ((res: any []) => {
      console.log (res);
      this.empresas = res;
    });
  }

  get_total_ventas () {
    return 0;
  }

  fecha_changed (event: Date) {
    let day = this.padLeft (event.getDate ());
    let month = this.padLeft (event.getMonth () + 1);
    let year = event.getFullYear ()

    const id: string = this.empresa_reporte.id + '-' + day + '-' + month + '-' + year;

    this.database.get_instancias_por_restaurante_venta (id).subscribe ((res: any []) => {
      console.log (res);
      this.instancias = res;
    });
  }

  padLeft (n: any) {
    return ("00" + n).slice (-2);
  }

  async instancia_cambia (event: any) {
    this.ventas = await this.database.get_restaurante_ventas_instancia (event.tmp_id);
    console.log (this.ventas);
  }
}
