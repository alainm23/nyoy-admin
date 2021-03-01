import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { NotificationService } from '../../services/notification.service';
import { NbDialogService } from '@nebular/theme';
import * as moment from 'moment';

@Component({
  selector: 'ngx-pedidos-historial',
  templateUrl: './pedidos-historial.component.html',
  styleUrls: ['./pedidos-historial.component.scss']
})
export class PedidosHistorialComponent implements OnInit {
  items: any [] = [];
  empresas: any [] = [];
  repartidores: any [] = [];
  repartidor_seleccionado: any = null;
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private noti: NotificationService
  ) { }

  ngOnInit(): void {
    this.database.get_empresas ().subscribe ((res: any) => {
      this.empresas = res;
      console.log (res);
    });

    this.database.get_pedidos ().subscribe ((res: any [])=> {
      this.items = res;
    });

    this.database.get_repartidores ().subscribe ((res: any [])=> {
      this.repartidores = res;
      console.log (res);
    });
  }

  ver_pedido (dialog: any, item: any) {
    console.log (item);
    this.dialogService.open (dialog, { context: item });
  }

  cal_tiempo_entrega (item: any) {
    let a = moment (item.hora_entrega);
    let b = moment (item.fecha);
    return a.diff (b, 'minute');
  }

  get_empresa (empresa_id: string) {
    if (empresa_id === '') {
      return '';
    }

    let returned: string = this.empresas.find (x => x.id === empresa_id).nombre;
    if (returned === undefined) {
      returned = '';
    }

    return returned;
  }

  get_platos (filter: number) {
    return this.items.filter ((x: any) => {
      return x.estado === filter;
    });
  }

  get_format_date (fecha: string) {
    return moment (fecha).format ('hh:mm a');
  }

  update_estado (estado: number, data: any, dialog: any) {
    if (confirm ('¿Confimar operacion?')) {
      if (estado === 2) {
        if (data.tipo_pedido === 'delivery') {
          if (this.repartidor_seleccionado !== null) {
            const push_data: any = {
              titulo: 'Pedido asignado',
              detalle: 'Se le a asignado un nuevo pedido',
              mode: 'tokens',
              tokens: this.repartidor_seleccionado.token_id,
              clave: data.id
            };

            this.database.asignar_pedido_repartidor (this.repartidor_seleccionado, data)
              .then (() => {
                this.repartidor_seleccionado = null;
                dialog.close ();

                this.noti.send_notification (push_data).subscribe (response => {
                }, error => {
                });
              })
              .catch ((error: any) => {
                console.log (error);
                this.repartidor_seleccionado = null;
                dialog.close ();
              });
          }
        } else {
          console.log (data);
          const push_data: any = {
            titulo: 'Pedido actualizado',
            detalle: 'Ya puede venir a recoger su pedido',
            mode: 'tokens',
            tokens: data.usuario_token,
            clave: data.id
          };

          this.database.update_estado_pedidos (estado, data.id)
            .then (() => {
              dialog.close ();
              this.noti.send_notification (push_data).subscribe (response => {
              }, error => {
              });
            })
            .catch ((error: any) => {
              dialog.close ();
            });
        }
      } else {
        this.database.update_estado_pedidos (estado, data.id)
          .then (() => {
            dialog.close ();
          })
          .catch ((error: any) => {
            dialog.close ();
          });
      }
    }
  }

  cancelar_pedido (data: any, dialog: any) {
    console.log (data);
    if (confirm ('¿Confimar operacion?')) {
      this.database.cancelar_pedido (data)
        .then (() => {
          dialog.close ();
        })
        .catch ((error: any) => {
          dialog.close ();
        });
    }
  }

  entregar_pedido (data: any, dialog: any) {
    console.log (data);
    if (confirm ('¿Confimar operacion?')) {
      this.database.confirmar_recojo (data)
        .then (() => {
          dialog.close ();
        })
        .catch ((error: any) => {
          dialog.close ();
        });
    }
  }

  get_format (fecha: string) {
    return moment (fecha).format ('hh:mm:ss a');
  }
}
