// Referência para o professor. Ao concluir a aula, copie para src/api.js.
export const mode = "http";
const baseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:8081"
).replace(/\/$/, "");
let token = null;

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error(
      "Não foi possível acessar a API. Confira o servidor, a URL e o CORS.",
    );
  }
  if (!response.ok) {
    const messages = {
      400: "Confira os valores enviados.",
      401: "Sua sessão expirou. Entre novamente.",
      403: "Acesso negado. Confira as permissões ou entre novamente.",
    };
    const failure = new Error(
      messages[response.status] || "A API não conseguiu concluir a operação.",
    );
    failure.status = response.status;
    throw failure;
  }
  return response;
}

export async function login(login, senha) {
  token = null;
  try {
    const response = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, senha }),
    });
    const receivedToken = (await response.text()).trim();
    if (!receivedToken) throw new Error("A API retornou um token vazio.");
    token = receivedToken;
  } catch (failure) {
    if (failure.status === 401 || failure.status === 403) {
      throw new Error("Login recusado. Confira o usuário e a senha.");
    }
    throw failure;
  }
}

export async function calculate(operation, first, second) {
  if (!token) {
    const failure = new Error("Entre para calcular.");
    failure.status = 401;
    throw failure;
  }
  const allowedOperations = ["somar", "subtrair", "multiplicar", "dividir"];
  if (!allowedOperations.includes(operation))
    throw new Error("Operação desconhecida.");
  const response = await request(
    `/calculadora/${operation}/${first}/${second}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const result = await response.json();
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("A API retornou um resultado inválido.");
  }
  return result;
}

export function logout() {
  token = null;
}
