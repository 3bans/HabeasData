import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Clonar la solicitud y agregar el header de autenticación
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authService.getToken()}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      authService.handleAuthError(error);
      return throwError(() => error);
    })
  );
};
