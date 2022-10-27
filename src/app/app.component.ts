import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { refreshToken } from './core/store/auth/auth.action';
import { ROUTES } from './shared/constants/routes-config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private store: Store) {
    // this.store.dispatch(refreshToken());
  }
}
