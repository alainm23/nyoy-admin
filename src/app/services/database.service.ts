import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { first, map } from 'rxjs/operators';
import { combineLatest, of } from "rxjs";
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor (private afs: AngularFirestore) {
  }

  createId () {
    return this.afs.createId ();
  }

  // CATEGORIA INSUMOS CRUD
  get_insumo_categoria_by_id (id: string) {
    return this.afs.collection ('Insumo_Categorias').doc (id).valueChanges ();
  }

  add_insumo_categoria (data: any) {
    return this.afs.collection ('Insumo_Categorias').doc (data.id).set (data);
  }

  get_insumos_categoria () {
    return this.afs.collection ('Insumo_Categorias').valueChanges ();
  }

  update_insumo_categoria (data: any) {
    return this.afs.collection ('Insumo_Categorias').doc (data.id).update (data);
  }

  delete_insumo_categoria (data: any) {
    return this.afs.collection ('Insumo_Categorias').doc (data.id).delete ();
  }

  // INSUMOS CRUD
  get_insumo_by_id (id: string) {
    return this.afs.collection ('Insumos').doc (id).valueChanges ();
  }

  add_insumo (data: any) {
    return this.afs.collection ('Insumos').doc (data.id).set (data);
  }

  eliminar_insumo (id: string) {
    return this.afs.collection ('Insumos').doc (id).delete ();
  }

  get_insumos () {
    const collection = this.afs.collection ('Insumos');

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_insumo_categoria_by_id (data.categoria_id).pipe (map (categoria => Object.assign ({}, { data, categoria })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  add_tienda_categoria (data: any) {
    return this.afs.collection ('Tienda_Categorias').doc (data.id).set (data);
  }

  update_tienda_categoria (data: any) {
    return this.afs.collection ('Tienda_Categorias').doc (data.id).update (data);
  }

  add_tienda_sub_categoria (data: any) {
    return this.afs.collection ('Tienda_SubCategorias').doc (data.id).set (data);
  }

  get_tienda_sub_categorias_by_categoria (categoria_id: string) {
    return this.afs.collection ('Tienda_SubCategorias', ref => ref.where ('categoria_id', '==', categoria_id)).valueChanges ();
  }

  add_tienda_producto (data: any) {
    return this.afs.collection ('Tienda_Productos').doc (data.id).set (data);
  }

  update_tienda_producto (data: any) {
    return this.afs.collection ('Tienda_Productos').doc (data.id).update (data);
  }

  get_tienda_productos () {
    return this.afs.collection ('Tienda_Productos').valueChanges ();
  }

  get_tienda_productos_by_categoria (id: string) {
    return this.afs.collection ('Tienda_Productos', ref => ref.where ('categoria_id', '==', id)).valueChanges ();
  }

  update_tienda_sub_categoria (data: any) {
    return this.afs.collection ('Tienda_SubCategorias').doc (data.id).update (data);
  }

  get_tienda_sub_categorias () {
    return this.afs.collection ('Tienda_SubCategorias').valueChanges ();
  }

  add_tienda_marca (data: any) {
    return this.afs.collection ('Tienda_Marcas').doc (data.id).set (data);
  }

  update_tienda_marca (data: any) {
    return this.afs.collection ('Tienda_Marcas').doc (data.id).update (data);
  }

  get_tienda_marcas () {
    return this.afs.collection ('Tienda_Marcas').valueChanges ();
  }

  get_tienda_categorias () {
    return this.afs.collection ('Tienda_Categorias').valueChanges ();
  }

  update_insumo(data: any) {
    return this.afs.collection ('Insumos').doc (data.id).update (data);
  }

  delete_insumo (data: any) {
    return this.afs.collection ('Insumos').doc (data.id).delete ();
  }

  // MENU ELEMENTOS CRUD
  get_menu_elemento_by_id (id: string) {
    return this.afs.collection ('Menu_Elementos').doc (id).valueChanges ();
  }

  add_menu_elemento (data: any) {
    return this.afs.collection ('Menu_Elementos').doc (data.id).set (data);
  }

  get_menu_elementos () {
    return this.afs.collection ('Menu_Elementos', ref => ref.orderBy ('orden')).valueChanges ();
  }

  update_menu_elemento (data: any) {
    return this.afs.collection ('Menu_Elementos').doc (data.id).update (data);
  }

  delete_menu_elemento (data: any) {
    return this.afs.collection ('Menu_Elementos').doc (data.id).delete ();
  }

  // MENU CRUD
  get_menu_by_id (id: string) {
    return this.afs.collection ('Menus').doc (id).valueChanges ();
  }

  add_menu (data: any) {
    return this.afs.collection ('Menus').doc (data.id).set (data);
  }

  get_menus () {
    const collection = this.afs.collection ('Menus');

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_menu_elemento_by_id (data.elemento_menu_id).pipe (map (menu_elemento => Object.assign ({}, { data, menu_elemento })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  update_menu (data: any) {
    return this.afs.collection ('Menus').doc (data.id).update (data);
  }

  delete_menu (data: any) {
    return this.afs.collection ('Menus').doc (data.id).delete ();
  }

  // CEMPRESAS CRUD
  get_empresa_by_id (id: string) {
    return this.afs.collection ('Empresas').doc (id).valueChanges ();
  }

  add_empresa (data: any) {
    return this.afs.collection ('Empresas').doc (data.id).set (data);
  }

  get_empresas () {
    return this.afs.collection ('Empresas', ref => ref.orderBy ('orden')).valueChanges ();
  }

  update_empresa (data: any) {
    return this.afs.collection ('Empresas').doc (data.id).update (data);
  }

  delete_empresa (data: any) {
    return this.afs.collection ('Empresas').doc (data.id).delete ();
  }

  // CRUD EMPRESAS CARTAS
  get_carta_by_id (id: string) {
    return this.afs.collection ('Empresa_Cartas').doc (id).valueChanges ();
  }

  add_carta (data: any) {
    return this.afs.collection ('Empresa_Cartas').doc (data.id).set (data);
  }

  get_cartas () {
    return this.afs.collection ('Empresa_Cartas').valueChanges ();
  }

  get_cartas_by_empresa (id: string) {
    const collection = this.afs.collection ('Empresa_Cartas', ref => ref.where ('empresa_id', '==', id));

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          if (data.tipo === 'menu') {
            return data;
          } else {
            return this.get_platos_by_carta (id, data.id).pipe (map (platos => Object.assign ({}, { data, platos })));
          }
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  update_carta (data: any) {
    return this.afs.collection ('Empresa_Cartas').doc (data.id).update (data);
  }

  delete_carta (data: any) {
    return this.afs.collection ('Empresa_Cartas').doc (data.id).delete ();
  }

  // MENU DIA CRUD
  add_menu_dia (data: any) {
    return this.afs.collection ('Menus_Dia').doc (data.id).set (data);
  }

  get_menus_dia (empresa_id: string) {
    return this.afs.collection ('Menus_Dia', ref => ref.where ('empresa_id', '==', empresa_id)).valueChanges ();
  }

  delete_menu_dia (menu: any) {
    return this.afs.collection ('Menus_Dia').doc (menu.id).delete ();
  }

  // Empresas Insumo
  add_empresa_insumo (data: any) {
    return this.afs.collection ('Empresa_Insumos').doc (data.id).set (data);
  }

  get_empresa_insumos (empresa_id: string) {
    const collection = this.afs.collection ('Empresa_Insumos', ref => ref.where ('empresa_id', '==', empresa_id))

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_insumo_by_id (data.insumo_id).pipe (map (insumo => Object.assign ({}, { data, insumo })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_empresa_insumos_ventas (empresa_id: string) {
    return this.afs.collection ('Empresa_Insumos', ref => ref.where ('empresa_id', '==', empresa_id)).valueChanges ();
  }

  get_empresa_insumos_venta (empresa_id: string) {
    const collection = this.afs.collection ('Empresa_Insumos', ref => ref.where ('empresa_id', '==', empresa_id).where ('ofrecer_en_menu', '==', true))

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_insumo_by_id (data.insumo_id).pipe (map (insumo => Object.assign ({}, { data, insumo })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  async add_ingresos_insumo_empresa (list: any []) {
    let batch = this.afs.firestore.batch ();

    list.forEach ((i: any) => {
      batch.set (
        this.afs.collection ('Ingresos_Insumo_Empresa').doc (i.id).ref,
        i
      );
    });

    return await batch.commit ();
  }

  async add_ingresos_tieda_producto (list: any []) {
    let batch = this.afs.firestore.batch ();

    list.forEach ((i: any) => {
      batch.set (
        this.afs.collection ('Ingresos_Tienda_Producto').doc (this.createId ()).ref,
        i
      );
    });

    return await batch.commit ();
  }

  async add_venta_tieda_producto (list: any []) {
    let batch = this.afs.firestore.batch ();

    list.forEach ((i: any) => {
      batch.set (
        this.afs.collection ('Ventas_Tienda_Producto').doc (this.createId ()).ref,
        i
      );
    });

    return await batch.commit ();
  }

  get_pedidos_fecha (dia: string, mes: string, anio: string) {
    return this.afs.collection ('Ventas_Tienda_Producto', ref => ref.where ('anio', '==', anio).where ('mes', '==', mes).where ('dia', '==', dia)).valueChanges ();
  }

  update_empresa_insumo (data: any) {
    return this.afs.collection ('Empresa_Insumos').doc (data.id).update (data);
  }

  get_platos_by_carta (empresa_id: string, carta_id: string) {
    return this.afs.collection ('Platos', ref => ref.where ('empresa_id', '==', empresa_id).where ('carta_id', '==', carta_id)).valueChanges ();
  }

  get_all_platos () {
    return this.afs.collection ('Platos').valueChanges ();
  }

  async add_plato (data: any, list: any []) {
    let batch = this.afs.firestore.batch ();

    batch.set (
      this.afs.collection ('Platos').doc (data.id).ref,
      data
    );

    list.forEach ((plato: any) => {
      batch.set (
        this.afs.collection ('Plato_Insumos').doc (plato.id).ref,
        {
          id: plato.id,
          insumo_id: plato.insumo_id,
          plato_id: data.id,
          cantidad: plato.cantidad
        }
      );
    });

    return await batch.commit ();
  }

  get_plato_insumos_by_plato_id (id: string) {
    const collection = this.afs.collection ('Plato_Insumos', ref => ref.where ('plato_id', '==', id));

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_insumo_by_id (data.insumo_id).pipe (map (insumo => Object.assign ({}, { data, insumo })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  async update_plato (data: any, list: any [], list_old: any) {
    let batch = this.afs.firestore.batch ();

    batch.update (
      this.afs.collection ('Platos').doc (data.id).ref,
      data
    );

    list_old.forEach ((plato: any) => {
      batch.delete (this.afs.collection ('Plato_Insumos').doc (plato.id).ref);
    });

    console.log (list);
    list.forEach ((plato: any) => {
      batch.set (
        this.afs.collection ('Plato_Insumos').doc (plato.id).ref,
        {
          id: plato.id,
          insumo_id: plato.insumo_id,
          plato_id: data.id,
          cantidad: plato.cantidad
        }
      );
    });

    return await batch.commit ();
  }

  // CRUD USUARIOS
  get_usuario_by_id (id: string) {
    return this.afs.collection ('Usuarios').doc (id).valueChanges ();
  }

  add_usuario (data: any) {
    return this.afs.collection ('Usuarios').doc (data.id).set (data);
  }

  get_preferencias () {
    return this.afs.collection ('Preferencias').doc ('preferencias').valueChanges ();
  }

  update_preferencias (data: any) {
    return this.afs.collection ('Preferencias').doc ('preferencias').update (data);
  }

  async validar_admin_is_valid (email: string, password: string) {
    return await this.afs.collection ('Usuarios', ref =>  ref.where ('correo', '==', email).where ('password', '==', password).where ('tipo', '==', 0)).valueChanges ().pipe (first ()).toPromise ();
  }

  get_usuarios () {
    return this.afs.collection ('Usuarios', ref => ref.where ('tipo', '<', 2)).valueChanges ();
  }

  get_usuario_to_promise (id: string) {
    return this.afs.collection ('Usuarios').doc (id).valueChanges ().pipe (first ()).toPromise ();
  }

  get_usuarios_by_empresa (id: string) {
    return this.afs.collection ('Usuarios', ref => ref.where ('empresa_id', '==', id)).valueChanges ();
  }

  get_usuarios_by_tipo (tipo: number) {
    return this.afs.collection ('Usuarios', ref => ref.where ('tipo', '==', tipo)).valueChanges ();
  }

  update_usuario (data: any) {
    return this.afs.collection ('Usuarios').doc (data.id).update (data);
  }

  delete_usuario (data: any) {
    return this.afs.collection ('Usuarios').doc (data.id).delete ();
  }

  add_promocion (data: any) {
    return this.afs.collection ('Promociones').doc (data.id).set (data);
  }

  get_all_promociones () {
    return this.afs.collection ('Promociones', ref => ref.orderBy ('orden')).valueChanges ();
  }

  delete_promocion (data: any) {
    return this.afs.collection ('Promociones').doc (data.id).delete ();
  }

  get_pedidos () {
    let anio = moment ().format ('YYYY');
    let mes = moment ().format ('MM');
    let dia = moment ().format ('DD');
    return this.afs.collection ('Pedidos_Platos_Dia', ref => ref.where ('anio', '==', anio).where ('mes', '==', mes).where ('dia', '==', dia)).valueChanges ();
  }

  update_estado_pedidos (estado: number, pedido_id: string) {
    return this.afs.collection ('Pedidos_Platos_Dia').doc (pedido_id).update ({
      estado: estado
    });
  }

  async cancelar_pedido (data: any) {
    let batch = this.afs.firestore.batch ();

    batch.update (
      this.afs.collection ('Pedidos_Platos_Dia').doc (data.id).ref, {
        estado: 5,
        hora_cancelada: moment ().format ().toString ()
      }
    );

    batch.update (
      this.afs.collection ('Usuarios').doc (data.usuario_id).collection ('Pedidos').doc (data.id).ref, {
        estado: 5,
        hora_cancelada: moment ().format ().toString ()
      }
    );

    return await batch.commit ();
  }

  get_repartidores_libres () {
    // Repartidor estado
    // 0 - libre
    // 1 - Ocupado
    return this.afs.collection ('Usuarios', ref => ref.where ('tipo', '==', 1).where ('estado', '==', 0)).valueChanges ();
  }

  get_repartidores () {
    // Repartidor estado
    // 0 - libre
    // 1 - Ocupado
    return this.afs.collection ('Usuarios', ref => ref.where ('tipo', '==', 1)).valueChanges ();
  }

  async asignar_pedido_repartidor (repartidor: any, pedido: any) {
    let batch = this.afs.firestore.batch ();

    batch.set (
      this.afs.collection ('Usuarios').doc (repartidor.id).collection ('Pedidos_Asignados').doc (pedido.id).ref, {
        id: pedido.id,
        estado: 2,
        orden: -1,
        fecha_asignado: moment ().format ().toString ()
      }
    );

    // pedido = 0
    // en cocina = 1
    // listo_enviar = 2
    // en ruta = 3
    // entregado = 4
    // cancelado = 5
    // rechazado = 6

    batch.update (
      this.afs.collection ('Pedidos_Platos_Dia').doc (pedido.id).ref, {
        repartidor_id: repartidor.id,
        repartidor_nombre: repartidor.nombre,
        estado: 2
      }
    );

    return await batch.commit ();
  }

  async confirmar_recojo (data: any) {
    let batch = this.afs.firestore.batch ();

    batch.update (
      this.afs.collection ('Pedidos_Platos_Dia').doc (data.id).ref, {
        estado: 4,
        fecha_entrega: moment ().format ().toString ()
      }
    );

    batch.update (
      this.afs.collection ('Usuarios').doc (data.usuario_id).collection ('Pedidos').doc (data.id).ref, {
        estado: 4,
        fecha_entrega: moment ().format ().toString ()
      }
    );

    return await batch.commit ();
  }

  get_producto_by_id (id: string) {
    return this.afs.collection ('Tienda_Productos').doc (id).valueChanges ().pipe (first ()).toPromise ();
  }

  get_pos_data (id: string) {
    return this.afs.collection ('POS').doc (id).valueChanges ();
  }

  async add_post_data (data: any) {
    let batch = this.afs.firestore.batch ();

    batch.set (this.afs.collection ('POS').doc (data.id).ref, data);
    batch.set (this.afs.collection ('POS').doc (data.id).collection ('Cajeros').doc (data.cajero_actual.tmp_id).ref, data.cajero_actual);
    batch.set (this.afs.collection ('POS').doc (data.id).collection ('Instancias').doc (data.instancia_actual.tmp_id).ref, data.instancia_actual);

    return await batch.commit ();
  }

  async update_post_data (data: any) {
    let batch = this.afs.firestore.batch ();

    batch.update (this.afs.collection ('POS').doc (data.id).ref, data);
    batch.set (this.afs.collection ('POS').doc (data.id).collection ('Cajeros').doc (data.cajero_actual.tmp_id).ref, data.cajero_actual);

    return await batch.commit ();
  }

  async registrar_venta (caja: any, data: any) {
    let batch = this.afs.firestore.batch ();

    batch.set (this.afs.collection ('POS').doc (caja.id).collection ('Ventas').doc (data.id).ref, data);

    return await batch.commit ();
  }

  get_ventas_por_client_tmp (id: string, tmp_id: string) {
    return this.afs.collection ('POS').doc (id).collection ('Ventas', ref => ref.where ('cajero_tmp_id', '==', tmp_id)).valueChanges ().pipe (first ()).toPromise ();
  }

  get_ventas_total (id: string, tmp_id: string) {
    return this.afs.collection ('POS').doc (id).collection ('Ventas', ref => ref.where ('instancia_id', '==', tmp_id)).valueChanges ().pipe (first ()).toPromise ();
  }

  get_ventas_total_subscribe (id: string) {
    return this.afs.collection ('POS').doc (id).collection ('Ventas').valueChanges ();
  }

  get_cajeros_por_pos (id: string) {
    return this.afs.collection ('POS').doc (id).collection ('Cajeros').valueChanges ();
  }

  async cerrar_pos (data: any) {
    let batch = this.afs.firestore.batch ();

    batch.update (this.afs.collection ('POS').doc (data.id).ref, {
      instancia_actual: null,
      caja_abierta: false,
    });

    batch.update(this.afs.collection ('POS').doc (data.id).collection('Instancias').doc (data.instancia_actual.tmp_id).ref, {
      fecha_cierre: moment ().format ('L'),
      hora_cierre: moment ().format ('h:mm'),
    });

    return await batch.commit ();
  }

  get_instancias_by_pos (id: string) {
    return this.afs.collection ('POS').doc (id).collection ('Instancias').valueChanges ();
  }

  get_venta_by_pos (id: string, codigo: string) {
    return this.afs.collection ('POS').doc (id).collection ('Ventas').doc (codigo).valueChanges ();
  }

  add_nota_credito (data: any) {
    return this.afs.collection ('Notas_Credito').doc (data.id).set (data);
  }

  get_nota_credito (id: string) {
    return this.afs.collection ('Notas_Credito').doc (id).valueChanges ().pipe (first ()).toPromise ();
  }

  get_mesas_empresas (empresa_id: string) {
    return this.afs.collection ('Empresas').doc (empresa_id).collection ('Mesas', ref => ref.orderBy ('fecha_agregada')).valueChanges ();
  }

  delete_mesa (item: any) {
    return this.afs.collection ('Empresas').doc (item.empresa_id).collection ('Mesas').doc (item.id).delete ();
  }

  update_mesa (item: any) {
    return this.afs.collection ('Empresas').doc (item.empresa_id).collection ('Mesas').doc (item.id).update ({
      empresa_id: item.empresa_id,
      nombre: item.nombre
    });
  }

  add_mesa (item: any) {
    return this.afs.collection ('Empresas').doc (item.empresa_id).collection ('Mesas').doc (item.id).set (item);
  }

  get_restaurante_venta_data (id: string) {
    return this.afs.collection ('Empresas_POS').doc (id).valueChanges ();
  }

  async add_post_empresa_data (data: any) {
    let batch = this.afs.firestore.batch ();

    batch.set (this.afs.collection ('Empresas_POS').doc (data.id).ref, data);
    batch.set (this.afs.collection ('Empresas_POS').doc (data.id).collection ('Instancias').doc (data.instancia_actual.tmp_id).ref, data.instancia_actual);

    return await batch.commit ();
  }

  async cerrar_caja_post_empresa (data: any) {
    let batch = this.afs.firestore.batch ();

    batch.update (this.afs.collection ('Empresas_POS').doc (data.id).ref, {
      caja_abierta: false,
      instancia_actual: null
    });

    batch.update (this.afs.collection ('Empresas_POS').doc (data.id).collection ('Instancias').doc (data.instancia_actual.tmp_id).ref, {
      fecha_cierre: moment ().format ('L'),
      hora_cierre: moment ().format ('h:mm')
    });

    return await batch.commit ();
  }

  get_plato_by_id (id: string) {
    const collection = this.afs.collection('Platos').doc (id);
    return collection.snapshotChanges().map (refReferencia=>{
      const data:any = refReferencia.payload.data();
      data.id = refReferencia.payload.id;
      return this.get_insumos_by_plato (data.id).pipe (map (insumos => Object.assign({},{ insumos, data })));
    }).mergeMap (observables => {
      if (observables) {
        return combineLatest (observables);
      } else {
        return of([]);
      }
    });
  }

  get_insumos_by_plato (id: string) {
    return this.afs.collection ('Plato_Insumos', ref => ref.where ('plato_id', '==', id)).valueChanges ();
  }

  async registrar_restaurante_pedido (empresa_id: string, pedido: any) {
    let batch = this.afs.firestore.batch ();

    batch.set (this.afs.collection ('Restaurante_Pedidos').doc (pedido.id).ref, pedido);
    batch.update (this.afs.collection ('Empresas').doc (empresa_id).collection ('Mesas').doc (pedido.mesa_id).ref, {
      disponible: false,
      pedido_id: pedido.id,
      estado: 1
    });

    return await batch.commit ();
  }

  get_restaurante_pedido_by_id (id: string) {
    return this.afs.collection ('Restaurante_Pedidos').doc (id).valueChanges ().pipe (first ()).toPromise ();
  }

  update_restaurante_pedido (pedido: any) {
    return this.afs.collection ('Restaurante_Pedidos').doc (pedido.id).update (pedido);
  }

  async finalizar_restaurante_pedido (empresa_id: string, pedido: any) {
    let batch = this.afs.firestore.batch ();

    batch.update (this.afs.collection ('Restaurante_Pedidos').doc (pedido.id).ref, pedido);

    batch.set (this.afs.collection ('Restaurante_Pedidos_Anio_Mes').doc (pedido.anio + '_' + pedido.mes).collection ('Pedidos').doc (pedido.id).ref, {
      id: pedido.id,
      empresa_id: empresa_id,
      monto_total: pedido.monto_total
    });

    batch.update (this.afs.collection ('Empresas').doc (empresa_id).collection ('Mesas').doc (pedido.mesa_id).ref, {
      disponible: true,
      pedido_id: '',
      estado: 1
    });

    return await batch.commit ();
  }

  get_menu_dia_by_elemento_id (id: string, carta_id: string) {
    return this.afs.collection ('Menus_Dia', ref => ref.where ('elemento_menu_id', '==', id).where ('carta_id', '==', carta_id)).valueChanges ();
  }

  get_menu_elementos_by_carta (carta_id: string) {
    const collection = this.afs.collection ('Menu_Elementos', ref => ref.orderBy ('orden'));

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_menu_dia_by_elemento_id (data.id, carta_id).pipe (map (menus_dia => Object.assign ({}, { data, menus_dia })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_menus_dia_stock () {
    return this.afs.collection ('Menus_Dia').valueChanges ();
  }

  get_menus_elementos () {
    return this.afs.collection ('Menu_Elementos').valueChanges ();
  }

  get_promociones_by_carta (id: string) {
    const collection = this.afs.collection ('Promociones', ref => ref.where ('carta_id', '==', id));
    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data() as any;
          return this.get_promocion_by_id (data.id).pipe (map (promocion => Object.assign ({}, { ...promocion })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_promocion_by_id (id: string) {
    const collection = this.afs.collection ('Promociones').doc (id);
    return collection.snapshotChanges().map (async refReferencia=> {
      const data:any = refReferencia.payload.data ();
      data.id = refReferencia.payload.id;
      if (data.tipo === '0') {
        data.insumos = await this.get_insumos_by_plato (data.plato.id).pipe (first ()).toPromise ();
        return data
      } else {
        data.platos.forEach (async (element: any) => {
          element.insumos = await this.get_insumos_by_plato (element.id).pipe (first ()).toPromise ();
        });

        return data;
      }
    }).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_restaurante_ventas_instancia (id: string) {
    return this.afs.collection ('Restaurante_Pedidos', ref => ref.where ('tmp_id', '==', id)).valueChanges ().pipe (first ()).toPromise ();
  }

  get_instancias_por_restaurante_venta (id: string) {
    return this.afs.collection ('Empresas_POS').doc (id).collection ('Instancias').valueChanges ();
  }

  delete_plato (plato_id: string) {
    return this.afs.collection ('Platos').doc (plato_id).delete ();
  }

  async delete_carta_extra (id: string, platos: any [], promociones: any []) {
    let batch = this.afs.firestore.batch ();

    batch.delete (this.afs.collection ('Empresa_Cartas').doc (id).ref);

    platos.forEach ((plato: any) => {
      batch.delete (this.afs.collection ('Platos').doc (plato.id).ref);
    });

    return await batch.commit ();
  }

  async delete_carta_promocion (id: string, promociones: any []) {
    let batch = this.afs.firestore.batch ();

    batch.delete (this.afs.collection ('Empresa_Cartas').doc (id).ref);

    promociones.forEach ((promocion: any) => {
      batch.delete (this.afs.collection ('Promociones').doc (promocion.id).ref);
    });

    return await batch.commit ();
  }

  async delete_carta_menu (id: string, menus_dia: any []) {
    let batch = this.afs.firestore.batch ();

    batch.delete (this.afs.collection ('Empresa_Cartas').doc (id).ref);

    menus_dia.forEach ((menu_dia: any) => {
      batch.delete (this.afs.collection ('Menus_Dia').doc (menu_dia.id).ref);
    });

    return await batch.commit ();
  }

  // Registro por dia
  get_ingresos_insumo_empresa_dia (empresa_id: string, dia: string, mes: string, anio: string) {
    return this.afs.collection ('Ingresos_Insumo_Empresa', ref =>
      ref.where ('empresa_id', '==', empresa_id)
      .where ('mes', '==', mes)
      .where ('dia', '==', dia)
      .where ('anio', '==', anio)).valueChanges ();
  }

  get_pedidos_platos_dia_dia (empresa_id: string, dia: string, mes: string, anio: string) {
    return this.afs.collection ('Pedidos_Platos_Dia', ref =>
      ref.where ('empresas', 'array-contains', empresa_id)
      .where ('mes', '==', mes)
      .where ('dia', '==', dia)
      .where ('anio', '==', anio)).valueChanges ();
  }

  get_restaurante_pedidos_dia (empresa_id: string, dia: string, mes: string, anio: string) {
    return this.afs.collection ('Restaurante_Pedidos', ref =>
      ref.where ('empresa_id', '==', empresa_id)
      .where ('mes', '==', mes)
      .where ('dia', '==', dia)
      .where ('anio', '==', anio)).valueChanges ();
  }

  // Registros por mes
  get_ingresos_insumo_empresa_mes (empresa_id: string, mes: string, anio: string) {
    return this.afs.collection ('Ingresos_Insumo_Empresa', ref =>
      ref.where ('empresa_id', '==', empresa_id)
      .where ('mes', '==', mes)
      .where ('anio', '==', anio)).valueChanges ();
  }

  get_pedidos_platos_dia_mes (empresa_id: string, mes: string, anio: string) {
    return this.afs.collection ('Pedidos_Platos_Dia', ref =>
      ref.where ('empresas', 'array-contains', empresa_id)
      .where ('mes', '==', mes)
      .where ('anio', '==', anio)).valueChanges ();
  }

  get_restaurante_pedidos_mes (empresa_id: string, mes: string, anio: string) {
    return this.afs.collection ('Restaurante_Pedidos', ref =>
      ref.where ('empresa_id', '==', empresa_id)
      .where ('mes', '==', mes)
      .where ('anio', '==', anio)).valueChanges ();
  }

  // Registros por año
  get_ingresos_insumo_empresa_anio (empresa_id: string, anio: string) {
    return this.afs.collection ('Ingresos_Insumo_Empresa', ref =>
      ref.where ('empresa_id', '==', empresa_id)
      .where ('anio', '==', anio)).valueChanges ();
  }

  get_pedidos_platos_dia_anio (empresa_id: string, anio: string) {
    return this.afs.collection ('Pedidos_Platos_Dia', ref =>
      ref.where ('empresas', 'array-contains', empresa_id)
      .where ('anio', '==', anio)).valueChanges ();
  }

  get_restaurante_pedidos_anio (empresa_id: string, anio: string) {
    return this.afs.collection ('Restaurante_Pedidos', ref =>
      ref.where ('empresa_id', '==', empresa_id)
      .where ('anio', '==', anio)).valueChanges ();
  }
}
