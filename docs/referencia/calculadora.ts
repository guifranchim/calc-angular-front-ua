import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { CalculadoraService, Operacao } from '../../core/calculadora.service';

interface Calculo { expressao: string; resultado: string; }

@Component({
  selector: 'app-calculadora',
  imports: [ReactiveFormsModule],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css',
})
export class Calculadora {
  private readonly api = inject(CalculadoraService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly resultado = signal<Calculo | null>(null);
  readonly historico = signal<Calculo[]>([]);
  readonly operacoes: { valor: Operacao; simbolo: string; nome: string }[] = [
    { valor: 'somar', simbolo: '+', nome: 'Somar' },
    { valor: 'subtrair', simbolo: '−', nome: 'Subtrair' },
    { valor: 'multiplicar', simbolo: '×', nome: 'Multiplicar' },
    { valor: 'dividir', simbolo: '÷', nome: 'Dividir' },
  ];
  readonly form = inject(FormBuilder).nonNullable.group({
    operacao: ['somar' as Operacao],
    primeiro: [2, [Validators.required, Validators.min(-2147483648), Validators.max(2147483647)]],
    segundo: [3, [Validators.required, Validators.min(-2147483648), Validators.max(2147483647)]],
  });

  calcular(): void {
    if (this.carregando()) return;
    this.erro.set('');
    const { operacao, primeiro, segundo } = this.form.getRawValue();
    if (this.form.invalid || !Number.isInteger(primeiro) || !Number.isInteger(segundo)) {
      this.erro.set('Informe números inteiros entre -2147483648 e 2147483647.');
      return;
    }
    if (operacao === 'dividir' && segundo === 0) {
      this.erro.set('O divisor precisa ser diferente de zero.');
      return;
    }
    this.carregando.set(true);
    this.api.calcular(operacao, primeiro, segundo).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.carregando.set(false)),
    ).subscribe({
      next: valor => {
        if (typeof valor !== 'number' || !Number.isFinite(valor)) {
          this.erro.set('A API retornou um resultado inválido.');
          return;
        }
        const format = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 });
        const simbolo = this.operacoes.find(item => item.valor === operacao)!.simbolo;
        const calculo = { expressao: `${format.format(primeiro)} ${simbolo} ${format.format(segundo)}`, resultado: format.format(valor) };
        this.resultado.set(calculo);
        this.historico.update(items => [calculo, ...items].slice(0, 5));
      },
      error: (failure: unknown) => {
        const status = (failure as { status?: number }).status;
        if (status === 401) {
          this.auth.logout();
          void this.router.navigate(['/login'], { queryParams: { expirada: true } });
        } else if (status === 403) this.erro.set('Acesso negado. Confira as permissões ou entre novamente.');
        else if (status === 0) this.erro.set('Não foi possível acessar a API. Confira o servidor e o CORS.');
        else this.erro.set(status ? 'A API não conseguiu concluir a operação.' : (failure as Error).message);
      },
    });
  }

  sair(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
