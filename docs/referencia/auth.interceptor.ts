import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).token();
  const apiUrl = environment.apiUrl.replace(/\/$/, '');
  const belongsToApi = request.url.startsWith(`${apiUrl}/`);
  const isLogin = request.url === `${apiUrl}/auth/login`;

  if (token && belongsToApi && !isLogin) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(request);
};
