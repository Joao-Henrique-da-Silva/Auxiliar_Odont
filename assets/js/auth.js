// Autenticação e perfil do usuário (substitui sessões PHP por Supabase Auth + Postgres).
import { supabase } from "./supabase-init.js";

let currentUser = null; // { uid, nome, email, role, ativo }

function readCache() {
    try { return JSON.parse(sessionStorage.getItem("auxiliarOdontUser") || "null"); }
    catch { return null; }
}

function writeCache(user) {
    sessionStorage.setItem("auxiliarOdontUser", JSON.stringify(user));
}

/**
 * Carrega o perfil do usuário da tabela public.usuarios.
 * Se o perfil não existir (usuário acabou de confirmar e-mail e fazer o primeiro login),
 * cria automaticamente com os metadados salvos no signUp.
 *
 * Isso contorna a limitação de FK quando a confirmação de email está ativa:
 * o perfil só é criado DEPOIS que o usuário existe de fato em auth.users.
 */
async function loadProfile(authUser) {
    const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();  // maybeSingle em vez de single: não dá erro se não achar

    // Perfil já existe → retorna normalmente
    if (data) {
        return {
            uid: authUser.id,
            nome: data.nome,
            email: data.email,
            role: data.role,
            ativo: data.ativo
        };
    }

    // Perfil não existe → cria automaticamente com os metadados do signUp
    // (o admin preencheu "nome", "role", "ativo" no user_metadata ao cadastrar)
    const meta = authUser.user_metadata || {};
    const novoPerfil = {
        id: authUser.id,
        nome: meta.nome || authUser.email.split("@")[0],
        email: authUser.email,
        role: meta.role || "vendedor",
        ativo: meta.ativo !== false
    };

    const { data: criado, error: errInsert } = await supabase
        .from("usuarios")
        .insert(novoPerfil)
        .select()
        .single();

    if (errInsert) {
        console.error("Erro ao criar perfil automaticamente:", errInsert);
        return null;
    }

    return {
        uid: criado.id,
        nome: criado.nome,
        email: criado.email,
        role: criado.role,
        ativo: criado.ativo
    };
}

/** Resolve quando o estado de autenticação do Supabase é conhecido. */
async function waitForAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        currentUser = null;
        sessionStorage.removeItem("auxiliarOdontUser");
        return null;
    }

    const profile = await loadProfile(session.user);

    // Se o perfil foi criado mas está inativo, desloga e avisa
    if (profile && profile.ativo === false) {
        await supabase.auth.signOut();
        sessionStorage.removeItem("auxiliarOdontUser");
        sessionStorage.setItem("authError", "Sua conta está inativa. Contate o administrador.");
        currentUser = null;
        return null;
    }

    currentUser = profile;
    if (profile) writeCache(profile);
    return profile;
}

/** Garante que existe um usuário autenticado; senão redireciona para o login. */
export async function requireAuth() {
    const cached = readCache();
    if (cached) currentUser = cached; // exibe UI imediatamente, sem "piscar"
    const user = await waitForAuth();
    if (!user) {
        window.location.href = "login.html";
        return null;
    }
    return user;
}

/** Garante que o usuário autenticado é admin; senão redireciona para o dashboard. */
export async function requireAdmin() {
    const user = await requireAuth();
    if (user && user.role !== "admin") {
        window.location.href = "dashboard.html";
        return null;
    }
    return user;
}

export function getCurrentUser() {
    return currentUser || readCache();
}

export async function logout() {
    await supabase.auth.signOut();
    sessionStorage.removeItem("auxiliarOdontUser");
    window.location.href = "login.html";
}