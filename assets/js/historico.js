// Histórico de ações e saídas de estoque (equivalente a pages/historico/*.php).
import { requireAuth } from "./auth.js";
import { renderShell } from "./layout.js";
import { listHistorico, listSaidas } from "./data.js";
import { formatDateTimeBR, downloadCsv, escapeHtml } from "./utils.js";

const user = await requireAuth();
if (user) {
    renderShell("historico.html", user);

    let historicoCache = [];
    let saidasCache = [];

    async function init() {
        document.getElementById("btnExportCsv").addEventListener("click", exportarCsv);
        try {
            [historicoCache, saidasCache] = await Promise.all([listHistorico(), listSaidas()]);
        } catch (err) {
            console.error(err);
            const msg = `<tr><td colspan="5" class="text-center text-danger py-4">Erro ao carregar: ${err.message}</td></tr>`;
            document.getElementById("historicoTableBody").innerHTML = msg;
            document.getElementById("saidasTableBody").innerHTML = msg;
            return;
        }
        renderHistorico();
        renderSaidas();
    }

    await init();

    function renderHistorico() {
        document.getElementById("statTotalHistorico").textContent = historicoCache.length;
        document.getElementById("historicoTableBody").innerHTML = historicoCache.map(h => `
    <tr>
      <td>${escapeHtml(h.usuarioNome || "Usuário removido")}</td>
      <td>${escapeHtml(h.produtoNome || "Produto removido")}</td>
      <td><span class="badge ${h.acao === "Entrada" ? "bg-success" : "bg-danger"}">${escapeHtml(h.acao)}</span></td>
      <td>${escapeHtml(h.descricao || "")}</td>
      <td>${formatDateTimeBR(h.dataAcao)}</td>
    </tr>`).join("") || `<tr><td colspan="5" class="text-center text-muted py-4">Nenhum registro.</td></tr>`;
    }

    function renderSaidas() {
        document.getElementById("statTotalSaidas").textContent = saidasCache.length;
        document.getElementById("saidasTableBody").innerHTML = saidasCache.map(s => `
    <tr>
      <td>${escapeHtml(s.produtoNome)}</td>
      <td>${s.quantidade}</td>
      <td>${escapeHtml(s.usuarioNome || "Usuário removido")}</td>
      <td>${escapeHtml(s.observacao || "")}</td>
      <td>${formatDateTimeBR(s.dataSaida)}</td>
    </tr>`).join("") || `<tr><td colspan="5" class="text-center text-muted py-4">Nenhuma saída registrada.</td></tr>`;
    }

    function exportarCsv() {
        const rows = saidasCache.map(s => [s.id, s.produtoNome, s.quantidade, formatDateTimeBR(s.dataSaida), s.usuarioNome || ""]);
        downloadCsv("historico_saidas.csv", ["id", "produto", "quantidade", "data_saida", "usuario"], rows);
    }
}

