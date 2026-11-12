export const mode = "demo";
let authenticated = false;

export async function login(login, senha) {
  if (login !== "admin" || senha !== "AulaJwt123!") {
    throw new Error("Usuário ou senha inválidos.");
  }
  authenticated = true;
}

export async function calculate(operation, first, second) {
  if (!authenticated) throw new Error("Entre para calcular.");
  switch (operation) {
    case "somar":
      return first + second;
    case "subtrair":
      return first - second;
    case "multiplicar":
      return first * second;
    case "dividir":
      if (second === 0)
        throw new Error("O divisor precisa ser diferente de zero.");
      return first / second;
    default:
      throw new Error("Operação desconhecida.");
  }
}

export function logout() {
  authenticated = false;
}
