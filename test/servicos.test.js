const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularComissoes, calcularJuros, movimentarEstoque, percentualComissao } = require('../servicos');

test('aplica as faixas de comissão, inclusive nos limites', () => {
  assert.equal(percentualComissao(99.99), 0);
  assert.equal(percentualComissao(100), 0.01);
  assert.equal(percentualComissao(499.99), 0.01);
  assert.equal(percentualComissao(500), 0.05);
});

test('consolida as comissões por vendedor', () => {
  assert.deepEqual(calcularComissoes([
    { vendedor: 'Ana', valor: 99 },
    { vendedor: 'Ana', valor: 100 },
    { vendedor: 'Ana', valor: 500 }
  ]), [{ vendedor: 'Ana', totalVendas: 699, comissao: 26 }]);
});

test('registra entrada e saída sem permitir estoque negativo ou id repetido', () => {
  const estoque = [{ codigoProduto: 1, descricaoProduto: 'Produto', estoque: 10 }];
  const movimentacoes = [];
  movimentarEstoque(estoque, movimentacoes, { id: 'MOV-1', descricao: 'Reposição', tipo: 'ENTRADA', codigoProduto: 1, quantidade: 5 });
  assert.equal(estoque[0].estoque, 15);
  movimentarEstoque(estoque, movimentacoes, { id: 'MOV-2', descricao: 'Venda', tipo: 'SAIDA', codigoProduto: 1, quantidade: 3 });
  assert.equal(estoque[0].estoque, 12);
  assert.throws(() => movimentarEstoque(estoque, movimentacoes, { id: 'MOV-2', descricao: 'Duplicada', tipo: 'ENTRADA', codigoProduto: 1, quantidade: 1 }));
  assert.throws(() => movimentarEstoque(estoque, movimentacoes, { id: 'MOV-3', descricao: 'Saída excessiva', tipo: 'SAIDA', codigoProduto: 1, quantidade: 13 }));
});

test('calcula juros simples de 2,5% ao dia apenas após o vencimento', () => {
  const hoje = new Date(2026, 9, 4);
  assert.deepEqual(calcularJuros(100, '2026-10-02', hoje), { diasAtraso: 2, juros: 5, valorAtualizado: 105 });
  assert.deepEqual(calcularJuros(100, '2026-10-04', hoje), { diasAtraso: 0, juros: 0, valorAtualizado: 100 });
});
