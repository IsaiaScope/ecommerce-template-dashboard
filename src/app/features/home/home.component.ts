import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { switchMap, timer } from 'rxjs';
import { ProductsService } from 'src/app/core/services/products.service';
import { logout } from 'src/app/core/store/auth/auth.action';
import { AuthService } from '../login/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  someData$ = timer(0, 5000).pipe(switchMap(() => this.prodSrv.someData()));
  someData2$ = timer(0, 7000).pipe(switchMap(() => this.prodSrv.someData2()));
  someData3$ = timer(0, 3000).pipe(switchMap(() => this.prodSrv.someData3()));
  constructor(private store: Store, private prodSrv: ProductsService) {}
  ngOnInit(): void {}

  logoutClick() {
    console.log('here');
    this.store.dispatch(logout());
  }
}
