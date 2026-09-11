// Lógica do Dashboard: métricas, alertas e gráficos (equivalente a pages/dashboard.php).
import { requireAuth } from "./auth.js";
import { renderShell } from "./layout.js";
import { listProdutos } from "./data.js";
import { formatDateBR, formatMoneyBR, daysUntil, escapeHtml } from "./utils.js";

// Estas constantes precisam existir ANTES de carregarDashboard() ser chamada
// (ela roda no bloco abaixo, ainda durante o carregamento do módulo).
const PALETA = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];
const isDark = () => document.body.classList.contains("theme-dark");
const corTexto = () => isDark() ? "#cbd5e1" : "#475569";
const corGrade = () => isDark() ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";

Chart.defaults.font.family = "'Segoe UI', sans-serif";

const user = await requireAuth();
if (user) {
    renderShell("dashboard.html", user);
    document.getElementById("welcomeBadge").textContent = `Bem-vindo, ${user.nome}`;
    try {
        await carregarDashboard();
    } catch (err) {
        console.error(err);
        document.getElementById("alertsContainer").innerHTML =
            `<div class="alert alert-danger">Erro ao carregar o dashboard: ${err.message}</div>`;
    }
}

async function carregarDashboard() {
    const produtos = await listProdutos();

    const nomes = [];
    const quantidades = [];
    const valores = [];
    const nomesValidade = [];
    const qtdValidade = [];
    const vencidos = [];
    const prestes = [];

    for (const p of produtos) {
        nomes.push(p.nome);
        quantidades.push(Number(p.quantidade) || 0);
        valores.push((Number(p.preco) || 0) * (Number(p.quantidade) || 0));

        const dias = daysUntil(p.validade);
        if (dias < 0) vencidos.push(p);
        if (dias >= 0 && dias <= 7) {
            prestes.push(p);
            nomesValidade.push(p.nome);
            qtdValidade.push(Number(p.quantidade) || 0);
        }
    }

    document.getElementById("statTotalItens").textContent = quantidades.reduce((a, b) => a + b, 0);
    document.getElementById("statValorEstoque").textContent = "R$ " + formatMoneyBR(valores.reduce((a, b) => a + b, 0));
    document.getElementById("statVencendo").textContent = prestes.length;

    renderAlertas(vencidos, prestes);

    new Chart(document.getElementById("chart1"), {
        type: "bar",
        data: {
            labels: nomes,
            datasets: [{
                label: "Quantidade em estoque",
                data: quantidades,
                backgroundColor: "#2563eb",
                borderRadius: 8,
                maxBarThickness: 42
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} unidade(s)` } }
            },
            scales: {
                x: { ticks: { color: corTexto() }, grid: { display: false } },
                y: { beginAtZero: true, ticks: { color: corTexto() }, grid: { color: corGrade() } }
            }
        }
    });

    new Chart(document.getElementById("chart2"), {
        type: "pie",
        data: {
            labels: nomes,
            datasets: [{ label: "Valor em estoque", data: valores, backgroundColor: PALETA }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom", labels: { color: corTexto(), boxWidth: 12, padding: 14 } },
                tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: R$ ${formatMoneyBR(ctx.parsed)}` } }
            }
        }
    });

    new Chart(document.getElementById("chart3"), {
        type: "bar",
        data: {
            labels: nomesValidade,
            datasets: [{
                label: "Quantidade vencendo",
                data: qtdValidade,
                backgroundColor: "#d97706",
                borderRadius: 8,
                maxBarThickness: 42
            }]
        },
        options: {
            indexAxis: "y",
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x} unidade(s)` } }
            },
            scales: {
                x: { beginAtZero: true, ticks: { color: corTexto() }, grid: { color: corGrade() } },
                y: { ticks: { color: corTexto() }, grid: { display: false } }
            }
        }
    });
}

function renderAlertas(vencidos, prestes) {
    const container = document.getElementById("alertsContainer");
    let html = "";

    if (vencidos.length > 0) {
        html += `
    <div class="alert alert-danger shadow-sm border-0 rounded-4 d-flex justify-content-between">
      <div>
        <h5><i class="bi bi-exclamation-triangle-fill"></i> Produtos vencidos</h5>
        <p>Existem <strong>${vencidos.length}</strong> produto(s) vencido(s).</p>
        <ul>${vencidos.map(p => `<li>${escapeHtml(p.nome)} — ${formatDateBR(p.validade)}</li>`).join("")}</ul>
      </div>
      <div class="text-end">
        <a href="produtos.html?filter=vencidos" class="btn btn-light mb-2">Ver detalhes</a>
        <button onclick="playBeep('red')" class="btn btn-danger">Tocar alerta</button>
      </div>
    </div>`;
    }

    if (prestes.length > 0) {
        html += `
    <div class="alert alert-warning shadow-sm border-0 rounded-4 d-flex justify-content-between">
      <div>
        <h5><i class="bi bi-hourglass-split"></i> Produtos próximos do vencimento</h5>
        <p>${prestes.length} produto(s) vencem nos próximos 7 dias.</p>
        <ul>${prestes.map(p => `<li>${escapeHtml(p.nome)} — ${formatDateBR(p.validade)}</li>`).join("")}</ul>
      </div>
      <div class="text-end">
        <a href="produtos.html?filter=prestes" class="btn btn-light mb-2">Ver detalhes</a>
        <button onclick="playBeep('yellow')" class="btn btn-warning">Tocar alerta</button>
      </div>
    </div>`;
    }

    container.innerHTML = html;
}
