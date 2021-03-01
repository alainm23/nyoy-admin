import { Injectable } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // Stock
  empresas_insumos = new Map <string, number> ();
  menus_dia = new Map <string, number> ();

  // Tmp
  carrito_insumos_tmp: Map <string, number> = new Map <string, number> ();
  carrito_menus_tmp: Map <string, number> = new Map <string, number> ();
  cantidad_elementos_menu_tmp: any [] = [];
  elementos_menu: any [] = [];

  constructor (private database: DatabaseService) { }

  init_stock (empresa_id: string) {
    this.database.get_empresa_insumos_ventas (empresa_id).subscribe ((res: any []) => {
      res.forEach ((i: any) => {
        this.empresas_insumos.set (i.empresa_id + '-' + i.insumo_id, i.stock);
      });

      console.log (this.empresas_insumos);
    });

    this.database.get_menus_dia_stock ().subscribe ((res: any []) => {
      res.forEach ((i: any) => {
        this.menus_dia.set (i.carta_id + '-' + i.menu_id, i.stock);
      });

      console.log ('menus_dia', this.menus_dia);
    });

    this.database.get_menus_elementos ().subscribe ((res: any []) => {
      this.elementos_menu = res;
      res.forEach ((i: any) => {
        this.cantidad_elementos_menu_tmp [i.id] = 0;
      });
    });
  }

  get_cantidad_elementos_menu_tmp () {
    let cantidad_elementos_menu_tmp: any [] = [];

    this.elementos_menu.forEach ((i: any) => {
      cantidad_elementos_menu_tmp [i.id] = 0;
    });

    return cantidad_elementos_menu_tmp;
  }

  check_valid (plato: any, insumos: any [], cantidad: number) {
    let valid = true;

    insumos.forEach ((i: any) => {
      console.log (i);

      let pedidos = 0;
      let pedidos_acuales = cantidad * i.cantidad;
      let stock = this.check_elemento (plato.empresa_id + '-' + i.insumo_id);

      if (this.carrito_insumos_tmp.get (plato.empresa_id + '-' + i.insumo_id) !== undefined) {
        pedidos = this.carrito_insumos_tmp.get (plato.empresa_id + '-' + i.insumo_id);
      }

      if (stock === undefined || stock < pedidos_acuales + pedidos) {
        valid = false;
      }
    });

    if (valid) {
      insumos.forEach ((i: any) => {
        if (this.carrito_insumos_tmp.get (plato.empresa_id + '-' + i.insumo_id) === undefined) {
          this.carrito_insumos_tmp.set (plato.empresa_id + '-' + i.insumo_id, i.cantidad * cantidad);
        } else {
          let c = this.carrito_insumos_tmp.get (plato.empresa_id + '-' + i.insumo_id);
          this.carrito_insumos_tmp.set (plato.empresa_id + '-' + i.insumo_id, (c + i.cantidad * cantidad));
        }
      });
    }

    return valid;
  }

  check_elemento_menu (id: string) {
    return this.menus_dia.get (id);
  }

  check_menu (menu_dia: any, cantidad: number) {
    let valid = true;

    // let pedidos = 0;
    let pedidos_acuales = cantidad;
    let stock = this.check_elemento_menu (menu_dia.carta_id + '-' + menu_dia.menu_id);

    // if (this.carrito_menus_tmp.get (menu_dia.carta_id + '-' + menu_dia.id) !== undefined) {
    //   pedidos = this.carrito_menus_tmp.get (menu_dia.carta_id + '-' + menu_dia.id);
    // }

    if (stock === undefined || stock < pedidos_acuales) {
      valid = false;
    }

    if (valid) {
      this.cantidad_elementos_menu_tmp [menu_dia.elemento_menu_id] = this.cantidad_elementos_menu_tmp [menu_dia.elemento_menu_id] + 1;
      // if (this.carrito_menus_tmp.get (menu_dia.carta_id + '-' + menu_dia.id) === undefined) {
      //   this.carrito_menus_tmp.set (menu_dia.carta_id + '-' + menu_dia.id, cantidad);
      // } else {
      //   this.carrito_menus_tmp.set (menu_dia.carta_id + '-' + menu_dia.id, cantidad);
      // }
    }

    console.log (this.cantidad_elementos_menu_tmp);
    console.log (this.carrito_menus_tmp);

    return valid;
  }

  remove_menu (menu: any) {
    this.cantidad_elementos_menu_tmp [menu.elemento_menu_id] -= menu.cantidad;
    let c = this.carrito_menus_tmp.get (menu.carta_id + '-' + menu.id);
    this.carrito_menus_tmp.set (menu.carta_id + '-' + menu.id, c - menu.cantidad);
  }

  calcular_menus_completos () {
    let mayor = 0;
    for  (let key in this.cantidad_elementos_menu_tmp) {
      if (this.cantidad_elementos_menu_tmp [key] > mayor) {
        mayor = this.cantidad_elementos_menu_tmp [key];
      }
    }

    let menus_completos: number = mayor;
    for (let index = mayor; index > 0; index--) {
      let completo: boolean = true;
      for (let key in this.cantidad_elementos_menu_tmp) {
        if (this.cantidad_elementos_menu_tmp [key] < index) {
          completo = false;
          menus_completos--;
          break;
        }
      }
    }

    return menus_completos;
  }

  calcular_cantidad_elementos_menu_tmp_precio () {
    let precio = 0;

    this.elementos_menu.forEach ((i: any) => {
      precio += (this.cantidad_elementos_menu_tmp [i.id] - this.calcular_menus_completos ()) * i.precio;
    });

    return precio;
  }

  check_elemento (id: string) {
    return this.empresas_insumos.get (id);
  }

  clean_cache () {
    this.carrito_insumos_tmp.clear ();
    this.carrito_menus_tmp.clear ();
    this.elementos_menu.forEach ((i: any) => {
      this.cantidad_elementos_menu_tmp [i.id] = 0;
    });
  }

  get_menu_elemento_precio (id: string) {
    let returned = 0;

    this.elementos_menu.forEach ((i: any) => {
      if (i.id === id) {
        returned = i.precio;
      }
    });

    return returned;
  }

  verificar_agregar_carrito_promocion (empresa_id: string, insumos: any [], cantidad: number) {
    let valid = true;

    insumos.forEach ((i: any) => {
      let pedidos = 0;
      let pedidos_acuales = cantidad * i.cantidad;
      let stock = this.check_elemento (empresa_id + '-' + i.insumo_id);

      if (this.carrito_insumos_tmp.get (empresa_id + '-' + i.insumo_id) !== undefined) {
        pedidos = this.carrito_insumos_tmp.get (empresa_id + '-' + i.insumo_id);
      }

      if (stock === undefined || stock < pedidos_acuales + pedidos) {
        valid = false;
      }
    });

    if (valid) {
      insumos.forEach ((i: any) => {
        if (this.carrito_insumos_tmp.get (i.empresa_id + '-' + i.insumo_id) === undefined) {
          this.carrito_insumos_tmp.set (i.empresa_id + '-' + i.insumo_id, i.cantidad * cantidad);
        } else {
          let c = this.carrito_insumos_tmp.get (i.empresa_id + '-' + i.insumo_id);
          this.carrito_insumos_tmp.set (i.empresa_id + '-' + i.insumo_id, c + (i.cantidad * cantidad));
        }
      });
    }
    // if (!valid) {
    //   this.presentToast ('El pedido excede a nuestro stock', 'danger');
    // }

    return valid;
  }
}
