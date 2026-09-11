// Lógica da página de Produtos: listagem, filtros, CRUD, entrada/saída e exportação CSV.
import { requireAuth, getCurrentUser } from "./auth.js";
import { renderShell } from "./layout.js";
import {
    listProdutos, createProduto, updateProduto, deleteProduto,
    registrarEntrada, registrarSaida, getProdutoByCodigoBarras
} from "./data.js";
import { formatDateBR, formatMoneyBR, daysUntil, downloadCsv, escapeHtml, toDateInputValue } from "./utils.js";
import { can } from "./permissions.js";
import { abrirScanner } from "./scanner.js";

const user = await requireAuth();
if (user) {
    renderShell("produtos.html", user);

    const podeEditar = can(user, "produtos_edit");
    const podeEntrada = can(user, "entrada");
    const podeSaida = can(user, "saida");

    document.getElementById("btnNovoProduto").classList.toggle("d-none", !podeEditar);

    let produtosCache = [];
    let filtroAtual = "todos";

    async function init() {
        const params = new URLSearchParams(window.location.search);
        filtroAtual = params.get("filter") || "todos";
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.filter === filtroAtual);
            btn.addEventListener("click", () => {
                filtroAtual = btn.dataset.filter;
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderTabela();
            });
        });

        // Botões registrados ANTES do carregamento: se listProdutos() falhar (rede,
        // RLS, schema desatualizado), a tela não deve travar sem nenhum botão responder.
        document.getElementById("btnNovoProduto").addEventListener("click", abrirModalNovoProduto);
        document.getElementById("formProduto").addEventListener("submit", salvarProduto);
        document.getElementById("formEntrada").addEventListener("submit", salvarEntrada);
        document.getElementById("formSaida").addEventListener("submit", salvarSaida);
        document.getElementById("btnExportCsv").addEventListener("click", exportarCsv);

        document.getElementById("modalEntrada").addEventListener("show.bs.modal", preencherSelects);
        document.getElementById("modalSaida").addEventListener("show.bs.modal", preencherSelects);

        document.getElementById("btnScanProduto")?.addEventListener("click", () => {
            abrirScanner(codigo => { document.getElementById("produtoCodigoBarras").value = codigo; });
        });
        document.getElementById("btnScanEntrada")?.addEventListener("click", () => escanearParaSelect("entradaProdutoId", "entradaQuantidade"));
        document.getElementById("btnScanSaida")?.addEventListener("click", () => escanearParaSelect("saidaProdutoId", "saidaQuantidade"));

        try {
            await carregarProdutos();
        } catch (err) {
            console.error(err);
            document.getElementById("produtosTableBody").innerHTML =
                `<tr><td colspan="9" class="text-center text-danger py-4">Erro ao carregar produtos: ${err.message}</td></tr>`;
            return;
        }

        const acao = params.get("acao");
        if (acao === "entrada" && podeEntrada) new bootstrap.Modal(document.getElementById("modalEntrada")).show();
        if (acao === "saida" && podeSaida) new bootstrap.Modal(document.getElementById("modalSaida")).show();
    }

    async function escanearParaSelect(selectId, focusId) {
        abrirScanner(async codigo => {
            try {
                const produto = await getProdutoByCodigoBarras(codigo);
                if (!produto) { alert("Nenhum produto encontrado com o código: " + codigo); return; }
                const select = document.getElementById(selectId);
                if (![...select.options].some(o => o.value === String(produto.id))) preencherSelects();
                select.value = produto.id;
                document.getElementById(focusId)?.focus();
            } catch (err) {
                alert("Erro ao buscar produto: " + err.message);
            }
        });
    }

    await init();


    async function carregarProdutos() {
        produtosCache = await listProdutos();
        renderStats();
        renderTabela();
    }

    function estoqueMinimo(p) {
        return p.estoque_minimo === null || p.estoque_minimo === undefined ? 5 : Number(p.estoque_minimo);
    }

    function renderStats() {
        const vencidos = produtosCache.filter(p => daysUntil(p.validade) < 0);
        const prestes = produtosCache.filter(p => { const d = daysUntil(p.validade); return d >= 0 && d <= 7; });
        const baixo = produtosCache.filter(p => Number(p.quantidade) <= estoqueMinimo(p));

        document.getElementById("statTotal").textContent = produtosCache.length;
        document.getElementById("statVencidos").textContent = vencidos.length;
        document.getElementById("statPrestes").textContent = prestes.length;
        document.getElementById("statBaixo").textContent = baixo.length;
    }

    function filtrarProdutos() {
        return produtosCache.filter(p => {
            const dias = daysUntil(p.validade);
            if (filtroAtual === "vencidos") return dias < 0;
            if (filtroAtual === "prestes") return dias >= 0 && dias <= 7;
            if (filtroAtual === "baixo") return Number(p.quantidade) <= estoqueMinimo(p);
            return true;
        });
    }

    function renderTabela() {
        const tbody = document.getElementById("produtosTableBody");
        const lista = filtrarProdutos();

        tbody.innerHTML = lista.map(p => {
            const dias = daysUntil(p.validade);
            const baixo = Number(p.quantidade) <= estoqueMinimo(p);
            let statusBadge = `<span class="badge bg-success">OK</span>`;
            if (dias < 0) statusBadge = `<span class="badge bg-danger">Vencido</span>`;
            else if (dias <= 7) statusBadge = `<span class="badge bg-warning text-dark">Vencendo</span>`;
            if (baixo) statusBadge += ` <span class="badge bg-info text-dark">Baixo</span>`;

            return `
    <tr>
      <td>${escapeHtml(p.nome)}${p.descricao ? `<br><small class="text-muted">${escapeHtml(p.descricao)}</small>` : ""}</td>
      <td>${escapeHtml(p.categoria || "-")}</td>
      <td>${escapeHtml(p.unidade || "-")}</td>
      <td>R$ ${formatMoneyBR(p.preco)}</td>
      <td class="${baixo ? "low-stock" : ""}">${p.quantidade}</td>
      <td>${estoqueMinimo(p)}</td>
      <td>${formatDateBR(p.validade)}</td>
      <td>${statusBadge}</td>
      <td>
        ${podeEditar ? `
        <button class="btn btn-sm btn-primary btn-editar" data-id="${p.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger btn-deletar" data-id="${p.id}"><i class="bi bi-trash"></i></button>` : "-"}
      </td>
    </tr>`;
        }).join("") || `<tr><td colspan="9" class="text-center text-muted py-4">Nenhum produto encontrado.</td></tr>`;

        tbody.querySelectorAll(".btn-editar").forEach(btn =>
            btn.addEventListener("click", () => abrirModalEditarProduto(btn.dataset.id)));
        tbody.querySelectorAll(".btn-deletar").forEach(btn =>
            btn.addEventListener("click", () => excluirProduto(btn.dataset.id)));
    }

    function abrirModalNovoProduto() {
        document.getElementById("modalProdutoTitle").textContent = "Novo Produto";
        document.getElementById("formProduto").reset();
        document.getElementById("produtoId").value = "";
        new bootstrap.Modal(document.getElementById("modalProduto")).show();
    }

    function abrirModalEditarProduto(id) {
        const p = produtosCache.find(x => x.id === id);
        if (!p) return;
        document.getElementById("modalProdutoTitle").textContent = "Editar Produto";
        document.getElementById("produtoId").value = p.id;
        document.getElementById("produtoNome").value = p.nome || "";
        document.getElementById("produtoDescricao").value = p.descricao || "";
        document.getElementById("produtoCategoria").value = p.categoria || "";
        document.getElementById("produtoUnidade").value = p.unidade || "";
        document.getElementById("produtoPreco").value = p.preco || 0;
        document.getElementById("produtoQuantidade").value = p.quantidade || 0;
        document.getElementById("produtoEstoqueMinimo").value = estoqueMinimo(p);
        document.getElementById("produtoValidade").value = toDateInputValue(p.validade);
        document.getElementById("produtoCodigoBarras").value = p.codigo_barras || "";
        new bootstrap.Modal(document.getElementById("modalProduto")).show();
    }

    async function salvarProduto(e) {
        e.preventDefault();
        const id = document.getElementById("produtoId").value;
        const codigoBarras = document.getElementById("produtoCodigoBarras").value.trim();
        const data = {
            nome: document.getElementById("produtoNome").value.trim(),
            descricao: document.getElementById("produtoDescricao").value.trim(),
            categoria: document.getElementById("produtoCategoria").value.trim() || null,
            unidade: document.getElementById("produtoUnidade").value.trim() || null,
            preco: parseFloat(document.getElementById("produtoPreco").value) || 0,
            quantidade: parseInt(document.getElementById("produtoQuantidade").value) || 0,
            estoque_minimo: parseInt(document.getElementById("produtoEstoqueMinimo").value) || 0,
            validade: document.getElementById("produtoValidade").value || null,
            codigo_barras: codigoBarras || null
        };

        try {
            if (id) await updateProduto(id, data);
            else await createProduto(data);
            bootstrap.Modal.getInstance(document.getElementById("modalProduto")).hide();
            await carregarProdutos();
        } catch (err) {
            alert("Erro ao salvar produto: " + (err.message.includes("duplicate") ? "Já existe um produto com esse código de barras." : err.message));
        }
    }

    async function excluirProduto(id) {
        const p = produtosCache.find(x => x.id === id);
        if (!confirm(`Excluir o produto "${p?.nome}"?`)) return;
        await deleteProduto(id);
        await carregarProdutos();
    }

    function preencherSelects() {
        const options = produtosCache
            .map(p => `<option value="${p.id}">${escapeHtml(p.nome)} (estoque: ${p.quantidade})</option>`)
            .join("");
        document.getElementById("entradaProdutoId").innerHTML = options;
        document.getElementById("saidaProdutoId").innerHTML = options;
    }

    async function salvarEntrada(e) {
        e.preventDefault();
        const produtoId = document.getElementById("entradaProdutoId").value;
        const quantidade = parseInt(document.getElementById("entradaQuantidade").value);
        const observacao = document.getElementById("entradaObservacao").value.trim();
        const produto = produtosCache.find(p => p.id === produtoId);

        try {
            await registrarEntrada(produto, quantidade, observacao, getCurrentUser());
            bootstrap.Modal.getInstance(document.getElementById("modalEntrada")).hide();
            document.getElementById("formEntrada").reset();
            await carregarProdutos();
        } catch (err) {
            alert(err.message);
        }
    }

    async function salvarSaida(e) {
        e.preventDefault();
        const produtoId = document.getElementById("saidaProdutoId").value;
        const quantidade = parseInt(document.getElementById("saidaQuantidade").value);
        const observacao = document.getElementById("saidaObservacao").value.trim();
        const produto = produtosCache.find(p => p.id === produtoId);

        try {
            await registrarSaida(produto, quantidade, observacao, getCurrentUser());
            bootstrap.Modal.getInstance(document.getElementById("modalSaida")).hide();
            document.getElementById("formSaida").reset();
            await carregarProdutos();
        } catch (err) {
            alert(err.message);
        }
    }

    function exportarCsv() {
        const rows = produtosCache.map(p => [
            p.id, p.nome, p.descricao || "", p.categoria || "", p.unidade || "",
            p.preco, p.quantidade, estoqueMinimo(p), toDateInputValue(p.validade), p.codigo_barras || ""
        ]);
        downloadCsv("produtos_export.csv",
            ["id", "nome", "descricao", "categoria", "unidade", "preco", "quantidade", "estoque_minimo", "validade", "codigo_barras"],
            rows);
    }
}

