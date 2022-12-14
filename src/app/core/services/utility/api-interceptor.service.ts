import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAuthState } from '../../store';
import { ErrorService } from '../error/error.service';
import { refreshToken } from '../../store/auth/auth.action';
import { ERROR, ERROR_TYPES } from '../error/error-config';
import ENDPOINTS from 'src/app/shared/constants/endpoints';

@Injectable({
  providedIn: 'root',
})
@Injectable()
export class ApiInterceptorService implements HttpInterceptor {
  token$ = this.store.select(selectAuthState).pipe(
    map(({ accessToken }) => accessToken),
    filter((accessToken) => accessToken !== null),
    take(1)
  );

  isRefreshing$ = this.store.select(selectAuthState).pipe(
    map(({ isRefreshing }) => isRefreshing),
    take(1)
  );

  constructor(private store: Store, private errSrv: ErrorService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.indexOf('assets/svgs') > -1) {
      return next.handle(req);
    }

    if (
      req.url.indexOf(ENDPOINTS.auth.login) > -1 ||
      req.url.indexOf(ENDPOINTS.auth.refresh) > -1 ||
      req.url.indexOf(ENDPOINTS.auth.logout) > -1
    ) {
      return next.handle(req).pipe(
        catchError((err: HttpErrorResponse | ErrorEvent) => {
          return this.errSrv.handleErr(err, ERROR_TYPES.authApi);
        })
      );
    }

    return this.token$.pipe(
      exhaustMap((accessToken) => {
        return next.handle(this.addHeaders(req, accessToken));
      }),
      catchError((err: HttpErrorResponse | ErrorEvent) => {
        if (err instanceof HttpErrorResponse && err.status === ERROR.forbidden)
          return this.isRefreshing$.pipe(
            tap((isRefreshing) => {
              !isRefreshing && this.store.dispatch(refreshToken());
            }),
            switchMap(() => {
              return this.token$.pipe(
                switchMap((accessToken) => {
                  return next.handle(this.addHeaders(req, accessToken));
                })
              );
            })
          );
        return this.errSrv.handleErr(err, ERROR_TYPES.generalApi);
      })
    );
  }

  addHeaders(req: HttpRequest<any>, accessToken: string | null) {
    const _headers: {
      [string: string]: string;
    } = {};
    accessToken && (_headers['Authorization'] = `Bearer ${accessToken}`);
    return req.clone({
      setHeaders: _headers,
      withCredentials: true,
    });
  }
}
