# Laboratório Angular + JWT

Frontend preparado para uma aula de integração com Spring Security. Angular 21, estrutura do Angular CLI, componentes standalone, rotas, Reactive Forms, signals e serviços injetáveis.

## Executar

```bash
npm install
npm start
```

Acesse http://localhost:4200. Preencha os campos para explorar as telas. O botão Entrar abre a calculadora local.


## Verificar

```bash
npm run build
```

Validado com Node 24.12.0. A API é configurada em `src/environments/environment.ts`, inicialmente `http://localhost:8081`. Na integração, o token fica em memória e atualizar a página exige novo login.

A versão anterior em JavaScript está preservada no histórico Git. A versão atual usa a estrutura gerada pelo Angular CLI.
