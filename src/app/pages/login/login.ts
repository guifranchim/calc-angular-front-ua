import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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


  entrar(): void {
    if (this.form.invalid || this.carregando()) {
      this.form.markAllAsTouched();
      return;
    }

    // Na aula, substituir pela chamada ao AuthService.
    void this.router.navigate(['/calculadora']);
  }
}
