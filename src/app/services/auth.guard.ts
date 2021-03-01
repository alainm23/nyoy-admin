import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { first } from 'rxjs/operators';

// Services
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor (
    private authService: AuthService,
    private database: DatabaseService,
    private router: Router) {}
  canActivate () {
    return this.authService.isLogin ()
      .then (async (user: any) => {
        if (user) {
          const usuario = await this.database.get_usuario_by_id (user.uid).pipe (first ()).toPromise ();
          console.log (usuario);
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      });
  }
}
