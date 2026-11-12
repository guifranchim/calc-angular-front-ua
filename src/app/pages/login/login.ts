import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly demo = environment.demo;
  readonly mostrarSenha = signal(false);
  readonly carregando = signal(false);
  readonly erro = signal(inject(ActivatedRoute).snapshot.queryParamMap.has('expirada') ? 'Sua sessão expirou. Entre novamente.' : '');
  readonly form = inject(FormBuilder).nonNullable.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
  });

  entrar(): void {
    if (this.form.invalid || this.carregando()) {
      this.form.markAllAsTouched();
      return;
    }
    this.erro.set('');
    this.carregando.set(true);
    const { login, senha } = this.form.getRawValue();
    this.auth.login(login.trim(), senha).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.carregando.set(false)),
    ).subscribe({
      next: () => {
        this.form.controls.senha.reset();
        void this.router.navigate(['/calculadora']);
      },
      error: (failure: unknown) => {
        const status = (failure as { status?: number }).status;
        if (status === 0) this.erro.set('Não foi possível acessar a API. Confira o servidor e o CORS.');
        else if (status === 401 || status === 403) this.erro.set('Login recusado. Confira o usuário e a senha.');
        else this.erro.set(status ? 'Não foi possível entrar. Tente novamente.' : (failure as Error).message);
      },
    });
  }
}
