/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import * as moment from 'moment';

import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor (
    private analytics: AnalyticsService,
    private seoService: SeoService,
    private notification: NotificationService,
    private auth: AuthService) {
  }

  ngOnInit (): void {
    this.analytics.trackPageViews ();
    this.seoService.trackCanonicalChanges();
    moment.locale ('es');
    this.notification.init ();
  }
}
