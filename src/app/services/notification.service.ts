import { Injectable } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  os_id: string;
  constructor(private database: DatabaseService,
              private auth: AuthService,
              private http: HttpClient) {
  }

  init () {
    document.addEventListener ('os_token', async (token: any) => {
      this.os_id = token.detail;
      let token_id = token.detail;

      console.log ("OS Token: " + token_id);

      this.auth.authState ().subscribe (user => {
        if (user) {
          const API = "https://onesignal.com/api/v1/players/" + token_id;
          let body: any;

          body = {
            'app_id': '07b5ca72-5699-4117-9966-1867a2306719',
            'tags': {'Administrador': 'true'}
          }

          if (body !== null || body !== undefined) {
            this.http.put (API, body).subscribe (response => {
              console.log("PUT Request is successful ", response);
            }, error => {
              console.log("Rrror", error);
            });
          }
        }
      });
    }, false);
  }

  send_notification (data: any) {
    return this.http.post ('http://api.ceradentperu.com/api/send-notification-nyoy', data);
  }
}
