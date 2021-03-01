import { Component, OnInit } from '@angular/core';

// Services
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;

  deviceInfo: any;
  constructor(public auth: AuthService,
              public database: DatabaseService,
              public router: Router) { }

  ngOnInit() {
    this.form = new FormGroup ({
      email: new FormControl ('', [Validators.required, Validators.email]),
      password: new FormControl ('', Validators.required)
    });
  }

  submit () {
    if (this.loading === false) {
      this.loading = true;

    this.auth.signInWithEmailAndPassword (this.form.value.email, this.form.value.password)
      .then (async (user: firebase.auth.UserCredential) => {
        let usuario: any = await this.database.get_usuario_to_promise (user.user.uid);
        if (usuario.tipo <= 0 && usuario.habilitado === true) {
          this.go_page (usuario.tipo);
        } else {
          this.loading = false;
          this.auth.signOut ();
          alert ("Su usuario no tiene los privilegios para ingresar, contactese con el administrador.")
        }
      }).catch ((error: any) => {
        this.loading = false;
        let errorMessage: string = "";

        if (error.code == "auth/network-request-failed") {
          errorMessage = "No tienes acceso a internet, no se puede proceder."
        } else if (error.code == "auth/user-not-found") {
          errorMessage = "No encontramos a nigun usuario con ese correo";
        } else if (error.code == "auth/wrong-password") {
          errorMessage = "No encontramos a nigun usuario con ese correo";
        } else if (error.code == "auth/too-many-requests") {
          errorMessage = "Hemos bloqueado todas las solicitudes de este dispositivo debido a una actividad inusual. Inténtalo más tarde.";
        } else {
          errorMessage = error.message;
        }

        alert (errorMessage);
      });
    }
  }

  go_page (tipo: number) {
    if (tipo === 0) {
      this.router.navigate (['pages/home']);
    } else if (tipo === -1 || tipo === -2) {
      this.router.navigate (['pages/gestionar-ventas']);
    } else if (tipo === -3) {
      this.router.navigate (['pages/gestionar-ventas-restaurante']);
    }
  }

  home () {
    this.router.navigate (['pages/home']);
  }
}
