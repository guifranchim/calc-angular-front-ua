import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessToken = signal<string | null>(null);
  readonly token = this.accessToken.asReadonly();

  // Etapa da aula: substituir a simulação por HttpClient.post.
  login(login: string, senha: string): Observable<void> {
    if (login !== 'admin' || senha !== 'AulaJwt123!') {
      return throwError(() => new Error('Usuário ou senha inválidos.'));
    }
    this.accessToken.set('sessao-demonstrativa');
    return of(undefined);
  }

  logout(): void {
    this.accessToken.set(null);
  }
}
