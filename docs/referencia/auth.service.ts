import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, defer, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly accessToken = signal<string | null>(null);
  readonly token = this.accessToken.asReadonly();

  login(login: string, senha: string): Observable<void> {
    return defer(() => {
      this.accessToken.set(null);
      return this.http.post(`${environment.apiUrl}/auth/login`, { login, senha }, {
        responseType: 'text',
        timeout: 10000,
      }).pipe(
        tap(token => {
          if (!token.trim()) throw new Error('A API retornou um token vazio.');
          this.accessToken.set(token.trim());
        }),
        map(() => undefined),
      );
    });
  }

  logout(): void {
    this.accessToken.set(null);
  }
}
