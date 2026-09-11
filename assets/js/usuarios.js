// Gerenciamento de usuários (somente admin). Substitui pages/usuarios/*.php.
import { requireAdmin, getCurrentUser } from "./auth.js";
import { renderShell } from "./layout.js";
import { listUsuarios, updateUsuario, deleteUsuarioProfile, createUsuarioProfile } from "./data.js";
import { formatDateBR, escapeHtml } from "./utils.js";
import { supabase } from "./supabase-init.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";
import { roleLabel, roleBadgeClass } from "./permissions.js";

const user = await requireAdmin();
if (user) {
    renderShell("usuarios.html", user);
    await carregarUsuarios();
    document.getElementById("btnNovoUsuario").addEventListener("click", abrirModalNovoUsuario);
    document.getElementById("formUsuario").addEventListener("submit", salvarUsuario);
}

let usuariosCache = [];

async function carregarUsuarios() {
    usuariosCache = await listUsuarios();
    renderTabela();
}

function renderTabela() {
    const tbody = document.getElementById("usuariosTableBody");
    tbody.innerHTML = usuariosCache.map(u => `
    <tr>
      <td>${escapeHtml(u.nome)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="badge ${roleBadgeClass(u.role)}">${roleLabel(u.role)}</span></td>
      <td>${u.ativo === false ? '<span class="badge bg-secondary">Inativo</span>' : '<span class="badge bg-success">Ativo</span>'}</td>
      <td>${formatDateBR(u.criadoEm)}</td>
      <td>
        <button class="btn btn-sm btn-primary btn-editar" data-id="${u.id}" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-secondary btn-reset" data-email="${u.email}" title="Enviar redefinição de senha"><i class="bi bi-key"></i></button>
        <button class="btn btn-sm btn-danger btn-excluir" data-id="${u.id}" title="Excluir" ${u.id === getCurrentUser()?.uid ? "disabled" : ""}><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join("") || `<tr><td colspan="6" class="text-center text-muted py-4">Nenhum usuário cadastrado.</td></tr>`;

    tbody.querySelectorAll(".btn-editar").forEach(btn => btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id)));
    tbody.querySelectorAll(".btn-excluir").forEach(btn => btn.addEventListener("click", () => excluirUsuario(btn.dataset.id)));
    tbody.querySelectorAll(".btn-reset").forEach(btn => btn.addEventListener("click", () => resetarSenha(btn.dataset.email)));
}

function abrirModalNovoUsuario() {
    document.getElementById("modalUsuarioTitle").textContent = "Novo Usuário";
    document.getElementById("formUsuario").reset();
    document.getElementById("usuarioId").value = "";
    document.getElementById("senhaGroup").style.display = "block";
    document.getElementById("usuarioSenha").required = true;
    new bootstrap.Modal(document.getElementById("modalUsuario")).show();
}

function abrirModalEditar(id) {
    const u = usuariosCache.find(x => x.id === id);
    if (!u) return;
    document.getElementById("modalUsuarioTitle").textContent = "Editar Usuário";
    document.getElementById("usuarioId").value = u.id;
    document.getElementById("usuarioNome").value = u.nome || "";
    document.getElementById("usuarioEmail").value = u.email || "";
    document.getElementById("usuarioRole").value = u.role || "vendedor";
    document.getElementById("usuarioAtivo").checked = u.ativo !== false;
    document.getElementById("senhaGroup").style.display = "none";
    document.getElementById("usuarioSenha").required = false;
    new bootstrap.Modal(document.getElementById("modalUsuario")).show();
}

async function salvarUsuario(e) {
    e.preventDefault();
    const id = document.getElementById("usuarioId").value;
    const nome = document.getElementById("usuarioNome").value.trim();
    const email = document.getElementById("usuarioEmail").value.trim();
    const role = document.getElementById("usuarioRole").value;
    const ativo = document.getElementById("usuarioAtivo").checked;

    try {
        if (id) {
            await updateUsuario(id, { nome, email, role, ativo });
        } else {
            const senha = document.getElementById("usuarioSenha").value;
            await criarUsuarioSemDeslogarAdmin(nome, email, senha, role, ativo);
        }
        bootstrap.Modal.getInstance(document.getElementById("modalUsuario")).hide();
        await carregarUsuarios();
    } catch (err) {
        alert("Erro ao salvar usuário: " + err.message);
    }
}

/**
 * Cria o novo usuário em um client Supabase secundário (sem persistir sessão) para
 * não substituir a sessão do admin logado (limitação do SDK client-side sem Service Role Key).
 */
async function criarUsuarioSemDeslogarAdmin(nome, email, senha, role, ativo) {
    const secondaryClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await secondaryClient.auth.signUp({ email, password: senha });
    if (error) throw error;
    if (!data.user) throw new Error("Não foi possível criar o usuário (verifique a confirmação de email nas configurações do Supabase Auth).");
    // O Supabase não retorna erro para email já cadastrado (por segurança, evita
    // que alguém descubra emails existentes); ele responde com um usuário "fantasma"
    // sem identidades associadas. É assim que detectamos a duplicidade aqui.
    if (data.user.identities && data.user.identities.length === 0) {
        throw new Error("Este email já está cadastrado.");
    }
    await createUsuarioProfile(data.user.id, { nome, email, role, ativo });
}

async function excluirUsuario(id) {
    const u = usuariosCache.find(x => x.id === id);
    if (!confirm(`Excluir o perfil de "${u?.nome}"? (a conta de autenticação deve ser removida no console do Supabase)`)) return;
    await deleteUsuarioProfile(id);
    await carregarUsuarios();
}

async function resetarSenha(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname.replace("usuarios.html", "index.html")
        });
        if (error) throw error;
        alert("Email de redefinição de senha enviado para " + email);
    } catch (err) {
        alert("Erro ao enviar email: " + err.message);
    }
}

