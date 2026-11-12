import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

export type Operacao = 'somar' | 'subtrair' | 'multiplicar' | 'dividir';

@Injectable({ providedIn: 'root' })
export class CalculadoraService {
  // Etapa da aula: substituir pelo GET da calculadora.
  calcular(operacao: Operacao, primeiro: number, segundo: number): Observable<number> {
    switch (operacao) {
      case 'somar': return of(primeiro + segundo);
      case 'subtrair': return of(primeiro - segundo);
      case 'multiplicar': return of(primeiro * segundo);
      case 'dividir':
        if (segundo === 0) return throwError(() => new Error('O divisor precisa ser diferente de zero.'));
        return of(primeiro / segundo);
    }
  }
}
