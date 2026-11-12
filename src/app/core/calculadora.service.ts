import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type Operacao = 'somar' | 'subtrair' | 'multiplicar' | 'dividir';

@Injectable({ providedIn: 'root' })
export class CalculadoraService {
  private http = inject(HttpClient)
  
  calcular(operacao: Operacao, primeiro: number, segundo: number): Observable<number> {
    return this.http.get<number>(
      `${environment.apiUrl}/calculadora/${operacao}/${primeiro}/${segundo}`,
    )

  }
}
