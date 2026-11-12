import "./style.css";
import * as api from "./api.js";

const element = (id) => document.getElementById(id);
const symbols = { somar: "+", subtrair: "−", multiplicar: "×", dividir: "÷" };
const format = (value) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 8 }).format(value);
let sessionVersion = 0;

function error(id, message = "") {
  element(id).textContent = message;
  element(id).hidden = !message;
}

function showScreen(authenticated) {
  element("login-screen").hidden = authenticated;
  element("calculator-screen").hidden = !authenticated;
  (authenticated ? element("first") : element("login")).focus();
}

function clearHistory() {
  element("history-list").replaceChildren();
  element("history-empty").hidden = false;
}

function signOut() {
  sessionVersion += 1;
  api.logout();
  element("password").value = "";
  element("result").textContent = "—";
  element("expression").textContent = "Seu próximo cálculo começa aqui.";
  element("result-caption").textContent =
    "Escolha a operação e informe os números.";
  error("calculation-error");
  clearHistory();
  showScreen(false);
}

if (api.mode === "http") {
  element("mode").textContent = "Conectado à API";
  element("demo-note").hidden = true;
}

element("show-password").addEventListener("click", () => {
  const visible = element("password").type === "password";
  element("password").type = visible ? "text" : "password";
  element("show-password").textContent = visible ? "Ocultar" : "Mostrar";
  element("show-password").setAttribute(
    "aria-label",
    visible ? "Ocultar senha" : "Mostrar senha",
  );
});

element("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  error("login-error");
  element("login-submit").disabled = true;
  element("login-submit").textContent = "Entrando…";
  try {
    await api.login(element("login").value.trim(), element("password").value);
    sessionVersion += 1;
    element("password").value = "";
    showScreen(true);
  } catch (failure) {
    error("login-error", failure.message);
  } finally {
    element("login-submit").disabled = false;
    element("login-submit").textContent = "Entrar →";
  }
});

element("calculator-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  error("calculation-error");
  const first = Number(element("first").value);
  const second = Number(element("second").value);
  const operation = new FormData(event.currentTarget).get("operation");
  if (
    ![first, second].every(
      (value) =>
        Number.isInteger(value) && value >= -2147483648 && value <= 2147483647,
    )
  ) {
    error(
      "calculation-error",
      "Informe números inteiros entre -2147483648 e 2147483647.",
    );
    return;
  }
  if (operation === "dividir" && second === 0) {
    error("calculation-error", "O divisor precisa ser diferente de zero.");
    return;
  }
  const requestSession = sessionVersion;
  element("calculate-submit").disabled = true;
  element("calculate-submit").textContent = "Calculando…";
  try {
    const result = await api.calculate(operation, first, second);
    if (requestSession !== sessionVersion) return;
    const expression = `${format(first)} ${symbols[operation]} ${format(second)}`;
    element("expression").textContent = expression;
    element("result").textContent = format(result);
    element("result-caption").textContent = "Cálculo concluído.";
    const row = document.createElement("li");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    label.textContent = expression;
    value.textContent = format(result);
    row.append(label, value);
    element("history-list").prepend(row);
    if (element("history-list").children.length > 5)
      element("history-list").lastElementChild.remove();
    element("history-empty").hidden = true;
  } catch (failure) {
    if (requestSession !== sessionVersion) return;
    if (failure.status === 401) {
      signOut();
      error("login-error", "Sua sessão expirou. Entre novamente.");
    } else {
      error("calculation-error", failure.message);
    }
  } finally {
    element("calculate-submit").disabled = false;
    element("calculate-submit").textContent = "Calcular →";
  }
});

element("logout").addEventListener("click", signOut);
element("clear-history").addEventListener("click", clearHistory);
