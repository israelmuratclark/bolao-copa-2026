/**
 * Database adapter: replaces Prisma with Supabase JS client (HTTP-based).
 * This bypasses the broken PostgreSQL TCP pooler and uses the Supabase REST API.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// snake_case → camelCase (recursive)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function camel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(camel);
  if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, l: string) => l.toUpperCase()),
        camel(v),
      ])
    );
  }
  return obj;
}

// camelCase → snake_case (shallow, for write operations)
function snakeize(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const snakeKey = k.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    result[snakeKey] = v instanceof Date ? v.toISOString() : v;
  }
  return result;
}

// ─── USUARIO ────────────────────────────────────────────────────────────────

const usuario = {
  async count(args?: { where?: { pago?: boolean } }) {
    const sb = getClient();
    let q = sb.from("usuarios").select("*", { count: "exact", head: true });
    if (args?.where?.pago !== undefined) q = q.eq("pago", args.where.pago);
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  },

  async findUnique(args: {
    where: { authId?: string; id?: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select?: Record<string, boolean>;
    include?: { pontuacao?: boolean };
  }) {
    const sb = getClient();
    const selectStr = args.include?.pontuacao
      ? "*, pontuacao:pontuacoes(*)"
      : "*";
    let q = sb.from("usuarios").select(selectStr);
    if (args.where.authId) q = q.eq("auth_id", args.where.authId);
    if (args.where.id) q = q.eq("id", args.where.id);
    const { data, error } = await q.limit(1).maybeSingle();
    if (error) throw error;
    return camel(data);
  },

  async findMany(args?: {
    include?: { pontuacao?: boolean };
    orderBy?: { criadoEm?: "asc" | "desc" };
    where?: { pago?: boolean };
  }) {
    const sb = getClient();
    const selectStr = args?.include?.pontuacao
      ? "*, pontuacao:pontuacoes(*)"
      : "*";
    let q = sb.from("usuarios").select(selectStr);
    if (args?.where?.pago !== undefined) q = q.eq("pago", args.where.pago);
    if (args?.orderBy?.criadoEm)
      q = q.order("criado_em", {
        ascending: args.orderBy.criadoEm === "asc",
      });
    const { data, error } = await q;
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return camel(data) as any[];
  },

  async upsert(args: {
    where: { authId: string };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) {
    const sb = getClient();
    const { data: existing } = await sb
      .from("usuarios")
      .select("id")
      .eq("auth_id", args.where.authId)
      .maybeSingle();

    if (existing) {
      if (Object.keys(args.update).length > 0) {
        const { data, error } = await sb
          .from("usuarios")
          .update(snakeize(args.update))
          .eq("auth_id", args.where.authId)
          .select()
          .single();
        if (error) throw error;
        return camel(data);
      }
      const { data, error } = await sb
        .from("usuarios")
        .select()
        .eq("auth_id", args.where.authId)
        .single();
      if (error) throw error;
      return camel(data);
    }

    const { data, error } = await sb
      .from("usuarios")
      .insert(snakeize(args.create))
      .select()
      .single();
    if (error) throw error;
    return camel(data);
  },

  async update(args: {
    where: { authId?: string; id?: string };
    data: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select?: Record<string, boolean>;
  }) {
    const sb = getClient();
    let q = sb.from("usuarios").update(snakeize(args.data));
    if (args.where.authId) q = q.eq("auth_id", args.where.authId);
    if (args.where.id) q = q.eq("id", args.where.id);
    const { data, error } = await q.select().single();
    if (error) throw error;
    return camel(data);
  },
};

// ─── JOGO ────────────────────────────────────────────────────────────────────

const jogo = {
  async count(args?: { where?: { status?: string } }) {
    const sb = getClient();
    let q = sb.from("jogos").select("*", { count: "exact", head: true });
    if (args?.where?.status) q = q.eq("status", args.where.status);
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  },

  async findUnique(args: {
    where: { id: number };
    include?: { mandante?: boolean; visitante?: boolean };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select?: Record<string, boolean>;
  }) {
    const sb = getClient();
    let selectStr = "*";
    if (args.include?.mandante || args.include?.visitante) {
      selectStr =
        "*, mandante:selecoes!mandante_id(*), visitante:selecoes!visitante_id(*)";
    }
    const { data, error } = await sb
      .from("jogos")
      .select(selectStr)
      .eq("id", args.where.id)
      .maybeSingle();
    if (error) throw error;
    return camel(data);
  },

  async findMany(args?: {
    include?: { mandante?: boolean; visitante?: boolean };
    orderBy?:
      | { dataHoraUtc?: "asc" | "desc" }
      | Array<{ fase?: "asc" | "desc"; numeroJogo?: "asc" | "desc"; dataHoraUtc?: "asc" | "desc" }>;
    where?: {
      status?: string;
      prazoApostas?: { gt?: Date };
    };
    take?: number;
  }) {
    const sb = getClient();
    const hasJoin = args?.include?.mandante || args?.include?.visitante;
    const selectStr = hasJoin
      ? "*, mandante:selecoes!mandante_id(*), visitante:selecoes!visitante_id(*)"
      : "*";

    let q = sb.from("jogos").select(selectStr);

    if (args?.where?.status) q = q.eq("status", args.where.status);
    if (args?.where?.prazoApostas?.gt)
      q = q.gt(
        "prazo_apostas",
        args.where.prazoApostas.gt.toISOString()
      );

    // Handle orderBy (single or array)
    const orderBy = args?.orderBy;
    if (orderBy) {
      const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
      for (const ob of orders) {
        for (const [key, dir] of Object.entries(ob)) {
          const col = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
          q = q.order(col, { ascending: dir === "asc" });
        }
      }
    }

    if (args?.take) q = q.limit(args.take);

    const { data, error } = await q;
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return camel(data) as any[];
  },

  async update(args: {
    where: { id: number };
    data: Record<string, unknown>;
  }) {
    const sb = getClient();
    const { data, error } = await sb
      .from("jogos")
      .update(snakeize(args.data))
      .eq("id", args.where.id)
      .select()
      .single();
    if (error) throw error;
    return camel(data);
  },
};

// ─── APOSTA ──────────────────────────────────────────────────────────────────

const aposta = {
  async count(args?: { where?: { usuarioId?: string; jogoId?: number } }) {
    const sb = getClient();
    let q = sb.from("apostas").select("*", { count: "exact", head: true });
    if (args?.where?.usuarioId) q = q.eq("usuario_id", args.where.usuarioId);
    if (args?.where?.jogoId) q = q.eq("jogo_id", args.where.jogoId);
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  },

  async findMany(args?: {
    where?: { usuarioId?: string; jogoId?: number };
    include?: {
      usuario?: boolean;
      jogo?: boolean | { include?: { mandante?: boolean; visitante?: boolean } };
    };
    orderBy?: { criadoEm?: "asc" | "desc" };
    take?: number;
  }) {
    const sb = getClient();

    let selectStr = "*";
    if (args?.include?.usuario) selectStr += ", usuario:usuarios(*)";
    if (args?.include?.jogo) {
      const jogoInclude = args.include.jogo;
      const deepJoin =
        typeof jogoInclude === "object" && jogoInclude.include?.mandante;
      if (deepJoin) {
        selectStr +=
          ", jogo:jogos!jogo_id(*, mandante:selecoes!mandante_id(*), visitante:selecoes!visitante_id(*))";
      } else {
        selectStr += ", jogo:jogos!jogo_id(*)";
      }
    }

    let q = sb.from("apostas").select(selectStr);
    if (args?.where?.usuarioId) q = q.eq("usuario_id", args.where.usuarioId);
    if (args?.where?.jogoId) q = q.eq("jogo_id", args.where.jogoId);
    if (args?.orderBy?.criadoEm)
      q = q.order("criado_em", { ascending: args.orderBy.criadoEm === "asc" });
    if (args?.take) q = q.limit(args.take);

    const { data, error } = await q;
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return camel(data) as any[];
  },

  async upsert(args: {
    where: { usuarioId_jogoId: { usuarioId: string; jogoId: number } };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) {
    const sb = getClient();
    const { usuarioId, jogoId } = args.where.usuarioId_jogoId;

    const { data: existing } = await sb
      .from("apostas")
      .select("id")
      .eq("usuario_id", usuarioId)
      .eq("jogo_id", jogoId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await sb
        .from("apostas")
        .update(snakeize(args.update))
        .eq("usuario_id", usuarioId)
        .eq("jogo_id", jogoId)
        .select()
        .single();
      if (error) throw error;
      return camel(data);
    }

    const { data, error } = await sb
      .from("apostas")
      .insert(snakeize(args.create))
      .select()
      .single();
    if (error) throw error;
    return camel(data);
  },

  async update(args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) {
    const sb = getClient();
    const { data, error } = await sb
      .from("apostas")
      .update(snakeize(args.data))
      .eq("id", args.where.id)
      .select()
      .single();
    if (error) throw error;
    return camel(data);
  },
};

// ─── PONTUACAO ───────────────────────────────────────────────────────────────

type IncrementOrValue = { increment?: number } | number | undefined;

const pontuacao = {
  async findMany(args?: {
    include?: {
      usuario?: boolean | { select?: Record<string, boolean> };
    };
    where?: { usuario?: { pago?: boolean } };
  }) {
    const sb = getClient();
    const hasUserFilter = args?.where?.usuario?.pago !== undefined;

    // Use !inner to filter on related table
    let selectStr = "*";
    if (args?.include?.usuario) {
      selectStr = hasUserFilter
        ? "*, usuario:usuarios!inner(id, nome, pago, criado_em, chave_pix, email)"
        : "*, usuario:usuarios(id, nome, pago, criado_em, chave_pix, email)";
    }

    let q = sb.from("pontuacoes").select(selectStr);
    if (hasUserFilter)
      q = q.eq("usuarios.pago", args!.where!.usuario!.pago!);

    const { data, error } = await q;
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return camel(data) as any[];
  },

  async upsert(args: {
    where: { usuarioId: string };
    update: {
      totalPontos?: IncrementOrValue;
      acertosExatos?: IncrementOrValue;
      acertosParciais?: IncrementOrValue;
      jogosApostados?: IncrementOrValue;
    };
    create: Record<string, unknown>;
  }) {
    const sb = getClient();

    const { data: existing } = await sb
      .from("pontuacoes")
      .select("*")
      .eq("usuario_id", args.where.usuarioId)
      .maybeSingle();

    if (existing) {
      const updateData: Record<string, unknown> = {};

      const resolveVal = (
        key: string,
        val: IncrementOrValue
      ): number | undefined => {
        if (val === undefined) return undefined;
        if (typeof val === "number") return val;
        if (val.increment !== undefined)
          return (existing[key] as number) + val.increment;
        return undefined;
      };

      const tp = resolveVal("total_pontos", args.update.totalPontos);
      if (tp !== undefined) updateData["total_pontos"] = tp;

      const ae = resolveVal("acertos_exatos", args.update.acertosExatos);
      if (ae !== undefined) updateData["acertos_exatos"] = ae;

      const ap = resolveVal("acertos_parciais", args.update.acertosParciais);
      if (ap !== undefined) updateData["acertos_parciais"] = ap;

      const ja = resolveVal("jogos_apostados", args.update.jogosApostados);
      if (ja !== undefined) updateData["jogos_apostados"] = ja;

      if (Object.keys(updateData).length > 0) {
        const { data, error } = await sb
          .from("pontuacoes")
          .update(updateData)
          .eq("usuario_id", args.where.usuarioId)
          .select()
          .single();
        if (error) throw error;
        return camel(data);
      }
      return camel(existing);
    }

    const { data, error } = await sb
      .from("pontuacoes")
      .insert(snakeize(args.create))
      .select()
      .single();
    if (error) throw error;
    return camel(data);
  },
};

// ─── PAGAMENTO ───────────────────────────────────────────────────────────────

const pagamento = {
  async create(args: { data: Record<string, unknown> }) {
    const sb = getClient();
    const { data, error } = await sb
      .from("pagamentos")
      .insert(snakeize(args.data))
      .select()
      .single();
    if (error) throw error;
    return camel(data);
  },

  async findFirst(args: {
    where: {
      provedorPaymentId?: string;
      usuarioId?: string;
      status?: string;
      expiraEm?: { gt?: Date };
    };
    include?: { usuario?: boolean };
    orderBy?: { criadoEm?: "asc" | "desc" };
  }) {
    const sb = getClient();
    const selectStr = args.include?.usuario
      ? "*, usuario:usuarios(*)"
      : "*";
    let q = sb.from("pagamentos").select(selectStr);
    if (args.where.provedorPaymentId)
      q = q.eq("provedor_payment_id", args.where.provedorPaymentId);
    if (args.where.usuarioId) q = q.eq("usuario_id", args.where.usuarioId);
    if (args.where.status) q = q.eq("status", args.where.status);
    if (args.where.expiraEm?.gt)
      q = q.gt("expira_em", args.where.expiraEm.gt.toISOString());
    if (args.orderBy?.criadoEm)
      q = q.order("criado_em", {
        ascending: args.orderBy.criadoEm === "asc",
      });
    const { data, error } = await q.limit(1).maybeSingle();
    if (error) throw error;
    return camel(data);
  },

  async update(args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) {
    const sb = getClient();
    const { data, error } = await sb
      .from("pagamentos")
      .update(snakeize(args.data))
      .eq("id", args.where.id)
      .select()
      .single();
    if (error) throw error;
    return camel(data);
  },
};

// ─── PREMIO ──────────────────────────────────────────────────────────────────

const premio = {
  async findFirst(args?: { where?: { posicao?: number } }) {
    const sb = getClient();
    let q = sb.from("premios").select("*");
    if (args?.where?.posicao !== undefined)
      q = q.eq("posicao", args.where.posicao);
    const { data, error } = await q.limit(1).maybeSingle();
    if (error) throw error;
    return camel(data);
  },

  async findMany(args?: {
    where?: { posicao?: { in?: number[] } };
    include?: { usuario?: boolean | { select?: Record<string, boolean> } };
  }) {
    const sb = getClient();
    const selectStr = args?.include?.usuario ? "*, usuario:usuarios(*)" : "*";
    let q = sb.from("premios").select(selectStr);
    if (args?.where?.posicao?.in)
      q = q.in("posicao", args.where.posicao.in);
    const { data, error } = await q;
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return camel(data) as any[];
  },

  async upsert(args: {
    where: { id: number };
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }) {
    const sb = getClient();
    if (args.where.id && args.where.id !== 0) {
      const { data, error } = await sb
        .from("premios")
        .update(snakeize(args.update))
        .eq("id", args.where.id)
        .select()
        .single();
      if (error) throw error;
      return camel(data);
    }
    const { data, error } = await sb
      .from("premios")
      .insert(snakeize(args.create))
      .select()
      .single();
    if (error) throw error;
    return camel(data);
  },
};

// ─── CONFIGURACAO ────────────────────────────────────────────────────────────

const configuracao = {
  async findMany() {
    const sb = getClient();
    const { data, error } = await sb.from("configuracoes").select("*");
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []) as any[];
  },

  async upsert(args: {
    where: { chave: string };
    update: { valor: string };
    create: { chave: string; valor: string; descricao?: string };
  }) {
    const sb = getClient();
    const { data, error } = await sb
      .from("configuracoes")
      .upsert({ chave: args.create.chave, valor: args.update.valor })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── TRANSACTION (sequential, non-atomic) ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function $transaction(ops: Promise<any>[]) {
  const results = [];
  for (const op of ops) {
    results.push(await op);
  }
  return results;
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export const db = {
  usuario,
  jogo,
  aposta,
  pontuacao,
  pagamento,
  premio,
  configuracao,
  $transaction,
};
