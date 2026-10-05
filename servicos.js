function percentualComissao(valor) {
  if (valor < 100) return 0;
  if (valor < 500) return 0.01;
  return 0.05;
}

function calcularComissoes(vendas) {
  const totais = new Map();

  for (const venda of vendas) {
    const comissao = venda.valor * percentualComissao(venda.valor);
    const atual = totais.get(venda.vendedor) ?? { vendedor: venda.vendedor, totalVendas: 0, comissao: 0 };

    atual.totalVendas += venda.valor;
    atual.comissao += comissao;
    totais.set(venda.vendedor, atual);
  }

  return [...totais.values()].map((resultado) => ({
    ...resultado,
    totalVendas: arredondarMoeda(resultado.totalVendas),
    comissao: arredondarMoeda(resultado.comissao)
  }));
}

function movimentarEstoque(estoque, movimentacoes, movimentacao) {
  validarMovimentacao(movimentacao);

  if (movimentacoes.some(({ id }) => id === movimentacao.id)) {
    throw new Error('O identificador da movimentação já foi utilizado.');
  }

  const produto = estoque.find(({ codigoProduto }) => codigoProduto === movimentacao.codigoProduto);
  if (!produto) throw new Error('Produto não encontrado.');

  const quantidadeFinal = movimentacao.tipo === 'ENTRADA'
    ? produto.estoque + movimentacao.quantidade
    : produto.estoque - movimentacao.quantidade;

  if (quantidadeFinal < 0) throw new Error('Estoque insuficiente para realizar a saída.');

  produto.estoque = quantidadeFinal;
  movimentacoes.push({ ...movimentacao });
  return { ...produto };
}

function calcularJuros(valor, vencimento, hoje = new Date()) {
  if (!Number.isFinite(valor) || valor < 0) throw new Error('Informe um valor válido e não negativo.');

  const dataVencimento = converterDataIso(vencimento);
  const dataHoje = inicioDoDia(hoje);
  const diasAtraso = Math.max(0, Math.floor((dataHoje - dataVencimento) / 86_400_000));
  const juros = valor * 0.025 * diasAtraso;

  return { diasAtraso, juros: arredondarMoeda(juros), valorAtualizado: arredondarMoeda(valor + juros) };
}

function validarMovimentacao({ id, descricao, tipo, codigoProduto, quantidade }) {
  if (!String(id ?? '').trim()) throw new Error('O identificador da movimentação é obrigatório.');
  if (!String(descricao ?? '').trim()) throw new Error('A descrição da movimentação é obrigatória.');
  if (!['ENTRADA', 'SAIDA'].includes(tipo)) throw new Error('O tipo deve ser ENTRADA ou SAIDA.');
  if (!Number.isInteger(codigoProduto)) throw new Error('Código do produto inválido.');
  if (!Number.isInteger(quantidade) || quantidade <= 0) throw new Error('A quantidade deve ser um inteiro maior que zero.');
}

function converterDataIso(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Use a data no formato AAAA-MM-DD.');
  const [ano, mes, dia] = data.split('-').map(Number);
  const resultado = new Date(ano, mes - 1, dia);
  if (resultado.getFullYear() !== ano || resultado.getMonth() !== mes - 1 || resultado.getDate() !== dia) {
    throw new Error('Data de vencimento inválida.');
  }
  return resultado;
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function arredondarMoeda(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

module.exports = { calcularComissoes, calcularJuros, movimentarEstoque, percentualComissao };
