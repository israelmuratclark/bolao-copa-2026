-- ============================================================
-- Funções e Triggers PostgreSQL para o Bolão Copa 2026
-- Execute este arquivo no SQL Editor do Supabase Dashboard
-- ============================================================

-- ----------------------------------------------------------------
-- 1. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE selecoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE apostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE premios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- usuarios: usuário vê/edita apenas a si mesmo; admin vê todos
CREATE POLICY "usuarios_self_select" ON usuarios
  FOR SELECT USING (auth.uid()::text = auth_id OR
    (SELECT role FROM usuarios WHERE auth_id = auth.uid()::text) = 'admin');

CREATE POLICY "usuarios_self_update" ON usuarios
  FOR UPDATE USING (auth.uid()::text = auth_id);

-- selecoes: leitura pública autenticada
CREATE POLICY "selecoes_read" ON selecoes
  FOR SELECT TO authenticated USING (true);

-- jogos: leitura pública autenticada; escrita apenas admin
CREATE POLICY "jogos_read" ON jogos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "jogos_admin_write" ON jogos
  FOR ALL USING (
    (SELECT role FROM usuarios WHERE auth_id = auth.uid()::text) = 'admin'
  );

-- apostas: usuário gerencia apenas as suas
CREATE POLICY "apostas_own" ON apostas
  FOR ALL USING (
    usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()::text)
  );

-- pontuacoes: leitura autenticada pública; escrita via service_role apenas
CREATE POLICY "pontuacoes_read" ON pontuacoes
  FOR SELECT TO authenticated USING (true);

-- pagamentos: usuário vê os seus; admin vê todos
CREATE POLICY "pagamentos_own" ON pagamentos
  FOR SELECT USING (
    usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()::text)
    OR (SELECT role FROM usuarios WHERE auth_id = auth.uid()::text) = 'admin'
  );

-- premios: leitura pública autenticada
CREATE POLICY "premios_read" ON premios
  FOR SELECT TO authenticated USING (true);

-- configuracoes: leitura pública autenticada; escrita apenas admin
CREATE POLICY "configuracoes_read" ON configuracoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "configuracoes_admin_write" ON configuracoes
  FOR ALL USING (
    (SELECT role FROM usuarios WHERE auth_id = auth.uid()::text) = 'admin'
  );


-- ----------------------------------------------------------------
-- 2. REALTIME — habilitar para leaderboard e pagamentos
-- ----------------------------------------------------------------

-- Habilitar publicação Realtime nas tabelas necessárias
BEGIN;
  -- pontuacoes: para atualização do leaderboard em tempo real
  ALTER PUBLICATION supabase_realtime ADD TABLE pontuacoes;
  -- usuarios: para detectar confirmação de pagamento (campo pago)
  ALTER PUBLICATION supabase_realtime ADD TABLE usuarios;
COMMIT;


-- ----------------------------------------------------------------
-- 3. VIEW — classificação geral (usada pelo leaderboard)
-- ----------------------------------------------------------------

CREATE OR REPLACE VIEW placar_geral AS
SELECT
  u.id AS usuario_id,
  u.nome,
  p.total_pontos,
  p.acertos_exatos,
  p.acertos_parciais,
  p.jogos_apostados,
  RANK() OVER (
    ORDER BY
      p.total_pontos DESC,
      p.acertos_exatos DESC,
      p.acertos_parciais DESC,
      p.jogos_apostados DESC,
      u.criado_em ASC
  ) AS posicao
FROM usuarios u
JOIN pontuacoes p ON p.usuario_id = u.id
WHERE u.pago = TRUE;


-- ----------------------------------------------------------------
-- 4. FUNÇÃO DE CÁLCULO DE PONTOS (para uso avançado/manual)
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION calcular_pontos_aposta(
  gols_mandante_aposta INT,
  gols_visitante_aposta INT,
  gols_mandante_resultado INT,
  gols_visitante_resultado INT
)
RETURNS INT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Placar exato: 10 pontos
  IF gols_mandante_aposta = gols_mandante_resultado
     AND gols_visitante_aposta = gols_visitante_resultado THEN
    RETURN 10;
  END IF;

  -- Empate correto (apostou empate, resultou empate): 3 pontos
  IF gols_mandante_aposta = gols_visitante_aposta
     AND gols_mandante_resultado = gols_visitante_resultado THEN
    RETURN 3;
  END IF;

  -- Vencedor correto: 5 pontos
  IF (gols_mandante_aposta > gols_visitante_aposta AND gols_mandante_resultado > gols_visitante_resultado)
     OR (gols_mandante_aposta < gols_visitante_aposta AND gols_mandante_resultado < gols_visitante_resultado) THEN
    RETURN 5;
  END IF;

  RETURN 0;
END;
$$;


-- ----------------------------------------------------------------
-- 5. FUNÇÃO: recalcular_pontuacao_usuario (utilitário admin)
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION recalcular_pontuacao_usuario(p_usuario_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INT := 0;
  v_exatos INT := 0;
  v_parciais INT := 0;
  v_apostados INT := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      a.id,
      a.gols_mandante AS am,
      a.gols_visitante AS av,
      j.gols_mandante AS rm,
      j.gols_visitante AS rv,
      j.status
    FROM apostas a
    JOIN jogos j ON j.id = a.jogo_id
    WHERE a.usuario_id = p_usuario_id
      AND j.status = 'encerrado'
      AND j.gols_mandante IS NOT NULL
  LOOP
    DECLARE
      v_pontos INT;
    BEGIN
      v_pontos := calcular_pontos_aposta(r.am, r.av, r.rm, r.rv);
      v_apostados := v_apostados + 1;
      v_total := v_total + v_pontos;

      IF v_pontos = 10 THEN
        v_exatos := v_exatos + 1;
      ELSIF v_pontos IN (3, 5) THEN
        v_parciais := v_parciais + 1;
      END IF;

      UPDATE apostas SET pontos_obtidos = v_pontos, calculado_em = NOW()
      WHERE id = r.id;
    END;
  END LOOP;

  INSERT INTO pontuacoes (usuario_id, total_pontos, acertos_exatos, acertos_parciais, jogos_apostados)
  VALUES (p_usuario_id, v_total, v_exatos, v_parciais, v_apostados)
  ON CONFLICT (usuario_id) DO UPDATE SET
    total_pontos = EXCLUDED.total_pontos,
    acertos_exatos = EXCLUDED.acertos_exatos,
    acertos_parciais = EXCLUDED.acertos_parciais,
    jogos_apostados = EXCLUDED.jogos_apostados;
END;
$$;
