import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private accessToken = signal('');
  readonly token = this.accessToken.asReadonly();

  login(login: string, senha: string) {
    this.logout();
    return this.http.post<{ token: string }>(
      `${environment.apiUrl}/auth/login`,
      { login, senha },
    ).pipe(
      tap(resposta => this.accessToken.set(resposta.token)),
    );
  }

  logout() {
    this.accessToken.set('');
  }
}
