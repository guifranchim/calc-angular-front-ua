import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);
  readonly demo = environment.demo;
  readonly mostrarSenha = signal(false);
  readonly carregando = signal(false);
  readonly erro = signal(inject(ActivatedRoute).snapshot.queryParamMap.has('expirada') ? 'Sua sessão expirou. Entre novamente.' : '');
  readonly form = inject(FormBuilder).nonNullable.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
  });

  private readonly auth = inject(AuthService);

  entrar(): void {
    if (this.form.invalid || this.carregando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set('');
    this.carregando.set(true);
    const { login, senha } = this.form.getRawValue();
    this.auth.login(login, senha).pipe(
      finalize( () =>  this.carregando.set(false))
    ).subscribe({
      next: () => {
        this.form.controls.senha.reset();
        void this.router.navigate(['/calculadora'])
      },
      error: (failure: unknown ) => {
        const status = (failure as { status?: number }).status;
        if (status === 0) this.erro.set("Nao foi possivel acessar a API");
        else if (status === 401 || status === 403) this.erro.set("Login recusado")
        else this.erro.set("Nao foi possivel entrar. Tente novamente")
      }
    })

  }
}
