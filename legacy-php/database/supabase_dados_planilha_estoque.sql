-- DADOS IMPORTADOS DE Controle_de_Estoque.xlsx (aba 'Estoque' + aba 'Movimentacoes')
-- Gerado automaticamente. Execute DEPOIS do supabase_migration_v2_seguranca_estoque.sql.
-- Idempotente para produtos (upsert por codigo_barras); as saidas historicas so sao inseridas se ainda nao existirem.

insert into produtos (codigo_barras, nome, unidade, quantidade, estoque_minimo, categoria, preco, validade)
values
  ('01-001', 'Microbrush', 'Tubos', 20, 5, 'Dentística', 0, null),
  ('01-002', 'Adesivo Universal', 'Tubos', 3, 2, 'Dentística', 0, null),
  ('01-003', 'Ácido Fosfórico 37%', 'Tubos', 0, 8, 'Dentística', 0, null),
  ('01-004', 'Ionômero de Vidro', 'Frasco', 3, 4, 'Dentística', 0, null),
  ('01-005', 'Benzotop', 'Frasco', 4, 2, 'Dentística', 0, null),
  ('01-006', 'Cimento reparador MTA (2 aplicações)', 'Frasco', 2, 2, 'Dentística', 0, null),
  ('01-007', 'Cimento de hidróxido de cálcio (Dentística)', 'Frasco', 3, 2, 'Dentística', 0, null),
  ('01-008', 'Banda matriz aço 7 mm', 'Unidade', 13, 6, 'Dentística', 0, null),
  ('01-009', 'Banda matriz aço 5 mm', 'Unidade', 26, 6, 'Dentística', 0, null),
  ('01-010', 'Inter-A (material restaurador intermediário)', 'Frasco', 1, 2, 'Dentística', 0, null),
  ('01-011', 'Coroa Hable adulto', 'Pacote', 1, 1, 'Dentística', 0, null),
  ('01-012', 'Coroa Hable pediátrica', 'Pacote', 1, 1, 'Dentística', 0, null),
  ('01-013', 'Resina composta A1E', 'Unidade', 2, 1, 'Dentística', 0, null),
  ('01-014', 'Resina composta A2E', 'Unidade', 2, 2, 'Dentística', 0, null),
  ('01-015', 'Resina composta A3E', 'Unidade', 1, 4, 'Dentística', 0, null),
  ('01-016', 'Resina composta A1B', 'Unidade', 1, 1, 'Dentística', 0, null),
  ('01-017', 'Resina composta A2B', 'Unidade', 0, 2, 'Dentística', 0, null),
  ('01-018', 'Resina composta A3B', 'Unidade', 0, 4, 'Dentística', 0, null),
  ('01-019', 'Resina composta A3.5B', 'Unidade', 0, 4, 'Dentística', 0, null),
  ('01-020', 'Forrador Dentinário Liner', 'Unidade', 0, 2, 'Dentística', 0, null),
  ('01-021', 'Discos de lixa P/M/G com mandril', 'Pacote', 5, 2, 'Dentística', 0, null),
  ('01-022', 'Disco de lixa M com mandril', 'Pacote', 1, 2, 'Dentística', 0, null),
  ('01-023', 'Bloco de papel p/ espatulação', 'Bloco', 3, 4, 'Dentística', 0, null),
  ('01-024', 'Arco Young plástico', 'Unidade', 2, 2, 'Dentística', 0, null),
  ('01-025', 'Fio dental', 'Unidade', 9, 6, 'Dentística', 0, null),
  ('01-026', 'Disco de lixa superfino s/ mandril', 'Pacote', 7, 4, 'Dentística', 0, null),
  ('01-027', 'Disco de lixa grosso s/ mandril', 'Pacote', 4, 4, 'Dentística', 0, null),
  ('01-028', 'Tira de poliéster p/ acabamento', 'Pacote', 14, 4, 'Dentística', 0, null),
  ('01-029', 'Tira de poliéster transparente', 'Pacote', 15, 4, 'Dentística', 0, null),
  ('01-030', 'Cunha de madeira', 'Pacote', 7, 4, 'Dentística', 0, null),
  ('01-031', 'Papel carbono', 'Pacote', 70, 8, 'Dentística', 0, null),
  ('01-032', 'Fio retrator', 'Unidade', 2, 2, 'Dentística', 0, null),
  ('02-001', 'Esponja Hemostática', 'Pacote', 1, 2, 'Cirurgia', 0, null),
  ('02-002', 'Líquido Hemostático', 'Frasco', 1, 2, 'Cirurgia', 0, null),
  ('02-003', 'Lâmina de bisturi', 'Caixa', 2, 2, 'Cirurgia', 0, null),
  ('02-004', 'Agulha 22 G (preta)', 'Caixa', 6, 2, 'Cirurgia', 0, null),
  ('02-005', 'Fio de sutura', 'Caixa', 4, 2, 'Cirurgia', 0, null),
  ('03-001', 'Bicarbonato de sódio', 'Caixa', 9, 2, 'Periodontia', 0, null),
  ('04-001', 'NDP', 'Caixa', 1, 2, 'Endodontia', 0, null),
  ('04-002', 'PRP', 'Caixa', 0, 2, 'Endodontia', 0, null),
  ('04-003', 'Eucaliptol', 'Frasco', 1, 1, 'Endodontia', 0, null),
  ('04-004', 'Lençol de borracha', 'Caixa', 9, 2, 'Endodontia', 0, null),
  ('04-005', 'Formocresol', 'Unidade', 0, 2, 'Endodontia', 0, null),
  ('04-006', 'Cone de papel absorvente 45-80', 'Pacote', 22, 2, 'Endodontia', 0, null),
  ('04-007', 'Cone de papel absorvente 15', 'Pacote', 4, 2, 'Endodontia', 0, null),
  ('04-008', 'Cone de papel absorvente 20', 'Pacote', 5, 2, 'Endodontia', 0, null),
  ('04-009', 'Cone de papel absorvente 25', 'Pacote', 3, 2, 'Endodontia', 0, null),
  ('04-010', 'Cone de papel absorvente 30', 'Pacote', 3, 2, 'Endodontia', 0, null),
  ('04-011', 'Cone de papel absorvente 35', 'Pacote', 1, 2, 'Endodontia', 0, null),
  ('04-012', 'Cone de papel absorvente 60', 'Pacote', 3, 2, 'Endodontia', 0, null),
  ('04-013', 'Cone de papel absorvente 80', 'Pacote', 4, 2, 'Endodontia', 0, null),
  ('05-001', 'Agulha curta', 'Caixa', 5, 2, 'Consumíveis', 0, null),
  ('05-002', 'Filmes radiográficos', 'Caixa', 7, 2, 'Consumíveis', 0, null),
  ('05-003', 'Sugador cirúrgico', 'Unidade', 8, 2, 'Consumíveis', 0, null),
  ('05-004', 'Caixa descarpack pequena 3 L', 'Unidade', 8, 4, 'Consumíveis', 0, null),
  ('05-005', 'Touca descartável', 'Pacote', 9, 4, 'Consumíveis', 0, null),
  ('05-006', 'Máscara N95', 'Unidade', 220, 150, 'Consumíveis', 0, null),
  ('05-007', 'Máscara descartável', 'Caixa', 9, 6, 'Consumíveis', 0, null),
  ('05-008', 'Avental cirúrgico', 'Unidade', 42, 12, 'Consumíveis', 0, null),
  ('05-009', 'Avental de TNT', 'Unidade', 928, 300, 'Consumíveis', 0, null),
  ('05-010', 'Avental de plástico', 'Unidade', 390, 100, 'Consumíveis', 0, null),
  ('05-011', 'Rolete de algodão', 'Pacote', 300, 100, 'Consumíveis', 0, null),
  ('05-012', 'Sugador', 'Pacote', 150, 50, 'Consumíveis', 0, null),
  ('05-013', 'Seringa 10 mL', 'Unidade', 250, 50, 'Consumíveis', 0, null),
  ('05-014', 'Saco Geladinho', 'Unidade', 20000, 2000, 'Consumíveis', 0, null),
  ('05-015', 'Papel grau cirúrgico 150 mm', 'Unidade', 0, 2, 'Consumíveis', 0, null),
  ('05-016', 'Papel grau cirúrgico 200 mm', 'Unidade', 1, 1, 'Consumíveis', 0, null),
  ('05-017', 'Álcool 70%', 'Unidade', 26, 12, 'Consumíveis', 0, null),
  ('05-018', 'Revelador', 'Unidade', 6, 6, 'Consumíveis', 0, null),
  ('05-019', 'Fixador', 'Unidade', 14, 6, 'Consumíveis', 0, null),
  ('05-020', 'Álcool em gel', 'Unidade', 13, 6, 'Consumíveis', 0, null),
  ('05-021', 'Detergente enzimático', 'Unidade', 3, 2, 'Consumíveis', 0, null),
  ('05-022', 'Hipoclorito de sódio 2,5%', 'Unidade', 3, 4, 'Consumíveis', 0, null),
  ('05-023', 'Guardanapo', 'Pacote', 52, 25, 'Consumíveis', 0, null),
  ('05-024', 'Água destilada', 'Galão', 26, 10, 'Consumíveis', 0, null),
  ('05-025', 'Babador', 'Pacote', 60, 25, 'Consumíveis', 0, null),
  ('05-026', 'Gaze', 'Pacote', 71, 25, 'Consumíveis', 0, null),
  ('05-027', 'Flúor 2%', 'Unidade', 7, 4, 'Consumíveis', 0, null),
  ('05-028', 'Flúor 1,23%', 'Unidade', 8, 4, 'Consumíveis', 0, null),
  ('05-029', 'Clorexidina 2% (lavar mãos)', 'Unidade', 1, 2, 'Consumíveis', 0, null),
  ('05-030', 'Anestésico Prilocaína', 'Caixa', 0, 2, 'Consumíveis', 0, null),
  ('05-031', 'Anestésico Lidocaína', 'Caixa', 0, 2, 'Consumíveis', 0, null),
  ('05-032', 'Anestésico Mepivacaína', 'Caixa', 0, 4, 'Consumíveis', 0, null),
  ('05-033', 'Anestésico Articaína', 'Caixa', 0, 2, 'Consumíveis', 0, null),
  ('05-034', 'Fita adesiva autoclavavél', 'Unidade', 0, 12, 'Consumíveis', 0, null),
  ('05-035', 'Agulha longa', 'Caixa', 0, 2, 'Consumíveis', 0, null),
  ('06-001', 'Cimento resinoso (prótese) Dual', 'Unidade', 1, 2, 'Prótese', 0, null),
  ('06-002', 'Pote Dappen plástico/silicone', 'Unidade', 4, 2, 'Prótese', 0, null),
  ('06-003', 'Eugenol', 'Unidade', 0, 2, 'Prótese', 0, null),
  ('07-001', 'Jacarés', 'Unidade', 2, 0, 'Instrumental', 0, null),
  ('07-002', 'Sonda exploradora nº 5', 'Unidade', 9, 0, 'Instrumental', 0, null),
  ('07-003', 'Espátula p/ resina Ward', 'Unidade', 5, 0, 'Instrumental', 0, null),
  ('07-004', 'Sonda Carolina do Norte', 'Unidade', 5, 0, 'Instrumental', 0, null),
  ('07-005', 'Tesoura Goldmann Fox', 'Unidade', 5, 0, 'Instrumental', 0, null),
  ('07-006', 'Cabo p/ espelho', 'Unidade', 22, 0, 'Instrumental', 0, null),
  ('07-007', 'Espelho nº 5', 'Unidade', 21, 0, 'Instrumental', 0, null)
on conflict (codigo_barras) do update set
  nome = excluded.nome,
  unidade = excluded.unidade,
  quantidade = excluded.quantidade,
  estoque_minimo = excluded.estoque_minimo,
  categoria = excluded.categoria,
  atualizado_em = now();

-- Historico de movimentacoes (aba 'Movimentacoes' da planilha).
insert into saidas_produtos (produto_id, produto_nome, quantidade, usuario_id, usuario_nome, observacao, data_saida)
select id, 'Ácido Fosfórico 37%', 1, null, 'Importação da planilha', 'Importado da planilha Controle_de_Estoque.xlsx', '2026-08-12 00:00:00'
from produtos where codigo_barras = '01-003'
and not exists (
  select 1 from saidas_produtos where produto_id = produtos.id and data_saida = '2026-08-12 00:00:00' and quantidade = 1
);

insert into historico (usuario_id, usuario_nome, produto_id, produto_nome, acao, descricao, data_acao)
select null, 'Importação da planilha', id, 'Ácido Fosfórico 37%', 'Saída', 'Saída de 1 unidade(s) (importado da planilha)', '2026-08-12 00:00:00'
from produtos where codigo_barras = '01-003'
and not exists (
  select 1 from historico where produto_id = produtos.id and data_acao = '2026-08-12 00:00:00' and acao = 'Saída' and descricao = 'Saída de 1 unidade(s) (importado da planilha)'
);

insert into saidas_produtos (produto_id, produto_nome, quantidade, usuario_id, usuario_nome, observacao, data_saida)
select id, 'Avental de TNT', 2, null, 'Importação da planilha', 'Importado da planilha Controle_de_Estoque.xlsx', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-009'
and not exists (
  select 1 from saidas_produtos where produto_id = produtos.id and data_saida = '2026-08-25 00:00:00' and quantidade = 2
);

insert into historico (usuario_id, usuario_nome, produto_id, produto_nome, acao, descricao, data_acao)
select null, 'Importação da planilha', id, 'Avental de TNT', 'Saída', 'Saída de 2 unidade(s) (importado da planilha)', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-009'
and not exists (
  select 1 from historico where produto_id = produtos.id and data_acao = '2026-08-25 00:00:00' and acao = 'Saída' and descricao = 'Saída de 2 unidade(s) (importado da planilha)'
);

insert into saidas_produtos (produto_id, produto_nome, quantidade, usuario_id, usuario_nome, observacao, data_saida)
select id, 'Gaze', 2, null, 'Importação da planilha', 'Importado da planilha Controle_de_Estoque.xlsx', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-026'
and not exists (
  select 1 from saidas_produtos where produto_id = produtos.id and data_saida = '2026-08-25 00:00:00' and quantidade = 2
);

insert into historico (usuario_id, usuario_nome, produto_id, produto_nome, acao, descricao, data_acao)
select null, 'Importação da planilha', id, 'Gaze', 'Saída', 'Saída de 2 unidade(s) (importado da planilha)', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-026'
and not exists (
  select 1 from historico where produto_id = produtos.id and data_acao = '2026-08-25 00:00:00' and acao = 'Saída' and descricao = 'Saída de 2 unidade(s) (importado da planilha)'
);

insert into saidas_produtos (produto_id, produto_nome, quantidade, usuario_id, usuario_nome, observacao, data_saida)
select id, 'Guardanapo', 2, null, 'Importação da planilha', 'Importado da planilha Controle_de_Estoque.xlsx', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-023'
and not exists (
  select 1 from saidas_produtos where produto_id = produtos.id and data_saida = '2026-08-25 00:00:00' and quantidade = 2
);

insert into historico (usuario_id, usuario_nome, produto_id, produto_nome, acao, descricao, data_acao)
select null, 'Importação da planilha', id, 'Guardanapo', 'Saída', 'Saída de 2 unidade(s) (importado da planilha)', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-023'
and not exists (
  select 1 from historico where produto_id = produtos.id and data_acao = '2026-08-25 00:00:00' and acao = 'Saída' and descricao = 'Saída de 2 unidade(s) (importado da planilha)'
);

insert into saidas_produtos (produto_id, produto_nome, quantidade, usuario_id, usuario_nome, observacao, data_saida)
select id, 'Água destilada', 1, null, 'Importação da planilha', 'Importado da planilha Controle_de_Estoque.xlsx', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-024'
and not exists (
  select 1 from saidas_produtos where produto_id = produtos.id and data_saida = '2026-08-25 00:00:00' and quantidade = 1
);

insert into historico (usuario_id, usuario_nome, produto_id, produto_nome, acao, descricao, data_acao)
select null, 'Importação da planilha', id, 'Água destilada', 'Saída', 'Saída de 1 unidade(s) (importado da planilha)', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-024'
and not exists (
  select 1 from historico where produto_id = produtos.id and data_acao = '2026-08-25 00:00:00' and acao = 'Saída' and descricao = 'Saída de 1 unidade(s) (importado da planilha)'
);

insert into saidas_produtos (produto_id, produto_nome, quantidade, usuario_id, usuario_nome, observacao, data_saida)
select id, 'Álcool 70%', 1, null, 'Importação da planilha', 'Importado da planilha Controle_de_Estoque.xlsx', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-017'
and not exists (
  select 1 from saidas_produtos where produto_id = produtos.id and data_saida = '2026-08-25 00:00:00' and quantidade = 1
);

insert into historico (usuario_id, usuario_nome, produto_id, produto_nome, acao, descricao, data_acao)
select null, 'Importação da planilha', id, 'Álcool 70%', 'Saída', 'Saída de 1 unidade(s) (importado da planilha)', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-017'
and not exists (
  select 1 from historico where produto_id = produtos.id and data_acao = '2026-08-25 00:00:00' and acao = 'Saída' and descricao = 'Saída de 1 unidade(s) (importado da planilha)'
);

insert into saidas_produtos (produto_id, produto_nome, quantidade, usuario_id, usuario_nome, observacao, data_saida)
select id, 'Babador', 1, null, 'Importação da planilha', 'Importado da planilha Controle_de_Estoque.xlsx', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-025'
and not exists (
  select 1 from saidas_produtos where produto_id = produtos.id and data_saida = '2026-08-25 00:00:00' and quantidade = 1
);

insert into historico (usuario_id, usuario_nome, produto_id, produto_nome, acao, descricao, data_acao)
select null, 'Importação da planilha', id, 'Babador', 'Saída', 'Saída de 1 unidade(s) (importado da planilha)', '2026-08-25 00:00:00'
from produtos where codigo_barras = '05-025'
and not exists (
  select 1 from historico where produto_id = produtos.id and data_acao = '2026-08-25 00:00:00' and acao = 'Saída' and descricao = 'Saída de 1 unidade(s) (importado da planilha)'
);

