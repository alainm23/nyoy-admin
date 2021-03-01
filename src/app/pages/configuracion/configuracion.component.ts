import { Component, OnInit } from '@angular/core';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  loading: boolean = true;
  form: FormGroup;
  constructor (private database: DatabaseService, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.form = new FormGroup ({
      delivery_limite: new FormControl ('', [Validators.required]),
      delivery_precio: new FormControl ('', [Validators.required]),
      local_latitud: new FormControl ('', [Validators.required]),
      local_longitud: new FormControl ('', [Validators.required])
    });

    this.database.get_preferencias ().subscribe ((res: any) => {
      this.form.patchValue (res);
      this.loading = false;
    });
  }

  guardar () {
    this.loading = true;
    this.database.update_preferencias (this.form.value)
      .then (() => {
        this.loading = false;
        this.toastrService.show ('Guardado');
      })
      .catch ((error: any) => {
        this.loading = false;
      });
  }
}
