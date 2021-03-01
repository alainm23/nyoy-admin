import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { DatabaseService } from "../services/database.service";
import { Router } from '@angular/router';

import { first } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  usuario: any = {
    id: '',
    nombre: '',
    correo: '',
    tipo: 1
  };

  menu: any [] = [
    {
      title: 'Pedidos',
      icon: 'car-outline',
      hidden: false,
      acceso: [0],
      children: [
        {
          title: 'En progreso',
          icon: 'star-outline',
          link: '/pages/pedidos',
          hidden: false,
          acceso: [0],
        },
        {
          title: 'Recientes',
          icon: 'clock-outline',
          link: '/pages/pedidos-historial',
          hidden: false,
          acceso: [0],
        }
      ]
    },
    {
      title: 'Empresas',
      icon: 'layers-outline',
      link: '/pages/home',
      hidden: false,
      acceso: [0],
    },
    {
      title: 'Usuarios',
      icon: 'people-outline',
      link: '/pages/usuarios',
      hidden: false,
      acceso: [0],
    },
    {
      title: 'Estadisticas',
      icon: 'activity-outline',
      hidden: false,
      acceso: [0],
      children: [
        {
          title: 'Empresa',
          link: '/pages/estadisticas/empresa',
          hidden: false,
          acceso: [0]
        },
      ]
    },
    {
      title: 'Suministros',
      icon: 'cube-outline',
      hidden: false,
      acceso: [0],
      children: [
        {
          title: 'Insumos',
          link: '/pages/insumos',
          hidden: false,
          acceso: [0],
        },
        {
          title: 'Categorias',
          link: '/pages/insumos-categoria',
          hidden: false,
          acceso: [0],
        },
      ]
    },
    {
      title: 'Menu',
      icon: 'book-open-outline',
      hidden: false,
      acceso: [0],
      children: [
        {
          title: 'Menu elementos',
          link: '/pages/menu-elementos',
          hidden: false,
          acceso: [0],
        },
        {
          title: 'Menus',
          link: '/pages/menu',
          hidden: false,
          acceso: [0],
        },
      ]
    },
    {
      title: 'ViaMart',
      icon: 'shopping-cart-outline',
      hidden: false,
      acceso: [0, -2, -1],
      children: [
        {
          title: 'Punto de Venta',
          link: '/pages/gestionar-ventas',
          hidden: false,
          acceso: [-2, 0, -1],
        },
        {
          title: 'Gestionar Productos',
          link: '/pages/gestionar-productos',
          hidden: false,
          acceso: [-2, 0],
        },
        {
          title: 'Gestionar Categorias',
          link: '/pages/gestionar-categorias',
          hidden: false,
          acceso: [-2, 0],
        },
        {
          title: 'Gestionar Sub Categorias',
          link: '/pages/gestionar-sub-categorias',
          hidden: false,
          acceso: [-2, 0],
        },
        {
          title: 'Gestionar Marcas',
          link: '/pages/gestionar-marcas',
          hidden: false,
          acceso: [-2, 0],
        },
        {
          title: 'Reportes',
          link: '/pages/reportes-venta',
          hidden: false,
          acceso: [-2, 0],
        },
        {
          title: 'Cambios o devoluciones',
          link: '/pages/gestion-cambios-devoluciones',
          hidden: false,
          acceso: [-2, 0],
        }
      ]
    },
    {
      title: 'Punto de Venta',
      icon: 'settings-2-outline',
      link: '/pages/gestionar-ventas-restaurante',
      hidden: false,
      acceso: [-3],
    },
    {
      title: 'Reportes',
      icon: 'settings-2-outline',
      link: '/pages/reportes-empresa-ventas',
      hidden: false,
      acceso: [-3],
    },
    {
      title: 'Configuración',
      icon: 'settings-2-outline',
      link: '/pages/configuracion',
      hidden: false,
      acceso: [0],
    },
  ];

  esta_logeado: boolean = false;
  constructor (public afAuth: AngularFireAuth,
    public router: Router,
    public database: DatabaseService) {
      this.authState ().subscribe ((usuario: firebase.User) => {
        if (usuario) {
          this.database.get_usuario_by_id (usuario.uid).subscribe ((res: any) => {
            if (res !== undefined) {
              this.usuario = res;
              this.format_menu (this.usuario.tipo);
              this.esta_logeado = true;
            }
          });
        } else {
          this.format_menu (null);
        }
      });
  }

  async isLogin () {
    return await this.afAuth.authState.pipe (first ()).toPromise ();
  }

  public authState () {
    return this.afAuth.authState;
  }

  public signInWithEmailAndPassword (email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword (email, password);
  }

  public signOut () {
    return this.afAuth.signOut ();
  }

  format_menu (tipo_usuario: number) {
    if (tipo_usuario === null) {
      this.menu.forEach ((menu: any) => {
        menu.hidden = true;
      });
    } else {
      this.menu.forEach ((menu: any) => {
        if (this.valido (tipo_usuario, menu.acceso)) {
          menu.hidden = false;
        } else {
          menu.hidden = true;
        }

        if (menu.children !== undefined && menu.children !== null) {
          menu.children.forEach ((children: any) => {
            if (this.valido (tipo_usuario, children.acceso)) {
              children.hidden = false;
            } else {
              children.hidden = true;
            }
          });
        }
      });
    }
  }

  valido (tipo: number, array: any []) {
    let valido: boolean = false;
    array.forEach ((e: any) => {
      if (e === tipo) {
        valido = true;
      }
    });

    return valido;
  }
}
