import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import algoliasearch from 'algoliasearch';

import * as express from 'express';
import * as bodyParser from "body-parser";
const cors = require ('cors');

admin.initializeApp ();
const db = admin.firestore ();
const storage = admin.storage ();
const env = functions.config ();

// Initialize the Algolia Client
const client = algoliasearch (env.algolia.appid, env.algolia.apikey);
const index = client.initIndex ('Productos');

// Express
const app = express ();
app.use (cors ({ origin: true }));

const main = express ();

main.use ('/api/v1', app);
main.use (bodyParser.json()); // support json encoded bodies
main.use (bodyParser.urlencoded({ extended: true })); // support encoded bodies

export const webApi = functions.https.onRequest (main);

// REST API
app.get ('/eliminar-menus-dia', async (req, res) => {
  try {
    var promises: any [] = [];

    db.collection ('Menus_Dia').get ().then ((qs) => {
      qs.forEach ((docSnapshot) => {
        promises.push (docSnapshot.ref.delete ());
      });

      return Promise.all (promises).then (() => {
        res.status (200).send ('Menus dia eliminados');
      });
    }).catch ((error => {
      console.log (error);
    }));
  } catch (error) {
    res.status (400).send ('Error');
  }
});

exports.createUser = functions.firestore.document ('Usuarios/{user}').onCreate ((snapshot: any, context: any) => {
  const id = snapshot.data ().id;
  const email = snapshot.data ().correo;
  const password = snapshot.data ().password;

  return admin.auth().createUser({
    uid: id,
    email: email,
    password: password
  });
});

exports.ingresos_insumo_empresa_agregado = functions.firestore.document ('Ingresos_Insumo_Empresa/{id}').onCreate (async (snapshot: any, context: any) => {
  const data = snapshot.data ();
  const batch = db.batch ();

  const collection = await db.collection ('Empresa_Insumos')
    .where ('insumo_id', '==', data.insumo_id)
    .where ('empresa_id', '==', data.empresa_id).get ();

  if (collection.size <= 0) {
    const id = admin.database ().ref ().push ().key;
    // Creamos la el nuevo documento
    let object: any = {
      id: id,
      empresa_id: data.empresa_id,
      insumo_id: data.insumo_id,
      stock: data.cantidad,
      ofrecer_en_menu: false
    };

    let object_inside: any = {};
    object_inside ['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
    object_inside ['monto_vendido_' + moment (data.fecha).format ('MM')] = 0;
    object_inside ['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
    object_inside ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = 0;

    object ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside;

    batch.set (
      db.collection ('Empresa_Insumos').doc (object.id),
      object
    );

    return await batch.commit ().then (() => {
      return db.runTransaction((t: any) => {
        return t.get (db.collection ('Empresas').doc (data.empresa_id)).then ((doc: any) => {
          const update = doc.data ();

          if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
            let object_inside_: any = {};
            object_inside_ ['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
            object_inside_ ['monto_vendido_' + moment (data.fecha).format ('MM')] = 0;
            object_inside_ ['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
            object_inside_ ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = 0;

            update ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside_;
          } else {
            if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] === undefined) {
              update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
            } else {
              let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')];
              update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] = old_cantidad + (data.cantidad * data.precio);
            }

            if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] === undefined) {
              update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
            } else {
              let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')];
              update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] = old_cantidad + data.cantidad;
            }
          }

          t.update (db.collection ('Empresas').doc (data.empresa_id), update);
        });
      });
    });
  } else {
    return db.runTransaction ((t: any) => {
      return t.get (db.collection ('Empresas').doc (data.empresa_id)).then ((doc: any) => {
        const update = doc.data ();

        if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
          let object_inside: any = {};
          object_inside ['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
          object_inside ['monto_vendido_' + moment (data.fecha).format ('MM')] = 0;
          object_inside ['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
          object_inside ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = 0;

          update ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside;
        } else {
          if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] === undefined) {
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
          } else {
            let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')];
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] = old_cantidad + (data.cantidad * data.precio);
          }

          if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] === undefined) {
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
          } else {
            let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')];
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] = old_cantidad + data.cantidad;
          }
        }

        t.update (db.collection ('Empresas').doc (data.empresa_id), update);
      });
    }).then (() => {
      return db.runTransaction((t: any) => {
        return t.get (db.collection ('Empresa_Insumos').doc (collection.docs [0].data ().id)).then ((doc: any) => {
          const update = doc.data ();
          update.stock = update.stock + data.cantidad;

          if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
            let object_inside_: any = {};
            object_inside_ ['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
            object_inside_ ['monto_vendido_' + moment (data.fecha).format ('MM')] = 0;
            object_inside_ ['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
            object_inside_ ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = 0;

            update ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside_;
          } else {
            if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] === undefined) {
              update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
            } else {
              let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')];
              update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] = old_cantidad + (data.cantidad * data.precio);
            }

            if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] === undefined) {
              update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
            } else {
              let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')];
              update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] = old_cantidad + data.cantidad;
            }
          }

          t.update (db.collection ('Empresa_Insumos').doc (collection.docs [0].data ().id), update);
        });
      });
    });
  }
});

exports.ingresos_tienda_producto_agregado = functions.firestore.document ('Ingresos_Tienda_Producto/{id}').onCreate (async (snapshot: any, context: any) => {
  const data = snapshot.data ();
  const ref = db.collection ('Tienda_Productos').doc (data.id);

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const update = doc.data ();
      update.stock = update.stock + data.cantidad;

      if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
        let object_inside: any = {};
        object_inside ['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
        object_inside ['monto_vendido_' + moment (data.fecha).format ('MM')] = 0;
        object_inside ['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
        object_inside ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = 0;

        update ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside;
      } else {
        if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] === undefined) {
          update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
        } else {
          let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')];
          update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_comprado_' + moment (data.fecha).format ('MM')] = old_cantidad + (data.cantidad * data.precio);
        }

        if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] === undefined) {
          update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] = data.cantidad;
        } else {
          let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')];
          update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_comprada_' + moment (data.fecha).format ('MM')] = old_cantidad + data.cantidad;
        }
      }

      t.update (ref, update);
    });
  });
});

exports.venta_pos = functions.firestore.document ('POS/{pos_id}/Ventas/{id}').onCreate (async (snapshot: any, context: any) => {
  const data: any = snapshot.data ();
  console.log ('data', data);

  data.productos.forEach ((producto: any) => {
    console.log ('producto', producto);

    return db.runTransaction ((t: any) => {
      return t.get (db.collection ('Tienda_Productos').doc (producto.id)).then ((doc: any) => {
        const update = doc.data ();

        update.stock -= data.cantidad;

        if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
          let object_inside: any = {};
          object_inside ['monto_vendido_' + moment (data.fecha).format ('MM')] = producto.cantidad * producto.precio;
          object_inside ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = producto.cantidad;

          update ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside;
        } else {
          if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] === undefined) {
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] = data.cantidad * data.precio;
          } else {
            let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')];
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] = old_cantidad + (data.cantidad * data.precio);
          }

          if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] === undefined) {
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] = data.cantidad;
          } else {
            let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')];
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] = old_cantidad + data.cantidad;
          }
        }

        t.update (db.collection ('Tienda_Productos').doc (data.id), update);
      })
    });
  });
});

exports.menu_dia_agregado = functions.firestore.document ('Menus_Dia/{id}').onCreate (async (snapshot: any, context: any) => {
  const data = snapshot.data ();

  if (data.tipo === 'menu') {
    const ref = db.collection ('Menus').doc (data.menu_id);

    return db.runTransaction((t: any) => {
      return t.get (ref).then ((doc: any) => {
        const update = doc.data ();

        if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
          update ['resumen_' + moment (data.fecha).format ('YYYY')] = {};
          update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')] = data.stock;
        } else {
          if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')] === undefined) {
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')] = data.stock;
          } else {
            let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')];
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')] = old_cantidad + data.stock;
          }
        }

        t.update (ref, update);
      });
    });
  }
});

exports.menu_dia_eliminado = functions.firestore.document ('Menus_Dia/{id}').onDelete (async (snapshot: any, context: any) => {
  const data = snapshot.data ();

  if (data.tipo === 'menu') {
    const ref = db.collection ('Menus').doc (data.menu_id);

    return db.runTransaction((t: any) => {
      return t.get (ref).then ((doc: any) => {
        const update = doc.data ();

        if (update ['resumen_' + moment (data.fecha).format ('YYYY')] !== undefined) {
          if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')] === undefined) {
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')] = data.stock;
          } else {
            let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')];
            update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_preparaciones_' + moment (data.fecha).format ('MM')] = old_cantidad - data.stock;
          }
        }

        t.update (ref, update);
      });
    });
  }
});

exports.pedidos_platos_dia = functions.firestore.document ('Pedidos_Platos_Dia/{id}').onCreate (async (snapshot: any, context: any) => {
  const data = snapshot.data ();

  data.platos.forEach (async (element: any) => {
    if (element.tipo === 'menu') {
      return registrar_estadisticas_menu (element);
    } else if (element.tipo === 'extra') {
      // Estadisticas de empresa
      return registrar_estadisticas_extra (element);
    } else if (element.tipo === 'promocion') {
      return db.runTransaction ((t: any) => {
        return t.get (db.collection ('Empresas').doc (element.empresa_id)).then ((doc: any) => {
          const update = doc.data ();

          if (update ['resumen_' + moment ().format ('YYYY')] === undefined) {
            update ['resumen_' + moment ().format ('YYYY')] = {};
            update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio;
          } else {
            if (update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] === undefined) {
              update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio;
            } else {
              const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')];
              update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = old_cantidad + element.precio;
            }
          }

          t.update (db.collection ('Empresas').doc (element.empresa_id), update);
        });
      }).then (() => {
        return db.runTransaction ((t: any) => {
          return t.get (db.collection ('Empresa_Cartas').doc (element.carta_id)).then ((doc: any) => {
            const update = doc.data ();

            if (update ['resumen_' + moment ().format ('YYYY')] === undefined) {
              update ['resumen_' + moment ().format ('YYYY')] = {};
              update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio;
            } else {
              if (update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] === undefined) {
                update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio;
              } else {
                const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')];
                update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = old_cantidad + element.precio;
              }
            }

            t.update (db.collection ('Empresa_Cartas').doc (element.carta_id), update);
          });
        }).then (async () => {
          if (element.promocion_tipo === '0') {
            // Disminuimos el stock de cada plato
            // Obtenemos todos los inusmos de del plato
            const insumos = await db.collection ('Plato_Insumos').where ('plato_id', '==', element.plato_id).get ();
            insumos.docs.forEach (async (insumo: any) => {
              const ref = await db.collection ('Empresa_Insumos').where ('empresa_id', '==', element.empresa_id).where ('insumo_id', '==', insumo.data ().insumo_id).get ();
              return db.runTransaction (async (t: any) => {
                return t.get (db.collection ('Empresa_Insumos').doc (ref.docs [0].id)).then ((doc: any) => {

                  const update = doc.data ();
                  update.stock -= insumo.data ().cantidad * element.cantidad

                  t.update (db.collection ('Empresa_Insumos').doc (ref.docs [0].id), update);
                });
              });
            });
          } else {
            element.platos.forEach (async (plato: any) => {
              if (plato.tipo === 'plato') {
                const insumos = await db.collection ('Plato_Insumos').where ('plato_id', '==', plato.id).get ();
                insumos.docs.forEach (async (insumo: any) => {
                  const ref = await db.collection ('Empresa_Insumos').where ('empresa_id', '==', plato.empresa_id).where ('insumo_id', '==', insumo.data ().insumo_id).get ();
                  return db.runTransaction (async (t: any) => {
                    return t.get (db.collection ('Empresa_Insumos').doc (ref.docs [0].id)).then ((doc: any) => {

                      const update = doc.data ();
                      update.stock -= insumo.data ().cantidad * element.cantidad

                      t.update (db.collection ('Empresa_Insumos').doc (ref.docs [0].id), update);
                    });
                  });
                });
              } else {
                const ref = await db.collection ('Empresa_Insumos').where ('empresa_id', '==', plato.empresa_id).where ('insumo_id', '==', plato.id).get ();
                return db.runTransaction (async (t: any) => {
                  return t.get (db.collection ('Empresa_Insumos').doc (ref.docs [0].id)).then ((doc: any) => {

                    const update = doc.data ();
                    update.stock -= element.cantidad

                    t.update (db.collection ('Empresa_Insumos').doc (ref.docs [0].id), update);
                  });
                });
              }
            });
          }
        });
      });
    } else if (element.tipo === 'tienda') {
      element.productos.forEach (async (producto: any) => {
        return db.runTransaction ((t: any) => {
          return t.get (db.collection ('Tienda_Productos').doc (producto.id)).then ((doc: any) => {
            const update = doc.data ();

            update.stock -= producto.cantidad;

            if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
              let object_inside: any = {};
              object_inside ['monto_vendido_' + moment (data.fecha).format ('MM')] = producto.cantidad * producto.precio;
              object_inside ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = producto.cantidad;

              update ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside;
            } else {
              if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] === undefined) {
                update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] = producto.cantidad * producto.precio;
              } else {
                let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')];
                update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] = old_cantidad + (producto.cantidad * producto.precio);
              }

              if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] === undefined) {
                update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] = producto.cantidad;
              } else {
                let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')];
                update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] = old_cantidad + producto.cantidad;
              }
            }

            t.update (db.collection ('Tienda_Productos').doc (producto.id), update);
          });
        }).then (() => {
          return db.runTransaction ((t: any) => {
            return t.get (db.collection ('Tienda_Categorias').doc (producto.categoria_id)).then ((doc: any) => {
              const update = doc.data ();

              if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
                let object_inside: any = {};
                object_inside ['monto_vendido_' + moment (data.fecha).format ('MM')] = producto.cantidad * producto.precio;
                object_inside ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = producto.cantidad;

                update ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside;
              } else {
                if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] === undefined) {
                  update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] = producto.cantidad * producto.precio;
                } else {
                  let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')];
                  update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] = old_cantidad + (producto.cantidad * producto.precio);
                }

                if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] === undefined) {
                  update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] = producto.cantidad;
                } else {
                  let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')];
                  update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] = old_cantidad + producto.cantidad;
                }
              }

              t.update (db.collection ('Tienda_Categorias').doc (producto.categoria_id), update);
            });
          }).then (() => {
            if (producto.marca_id !== '') {
              return db.runTransaction ((t: any) => {
                return t.get (db.collection ('Tienda_Marcas').doc (producto.marca_id)).then ((doc: any) => {
                  const update = doc.data ();

                  if (update ['resumen_' + moment (data.fecha).format ('YYYY')] === undefined) {
                    let object_inside: any = {};
                    object_inside ['monto_vendido_' + moment (data.fecha).format ('MM')] = producto.cantidad * producto.precio;
                    object_inside ['cantidad_vendida_' + moment (data.fecha).format ('MM')] = producto.cantidad;

                    update ['resumen_' + moment (data.fecha).format ('YYYY')] = object_inside;
                  } else {
                    if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] === undefined) {
                      update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] = producto.cantidad * producto.precio;
                    } else {
                      let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')];
                      update ['resumen_' + moment (data.fecha).format ('YYYY')]['monto_vendido_' + moment (data.fecha).format ('MM')] = old_cantidad + (producto.cantidad * producto.precio);
                    }

                    if (update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] === undefined) {
                      update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] = producto.cantidad;
                    } else {
                      let old_cantidad: number = update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')];
                      update ['resumen_' + moment (data.fecha).format ('YYYY')]['cantidad_vendida_' + moment (data.fecha).format ('MM')] = old_cantidad + producto.cantidad;
                    }
                  }

                  t.update (db.collection ('Tienda_Marcas').doc (producto.marca_id), update);
                });
              });
            }

            return 0;
          })
        });
      });
    }
  });

  return 0;
});

// Eliminar imagen storage Platos, Cartas y Empresas
exports.eliminar_imagen_plato = functions.firestore.document ('Platos/{id}').onDelete (async (snapshot: any, context: any) => {
  const data = snapshot.data ();

  return storage.bucket ().file ('Platos/' + data.id).delete ().then (() => {
    console.log(`Successfully deleted photo with UID: ${data.id}, plato: ${data.nombre}`);
  }).catch ((error: any) => {
    console.log(`Failed to remove photo, error: ${error}`);
  });
});

exports.eliminar_imagen_empresa = functions.firestore.document ('Empresas/{id}').onDelete (async (snapshot: any, context: any) => {
  const data = snapshot.data ();

  return storage.bucket ().file ('Empresas/' + data.id).delete ().then (() => {
    console.log(`Successfully deleted photo with UID: ${data.id}, empresa: ${data.nombre}`);
  }).catch ((error: any) => {
    console.log(`Failed to remove photo, error: ${error}`);
  });
});

exports.eliminar_imagen_menu = functions.firestore.document ('Empresa_Cartas/{id}').onDelete (async (snapshot: any, context: any) => {
  const data = snapshot.data ();

  return storage.bucket ().file ('Menus/' + data.id).delete ().then (() => {
    console.log(`Successfully deleted photo with UID: ${data.id}`);
  }).catch ((error: any) => {
    console.log(`Failed to remove photo, error: ${error}`);
  });
});

exports.eliminar_imagen_combo = functions.firestore.document ('Promociones/{id}').onDelete (async (snapshot: any, context: any) => {
  const data = snapshot.data ();

  return storage.bucket ().file ('Combos/' + data.id).delete ().then (() => {
    console.log(`Successfully deleted photo with UID: ${data.id}`);
  }).catch ((error: any) => {
    console.log(`Failed to remove photo, error: ${error}`);
  });
});

// Restaurante Ventas
exports.registrar_restaurante_pedido = functions.firestore.document ('Restaurante_Pedidos/{id}').onCreate (async (snapshot: any, context: any) => {
  const data: any = snapshot.data ();

  // Descontar insumos y platos
  data.platos.forEach (async (element: any) => {
    if (element.tipo === 'menu-completo') {
      return registrar_estadisticas_menu (element);
    } else if (element.tipo === 'menu') {
      return registrar_estadisticas_menu ({ menus: [element] });
    } else if (element.tipo === 'plato') {
      return registrar_estadisticas_extra (element);
    }
  });

  return 0;
});

exports.update_restaurante_pedido = functions.firestore.document ('Restaurante_Pedidos/{id}').onUpdate (async (snapshot: any, context: any) => {
  const data_before: any = snapshot.before.data ();
  const data_after: any = snapshot.after.data ();

  const platos_antes: any [] = data_before.platos;
  const platos_despues: any [] = data_after.platos;
  const map: Map <string, any> = new Map <string, any> ();

  platos_antes.forEach ((e: any) => {
    if (!map.has (e.id)) {
      map.set (e.id, e);
    }
  });

  platos_despues.forEach ((e: any) => {
    if (map.has (e.id)) {
      let a = map.get (e.id);
      if (a.cantidad !== e.cantidad) {
        e.cantidad = e.cantidad - a.cantidad;
      } else {
        e.cantidad = 0;
      }
    }
  });

  platos_antes.forEach ((e: any) => {
    if (platos_despues.find (x => x.id === e.id) === undefined) {
      e.cantidad = e.cantidad * -1;
      platos_despues.push (e);
    }
  });

  platos_despues.forEach (async (element: any) => {
    if (element.tipo === 'menu-completo') {
      return registrar_estadisticas_menu (element);
    } else if (element.tipo === 'menu') {
      return registrar_estadisticas_menu ({ menus: [element] });
    } else if (element.tipo === 'plato') {
      return registrar_estadisticas_extra (element);
    }
  });

  return 0;
});

// Fuctions
function registrar_estadisticas_extra (element: any) {
  return db.runTransaction ((t: any) => {
    return t.get (db.collection ('Empresas').doc (element.empresa_id)).then ((doc: any) => {
      const update = doc.data ();

      if (update ['resumen_' + moment ().format ('YYYY')] === undefined) {
        update ['resumen_' + moment ().format ('YYYY')] = {};
        update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio * element.cantidad;
        update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = element.cantidad;
      } else {
        if (update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] === undefined) {
          update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio * element.cantidad;
        } else {
          const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')];
          update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = old_cantidad + (element.precio * element.cantidad);
        }

        if (update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] === undefined) {
          update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = element.cantidad;
        } else {
          const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')];
          update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = old_cantidad + element.cantidad;
        }
      }

      t.update (db.collection ('Empresas').doc (element.empresa_id), update);
    });
  }).then (() => {
    return db.runTransaction ((t: any) => {
      return t.get (db.collection ('Empresa_Cartas').doc (element.carta_id)).then ((doc: any) => {
        const update = doc.data ();

        if (update ['resumen_' + moment ().format ('YYYY')] === undefined) {
          update ['resumen_' + moment ().format ('YYYY')] = {};
          update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio * element.cantidad;
          update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = element.cantidad;
        } else {
          if (update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] === undefined) {
            update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio * element.cantidad;
          } else {
            const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')];
            update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = old_cantidad + (element.precio * element.cantidad);
          }

          if (update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] === undefined) {
            update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = element.cantidad;
          } else {
            const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')];
            update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = old_cantidad + element.cantidad;
          }
        }

        t.update (db.collection ('Empresa_Cartas').doc (element.carta_id), update);
      });
    }).then (() => {
      return db.runTransaction ((t: any) => {
        return t.get (db.collection ('Platos').doc (element.plato_id)).then ((doc: any) => {
          const update = doc.data ();

          if (update ['resumen_' + moment ().format ('YYYY')] === undefined) {
            update ['resumen_' + moment ().format ('YYYY')] = {};
            update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio * element.cantidad;
            update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = element.cantidad;
          } else {
            if (update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] === undefined) {
              update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio * element.cantidad;
            } else {
              const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')];
              update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = old_cantidad + (element.precio * element.cantidad);
            }

            if (update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] === undefined) {
              update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = element.cantidad;
            } else {
              const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')];
              update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = old_cantidad + element.cantidad;
            }
          }

          t.update (db.collection ('Platos').doc (element.plato_id), update);
        });
      }).then (async () => {
        // Disminuimos el stock de cada plato
        // Obtenemos todos los inusmos de del plato
        const insumos = await db.collection ('Plato_Insumos').where ('plato_id', '==', element.plato_id).get ();
        insumos.docs.forEach (async (insumo: any) => {
          const ref = await db.collection ('Empresa_Insumos').where ('empresa_id', '==', element.empresa_id).where ('insumo_id', '==', insumo.data ().insumo_id).get ();
          return db.runTransaction (async (t: any) => {
            return t.get (db.collection ('Empresa_Insumos').doc (ref.docs [0].id)).then ((doc: any) => {

              const update = doc.data ();
              update.stock -= insumo.data ().cantidad * element.cantidad;

              t.update (db.collection ('Empresa_Insumos').doc (ref.docs [0].id), update);
            });
          });
        });

        if (element.extras !== undefined && element.extras !== null) {
          element.extras.forEach (async (extra: any) => {
            return db.runTransaction (async (t: any) => {
              let ref = await db.collection ('Empresa_Insumos').where ('empresa_id', '==', element.empresa_id).where ('insumo_id', '==', extra.id).get ();
              return t.get (db.collection ('Empresa_Insumos').doc (ref.docs [0].id)).then ((doc: any) => {
                const update = doc.data ();

                update.stock -= extra.cantidad;

                t.update (db.collection ('Empresa_Insumos').doc (ref.docs [0].id), update);
              });
            });
          });
        }
      });
    });
  });
}

function registrar_estadisticas_menu (element: any) {
  // Disminuir el stock de cada menu dia
  element.menus.forEach (async (menu: any) => {
    return db.runTransaction((t: any) => {
      return t.get (db.collection ('Menus_Dia').doc (menu.id)).then ((doc: any) => {
        const update = doc.data ();
        update.stock -= menu.cantidad;
        t.update (db.collection ('Menus_Dia').doc (menu.id), update);
      });
    }).then (async () => {
      // Actualizar las estadisticas del menu
      const menu_dia: any = (await db.collection ('Menus_Dia').doc (menu.id).get ()).data ();
      return db.runTransaction((t: any) => {
        return t.get (db.collection ('Menus').doc (menu_dia.menu_id)).then ((doc: any) => {
          const update = doc.data ();

          if (update ['resumen_' + moment ().format ('YYYY')] === undefined) {
            update ['resumen_' + moment ().format ('YYYY')] = {};
            update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = menu_dia.precio * menu.cantidad;
            update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = menu.cantidad;
          } else {
            if (update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] === undefined) {
              update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = menu_dia.precio * menu.cantidad;
            } else {
              const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')];
              update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = old_cantidad + (menu_dia.precio * menu.cantidad);
            }

            if (update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] === undefined) {
              update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = menu.cantidad;
            } else {
              const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')];
              update ['resumen_' + moment ().format ('YYYY')]['cantidad_vendida_' + moment ().format ('MM')] = old_cantidad + menu.cantidad;
            }
          }

          t.update (db.collection ('Menus').doc (menu_dia.menu_id), update);
        });
      })
    });
  });

  // Estadistias de empresas, actualizar la cantidad comprada y monto en el mes y año
  return db.runTransaction ((t: any) => {
    return t.get (db.collection ('Empresas').doc (element.empresa_id)).then ((doc: any) => {
      const update = doc.data ();

      if (update ['resumen_' + moment ().format ('YYYY')] === undefined) {
        update ['resumen_' + moment ().format ('YYYY')] = {};
        update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio;
      } else {
        if (update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] === undefined) {
          update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio;
        } else {
          const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')];
          update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = old_cantidad + element.precio;
        }
      }

      t.update (db.collection ('Empresas').doc (element.empresa_id), update);
    });
  }).then (async () => {
    // Estadistias de carta, actualizar la cantidad comprada y monto en el mes y año
    return db.runTransaction ((t: any) => {
      return t.get (db.collection ('Empresa_Cartas').doc (element.carta_id)).then ((doc: any) => {
        const update = doc.data ();

        if (update ['resumen_' + moment ().format ('YYYY')] === undefined) {
          update ['resumen_' + moment ().format ('YYYY')] = {};
          update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio;
        } else {
          if (update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] === undefined) {
            update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = element.precio;
          } else {
            const old_cantidad: number = update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')];
            update ['resumen_' + moment ().format ('YYYY')]['monto_vendido_' + moment ().format ('MM')] = old_cantidad + element.precio;
          }
        }

        t.update (db.collection ('Empresa_Cartas').doc (element.carta_id), update);
      });
    });
  });
}

// Algolia
exports.add_tienda_producto = functions.firestore.document ('Tienda_Productos/{id}').onCreate (async (snapshot: any, context: any) => {
  const data: any = {
    'nombre': snapshot.data ().nombre,
    'sku': snapshot.data ().sku,
    'imagen': snapshot.data ().imagen,
    'id': snapshot.id
  };

  const objectID = snapshot.id;
  return index.saveObject ({
    objectID,
    ...data
  });
});

exports.update_tienda_producto = functions.firestore.document ('Tienda_Productos/{id}').onUpdate (async (snapshot: any, context: any) => {
  const data: any = {
    'nombre': snapshot.after.data ().nombre,
    'sku': snapshot.after.data ().sku,
    'imagen': snapshot.after.data ().imagen,
    'id': snapshot.after.id
  };

  const objectID = snapshot.after.id;
  return index.saveObject ({
    objectID,
    ...data
  });
});

exports.delete_tienda_producto = functions.firestore.document ('Tienda_Productos/{id}').onDelete (async (snapshot: any, context: any) => {
  return index.deleteObject (snapshot.id);
});
