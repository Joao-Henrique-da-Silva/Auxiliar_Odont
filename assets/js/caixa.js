// Caixa (PDV): venda rápida com carrinho, escaneando ou selecionando produtos.
import { requirePermission } from "./permissions.js";
import { getCurrentUser } from "./auth.js";
import { renderShell } from "./layout.js";
import { listProdutos, getProdutoByCodigoBarras, registrarSaida } from "./data.js";
import { formatMoneyBR, escapeHtml } from "./utils.js";
import { abrirScanner } from "./scanner.js";

let produtosCache = [];
let carrinho = []; // { produtoId, nome, preco, quantidade, estoqueDisponivel }

const user = await requirePermission("saida");
if (user) {
    renderShell("caixa.html", user);
    await init();
}

async function init() {
    document.getElementById("btnAdicionarCarrinho").addEventListener("click", adicionarAoCarrinho);
    document.getElementById("btnScanCaixa").addEventListener("click", scanEAdicionar);
    document.getElementById("btnFinalizarVenda").addEventListener("click", finalizarVenda);

    try {
        produtosCache = await listProdutos();
    } catch (err) {
        console.error(err);
        document.getElementById("caixaProdutoId").innerHTML = `<option value="">Erro ao carregar produtos</option>`;
        alert("Erro ao carregar produtos: " + err.message);
        return;
    }
    preencherSelect();
    renderCarrinho();
}

function preencherSelect() {
    const sel = document.getElementById("caixaProdutoId");
    sel.innerHTML = produtosCache
        .map(p => `<option value="${p.id}">${escapeHtml(p.nome)} (estoque: ${p.quantidade})</option>`)
        .join("") || `<option value="">Nenhum produto cadastrado</option>`;
}

function adicionarAoCarrinho() {
    const produtoId = document.getElementById("caixaProdutoId").value;
    const quantidade = Math.max(1, parseInt(document.getElementById("caixaQuantidade").value) || 1);
    const produto = produtosCache.find(p => p.id === produtoId);
    if (!produto) return;
    adicionarProdutoAoCarrinho(produto, quantidade);
}

function adicionarProdutoAoCarrinho(produto, quantidade) {
    const existente = carrinho.find(i => i.produtoId === produto.id);
    if (existente) existente.quantidade += quantidade;
    else carrinho.push({
        produtoId: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco) || 0,
        quantidade,
        estoqueDisponivel: Number(produto.quantidade) || 0
    });
    renderCarrinho();
}

function renderCarrinho() {
    const tbody = document.getElementById("carrinhoBody");
    tbody.innerHTML = carrinho.map((item, idx) => `
    <tr>
      <td>${escapeHtml(item.nome)}</td>
      <td><input type="number" min="1" class="form-control form-control-sm carrinho-qtd" data-idx="${idx}" value="${item.quantidade}"></td>
      <td>R$ ${formatMoneyBR(item.preco)}</td>
      <td>R$ ${formatMoneyBR(item.preco * item.quantidade)}</td>
      <td><button class="btn btn-sm btn-outline-danger btn-remover-item" data-idx="${idx}" title="Remover"><i class="bi bi-x-lg"></i></button></td>
    </tr>`).join("") || `<tr><td colspan="5" class="text-center text-muted py-4">Carrinho vazio</td></tr>`;

    const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
    document.getElementById("carrinhoTotal").textContent = "R$ " + formatMoneyBR(total);

    tbody.querySelectorAll(".carrinho-qtd").forEach(input => input.addEventListener("change", e => {
        const idx = Number(e.target.dataset.idx);
        carrinho[idx].quantidade = Math.max(1, parseInt(e.target.value) || 1);
        renderCarrinho();
    }));
    tbody.querySelectorAll(".btn-remover-item").forEach(btn => btn.addEventListener("click", e => {
        const idx = Number(e.currentTarget.dataset.idx);
        carrinho.splice(idx, 1);
        renderCarrinho();
    }));
}

function scanEAdicionar() {
    abrirScanner(async codigo => {
        try {
            const produto = await getProdutoByCodigoBarras(codigo);
            if (!produto) return alert("Nenhum produto encontrado com o código: " + codigo);
            adicionarProdutoAoCarrinho(produto, 1);
        } catch (err) {
            alert("Erro ao buscar produto: " + err.message);
        }
    });
}

async function finalizarVenda() {
    if (carrinho.length === 0) return alert("Carrinho vazio.");
    for (const item of carrinho) {
        if (item.quantidade > item.estoqueDisponivel) {
            return alert(`Estoque insuficiente para "${item.nome}". Disponível: ${item.estoqueDisponivel}`);
        }
    }

    const btn = document.getElementById("btnFinalizarVenda");
    btn.disabled = true;
    btn.textContent = "Processando...";

    try {
        const usuarioAtual = getCurrentUser();
        for (const item of carrinho) {
            const produto = produtosCache.find(p => p.id === item.produtoId);
            await registrarSaida(produto, item.quantidade, "Venda via Caixa (PDV)", usuarioAtual);
        }
        alert("Venda finalizada com sucesso!");
        carrinho = [];
        produtosCache = await listProdutos();
        preencherSelect();
        renderCarrinho();
    } catch (err) {
        alert("Erro ao finalizar venda: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-circle"></i> Finalizar Venda';
    }
}
