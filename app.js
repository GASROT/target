const { createInterface } = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const { vendas, estoqueInicial } = require('./dados');
const { calcularComissoes, calcularJuros, movimentarEstoque } = require('./servicos');

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const estoque = structuredClone(estoqueInicial);
const movimentacoes = [];
const rl = createInterface({ input, output });

async function executar() {
  try {
    let opcao;
    do {
      console.log('\n1 - Calcular comissões\n2 - Movimentar estoque\n3 - Calcular juros\n0 - Sair');
      opcao = (await rl.question('Escolha uma opção: ')).trim();

      if (opcao === '1') exibirComissoes();
      else if (opcao === '2') await registrarMovimentacao();
      else if (opcao === '3') await consultarJuros();
      else if (opcao !== '0') console.log('Opção inválida.');
    } while (opcao !== '0');
  } finally {
    rl.close();
  }
}

function exibirComissoes() {
  console.table(calcularComissoes(vendas).map(({ vendedor, totalVendas, comissao }) => ({
    Vendedor: vendedor,
    'Total de vendas': moeda.format(totalVendas),
    Comissão: moeda.format(comissao)
  })));
}

async function registrarMovimentacao() {
  console.table(estoque);
  try {
    const id = await rl.question('Identificador único: ');
    const descricao = await rl.question('Descrição: ');
    const tipo = (await rl.question('Tipo (E para entrada, S para saída): ')).trim().toUpperCase();
    const codigoProduto = Number(await rl.question('Código do produto: '));
    const quantidade = Number(await rl.question('Quantidade: '));
    const produto = movimentarEstoque(estoque, movimentacoes, {
      id,
      descricao,
      tipo: tipo === 'E' ? 'ENTRADA' : tipo === 'S' ? 'SAIDA' : tipo,
      codigoProduto,
      quantidade
    });
    console.log(`Estoque final de ${produto.descricaoProduto}: ${produto.estoque}`);
  } catch (erro) {
    console.log(`Movimentação não registrada: ${erro.message}`);
  }
}

async function consultarJuros() {
  try {
    const valor = Number((await rl.question('Valor original: R$ ')).replace(',', '.'));
    const vencimento = await rl.question('Data de vencimento (AAAA-MM-DD): ');
    const resultado = calcularJuros(valor, vencimento);
    console.log(`Dias de atraso: ${resultado.diasAtraso}`);
    console.log(`Juros (2,5% ao dia): ${moeda.format(resultado.juros)}`);
    console.log(`Valor atualizado: ${moeda.format(resultado.valorAtualizado)}`);
  } catch (erro) {
    console.log(`Não foi possível calcular os juros: ${erro.message}`);
  }
}

executar();
