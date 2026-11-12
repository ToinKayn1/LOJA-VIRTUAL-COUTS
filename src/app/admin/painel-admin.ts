import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EstoqueService, ItemEstoque } from '../services/estoque.service';
import { EntradaProdutoService, EntradaRegistrada } from '../services/entrada-produto.service';
import { PedidoAdmin, PedidosAdminService } from '../services/pedidos-admin.service';
import { PessoaAdmin, PessoaService } from '../services/pessoa.service';
import { Categoria, CategoriaDados, CategoriaService } from '../services/categoria.service';
import { Item, ItemService } from '../services/item.service';
import {
  Funcionario,
  FuncionarioCadastro,
  FuncionarioAtualizacao,
  EnderecoFuncionario,
  FuncionarioService
} from '../services/funcionario.service';

@Component({
  selector: 'app-painel-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './painel-admin.html',
  styleUrl: '../app.css',
  styles: [
    `
      .tabela-estoque {
        overflow-x: auto;
      }

      .tabela-estoque table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      .tabela-estoque th,
      .tabela-estoque td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
        text-align: left;
      }
    `,
  ],
})
export class PainelAdmin implements OnInit {

  // ----- Clientes -----

  private pessoaService = inject(PessoaService);

  pessoas = signal<PessoaAdmin[]>([]);
  carregandoPessoas = signal(false);
  erroPessoas = signal('');
  mensagemPessoa = signal('');
  salvandoPessoa = signal(false);

  pessoaEditando = signal<PessoaAdmin | null>(null);

  dadosEdicao = signal({
    nome: '',
    cpf: 0,
    dataNascimento: '',
    sexo: '',
    email: '',
    telefone: 0
  });

    // ----- Funcionários -----

    private funcionarioService = inject(FuncionarioService);

    funcionarios = signal<Funcionario[]>([]);
    carregandoFuncionarios = signal(false);
    erroFuncionarios = signal('');
    mensagemFuncionario = signal('');
    salvandoFuncionario = signal(false);
  
    funcionarioEditando = signal<number | null>(null);
  
    dadosFuncionario = signal({
      nome: '',
      cpf: 0,
      dataNascimento: '',
      sexo: '',
      email: '',
      telefone: 0,
      cargo: '',
      ativoPessoa: 'S',
      dataAdmissao: this.dataDeHoje()
    });
  
    enderecosFuncionario = signal<EnderecoFuncionario[]>([
      {
        cep: '',
        numero: '',
        complemento: ''
      }
    ]);
  
  // ----- Categorias -----

  private categoriaService = inject(CategoriaService);

  categorias = signal<Categoria[]>([]);
  carregandoCategorias = signal(false);
  erroCategorias = signal('');
  mensagemCategoria = signal('');
  salvandoCategoria = signal(false);

  categoriaEditando = signal<number | null>(null);

  dadosCategoria = signal<CategoriaDados>({
    categoria: ''
  });

  // ----- Produtos e serviços -----

  private itemService = inject(ItemService);

  itens = signal<Item[]>([]);
  carregandoItens = signal(false);
  erroItens = signal('');
  mensagemItem = signal('');
  salvandoItem = signal(false);

  itemEditando = signal<number | null>(null);

  dadosItem = signal<Item>({
    idcategoria: 0,
    item1: '',
    descricaoItem: '',
    preco: 0,
    tipoItem: 'P',
    ativoProdutoServico: 'S',
    precoVenda: 0,
    unidade: 'UN'
  });

  // ----- Serviços existentes -----

  private estoqueService = inject(EstoqueService);
  private entradaService = inject(EntradaProdutoService);
  private pedidosService = inject(PedidosAdminService);

  // ----- Consulta de estoque -----

  estoque = signal<ItemEstoque[]>([]);
  carregandoEstoque = signal(true);
  erroEstoque = signal('');

  idBusca = signal('');
  buscando = signal(false);
  resultadoBusca = signal<ItemEstoque | null>(null);
  erroBusca = signal('');

  // ----- Entrada de produtos -----

  entIditem = signal('');
  entData = signal(this.dataDeHoje());
  entQuantidade = signal('');
  entUnidade = signal('');
  entValor = signal('');

  salvandoEntrada = signal(false);
  mensagemEntrada = signal('');
  erroEntrada = signal('');

  entradas = signal<EntradaRegistrada[]>([]);
  erroEntradas = signal('');

  // ----- Pedidos -----

  pedidos = signal<PedidoAdmin[]>([]);
  carregandoPedidos = signal(true);
  erroPedidos = signal('');

  filtroStatus = signal('Aberto');
  pedidoExpandido = signal<number | null>(null);

  alterandoStatus = signal(false);
  mensagemPedidosAdmin = signal('');
  erroPedidosAdmin = signal('');

  idPedidoBusca = signal('');
  buscandoPedido = signal(false);
  resultadoPedido = signal<PedidoAdmin | null>(null);
  erroPedidoBusca = signal('');

  // ----- Inicialização -----

  ngOnInit(): void {
    this.carregarEstoque();
    this.carregarEntradas();
    this.carregarPedidos();
    this.carregarPessoas();
    this.carregarCategorias();
    this.carregarItens();
    this.carregarFuncionarios();
  }

  // ----- Gerenciamento de clientes -----

  carregarPessoas(): void {
    this.carregandoPessoas.set(true);
    this.erroPessoas.set('');

    this.pessoaService.listarPessoas().subscribe({
      next: (dados) => {
        this.pessoas.set(dados);
        this.carregandoPessoas.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar clientes:', erro);
        this.erroPessoas.set('Não foi possível carregar os clientes.');
        this.carregandoPessoas.set(false);
      }
    });
  }

  editarPessoa(pessoa: PessoaAdmin): void {
    this.pessoaEditando.set(pessoa);

    this.dadosEdicao.set({
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      dataNascimento: pessoa.dataNascimento.substring(0, 10),
      sexo: pessoa.sexo,
      email: pessoa.email,
      telefone: pessoa.telefone
    });

    this.mensagemPessoa.set('');
    this.erroPessoas.set('');
  }

  atualizarCampo(
    campo: 'nome' | 'cpf' | 'dataNascimento' | 'sexo' | 'email' | 'telefone',
    valor: string | number
  ): void {
    this.dadosEdicao.update(dados => ({
      ...dados,
      [campo]: valor
    } as typeof dados));
  }

  salvarEdicaoPessoa(): void {
    const pessoa = this.pessoaEditando();

    if (!pessoa) {
      return;
    }

    const dados = this.dadosEdicao();

    if (
      !dados.nome.trim() ||
      !dados.email.trim() ||
      !dados.cpf ||
      !dados.telefone ||
      !dados.dataNascimento ||
      !dados.sexo
    ) {
      this.erroPessoas.set('Preencha todos os campos obrigatórios.');
      return;
    }

    this.salvandoPessoa.set(true);
    this.erroPessoas.set('');
    this.mensagemPessoa.set('');

    this.pessoaService.atualizarPessoa(
      pessoa.idpessoa,
      dados
    ).subscribe({
      next: () => {
        this.mensagemPessoa.set('Cliente atualizado com sucesso!');
        this.salvandoPessoa.set(false);
        this.pessoaEditando.set(null);
        this.carregarPessoas();
      },
      error: (erro) => {
        console.error('Erro ao atualizar cliente:', erro);

        this.erroPessoas.set(
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível atualizar o cliente.'
        );

        this.salvandoPessoa.set(false);
      }
    });
  }

  cancelarEdicaoPessoa(): void {
    this.pessoaEditando.set(null);
    this.erroPessoas.set('');
    this.mensagemPessoa.set('');
  }

  // ----- Gerenciamento de categorias -----

  carregarCategorias(): void {
    this.carregandoCategorias.set(true);
    this.erroCategorias.set('');

    this.categoriaService.listarCategorias().subscribe({
      next: (dados) => {
        this.categorias.set(dados);
        this.carregandoCategorias.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar categorias:', erro);
        this.erroCategorias.set('Não foi possível carregar as categorias.');
        this.carregandoCategorias.set(false);
      }
    });
  }

  atualizarNomeCategoria(valor: string): void {
    this.dadosCategoria.update(dados => ({
      ...dados,
      categoria: valor
    }));
  }

  salvarCategoria(): void {
    const dados = this.dadosCategoria();

    if (!dados.categoria.trim()) {
      this.erroCategorias.set('Informe o nome da categoria.');
      return;
    }

    if (this.salvandoCategoria()) {
      return;
    }

    this.salvandoCategoria.set(true);
    this.erroCategorias.set('');
    this.mensagemCategoria.set('');

    const id = this.categoriaEditando();

    const requisicao = id === null
      ? this.categoriaService.cadastrarCategoria(dados)
      : this.categoriaService.atualizarCategoria(id, dados);

    requisicao.subscribe({
      next: () => {
        this.mensagemCategoria.set(
          id === null
            ? 'Categoria cadastrada com sucesso!'
            : 'Categoria atualizada com sucesso!'
        );

        this.categoriaEditando.set(null);

        this.dadosCategoria.set({
          categoria: ''
        });

        this.salvandoCategoria.set(false);
        this.carregarCategorias();
      },
      error: (erro) => {
        console.error('Erro ao salvar categoria:', erro);

        this.erroCategorias.set(
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível salvar a categoria.'
        );

        this.salvandoCategoria.set(false);
      }
    });
  }

  editarCategoria(categoria: Categoria): void {
    this.categoriaEditando.set(categoria.idcategoria);

    this.dadosCategoria.set({
      categoria: categoria.categoria
    });

    this.mensagemCategoria.set('');
    this.erroCategorias.set('');
  }

  cancelarEdicaoCategoria(): void {
    this.categoriaEditando.set(null);

    this.dadosCategoria.set({
      categoria: ''
    });

    this.mensagemCategoria.set('');
    this.erroCategorias.set('');
  }

  excluirCategoria(id: number): void {
    if (!confirm('Deseja realmente excluir esta categoria?')) {
      return;
    }

    this.erroCategorias.set('');
    this.mensagemCategoria.set('');

    this.categoriaService.excluirCategoria(id).subscribe({
      next: () => {
        this.mensagemCategoria.set('Categoria excluída com sucesso!');
        this.carregarCategorias();
      },
      error: (erro) => {
        console.error('Erro ao excluir categoria:', erro);

        this.erroCategorias.set(
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível excluir a categoria. Verifique se existem itens associados.'
        );
      }
    });
  }

  // ----- Data -----

  private dataDeHoje(): string {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return hoje.getFullYear() + '-' + mes + '-' + dia;
  }

  // ----- Consulta de estoque -----

  carregarEstoque(): void {
    this.carregandoEstoque.set(true);
    this.erroEstoque.set('');

    this.estoqueService.listarEstoque().subscribe({
      next: (dados) => {
        this.estoque.set(dados);
        this.carregandoEstoque.set(false);
      },
      error: (erro) => {
        console.error('Erro ao buscar estoque:', erro);
        this.erroEstoque.set('Não foi possível carregar o estoque.');
        this.carregandoEstoque.set(false);
      }
    });
  }

  buscarPorId(): void {
    this.erroBusca.set('');
    this.resultadoBusca.set(null);

    if (this.buscando()) {
      return;
    }

    const id = Number(this.idBusca().replace(/\D/g, ''));

    if (!id) {
      this.erroBusca.set('Informe o ID do item.');
      return;
    }

    this.buscando.set(true);

    this.estoqueService.buscarPorId(id).subscribe({
      next: (dados) => {
        this.resultadoBusca.set(dados);
        this.buscando.set(false);
      },
      error: (erro) => {
        console.error('Erro ao consultar estoque:', erro);

        this.erroBusca.set(
          erro.status === 404
            ? 'Estoque não encontrado para o ID informado.'
            : 'Não foi possível consultar o estoque.'
        );

        this.buscando.set(false);
      }
    });
  }

  limparBusca(): void {
    this.idBusca.set('');
    this.resultadoBusca.set(null);
    this.erroBusca.set('');
  }

  // ----- Entrada de produtos -----

  selecionarProdutoEntrada(valor: string): void {
    this.entIditem.set(valor);

    const produto = this.estoque().find(
      p => p.iditem === Number(valor)
    );

    this.entUnidade.set(produto ? produto.unidade : '');
  }

  nomeDoItem(iditem: number): string {
    const produto = this.estoque().find(
      p => p.iditem === iditem
    );

    return produto ? produto.item : 'Item ' + iditem;
  }

  carregarEntradas(): void {
    this.erroEntradas.set('');

    this.entradaService.listarEntradas().subscribe({
      next: (dados) => {
        this.entradas.set(
          [...dados].sort(
            (a, b) => b.identradaProduto - a.identradaProduto
          )
        );
      },
      error: (erro) => {
        console.error('Erro ao buscar entradas:', erro);
        this.erroEntradas.set('Não foi possível carregar as entradas.');
      }
    });
  }

  registrarEntrada(): void {
    this.mensagemEntrada.set('');
    this.erroEntrada.set('');

    if (this.salvandoEntrada()) {
      return;
    }

    const iditem = Number(this.entIditem());
    const data = this.entData();
    const unidade = this.entUnidade().trim();
    const quantidade = Number(this.entQuantidade().replace(',', '.'));
    const valor = Number(this.entValor().replace(',', '.'));

    if (
      !iditem ||
      !data ||
      !unidade ||
      !(quantidade > 0) ||
      !(valor > 0)
    ) {
      this.erroEntrada.set('Preencha todos os campos com valores válidos.');
      return;
    }

    if (!Number.isInteger(quantidade)) {
      this.erroEntrada.set('A quantidade deve ser um número inteiro.');
      return;
    }

    this.salvandoEntrada.set(true);

    this.entradaService.registrarEntrada({
      iditem: iditem,
      dataEntradaProduto: data,
      quantidadeEntrada: quantidade,
      unidade: unidade,
      valorUnitarioEntrada: valor
    }).subscribe({
      next: (mensagem) => {
        this.mensagemEntrada.set(mensagem);
        this.limparEntrada();
        this.salvandoEntrada.set(false);
        this.carregarEstoque();
        this.carregarEntradas();
      },
      error: (erro) => {
        console.error('Erro ao registrar entrada:', erro);

        this.erroEntrada.set(
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível registrar a entrada. Verifique os dados.'
        );

        this.salvandoEntrada.set(false);
      }
    });
  }

  limparEntrada(): void {
    this.entIditem.set('');
    this.entData.set(this.dataDeHoje());
    this.entQuantidade.set('');
    this.entUnidade.set('');
    this.entValor.set('');
  }

  // ----- Pedidos -----

  carregarPedidos(): void {
    this.carregandoPedidos.set(true);
    this.erroPedidos.set('');

    this.pedidosService.listarPedidos(this.filtroStatus()).subscribe({
      next: (dados) => {
        this.pedidos.set(dados);
        this.carregandoPedidos.set(false);
      },
      error: (erro) => {
        console.error('Erro ao buscar pedidos:', erro);
        this.erroPedidos.set('Não foi possível carregar os pedidos.');
        this.carregandoPedidos.set(false);
      }
    });
  }

  mudarFiltro(valor: string): void {
    this.filtroStatus.set(valor);
    this.carregarPedidos();
  }

  alternarItensPedido(idatendimento: number): void {
    this.pedidoExpandido.set(
      this.pedidoExpandido() === idatendimento
        ? null
        : idatendimento
    );
  }

  proximasSituacoes(letra: string): { rotulo: string; valor: string }[] {
    if (letra === 'A') {
      return [
        { rotulo: 'Iniciar processamento', valor: 'Em processamento' },
        { rotulo: 'Cancelar pedido', valor: 'Cancelado' }
      ];
    }

    if (letra === 'P') {
      return [
        { rotulo: 'Concluir pedido', valor: 'Concluído' },
        { rotulo: 'Cancelar pedido', valor: 'Cancelado' }
      ];
    }

    return [];
  }

  mudarStatus(pedido: PedidoAdmin, novaSituacao: string): void {
    this.mensagemPedidosAdmin.set('');
    this.erroPedidosAdmin.set('');

    if (this.alterandoStatus()) {
      return;
    }

    if (novaSituacao === 'Cancelado') {
      const confirmou = confirm(
        'Cancelar o pedido nº ' + pedido.idatendimento +
        '? O estoque dos produtos será devolvido.'
      );

      if (!confirmou) {
        return;
      }
    }

    this.alterandoStatus.set(true);

    this.pedidosService.atualizarStatus(
      pedido.idatendimento,
      novaSituacao
    ).subscribe({
      next: (mensagem) => {
        this.mensagemPedidosAdmin.set(
          'Pedido nº ' + pedido.idatendimento + ': ' + mensagem
        );

        this.alterandoStatus.set(false);
        this.carregarPedidos();
        this.carregarEstoque();

        const aberto = this.resultadoPedido();

        if (aberto && aberto.idatendimento === pedido.idatendimento) {
          this.pedidosService.buscarPorId(pedido.idatendimento).subscribe({
            next: (atualizado) => this.resultadoPedido.set(atualizado)
          });
        }
      },
      error: (erro) => {
        console.error('Erro ao atualizar pedido:', erro);

        this.erroPedidosAdmin.set(
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível atualizar o pedido.'
        );

        this.alterandoStatus.set(false);
      }
    });
  }

  buscarPedidoPorId(): void {
    this.erroPedidoBusca.set('');
    this.resultadoPedido.set(null);

    if (this.buscandoPedido()) {
      return;
    }

    const id = Number(this.idPedidoBusca().replace(/\D/g, ''));

    if (!id) {
      this.erroPedidoBusca.set('Informe o número do pedido.');
      return;
    }

    this.buscandoPedido.set(true);

    this.pedidosService.buscarPorId(id).subscribe({
      next: (dados) => {
        this.resultadoPedido.set(dados);
        this.buscandoPedido.set(false);
      },
      error: (erro) => {
        console.error('Erro ao buscar pedido:', erro);

        this.erroPedidoBusca.set(
          erro.status === 404
            ? 'Pedido não encontrado.'
            : 'Não foi possível consultar o pedido.'
        );

        this.buscandoPedido.set(false);
      }
    });
  }

  limparBuscaPedido(): void {
    this.idPedidoBusca.set('');
    this.resultadoPedido.set(null);
    this.erroPedidoBusca.set('');
  }

  // ----- Gerenciamento de produtos e serviços -----

  carregarItens(): void {
    this.carregandoItens.set(true);
    this.erroItens.set('');

    this.itemService.listarItens().subscribe({
      next: (dados) => {
        this.itens.set(dados);
        this.carregandoItens.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos e serviços:', erro);
        this.erroItens.set('Não foi possível carregar os produtos e serviços.');
        this.carregandoItens.set(false);
      }
    });
  }

  atualizarCampoItem(
    campo: 'idcategoria' | 'item1' | 'descricaoItem' |
           'preco' | 'tipoItem' | 'ativoProdutoServico' |
           'precoVenda' | 'unidade',
    valor: string | number
  ): void {
    this.dadosItem.update(dados => ({
      ...dados,
      [campo]: valor
    } as Item));
  }

  // Mostra o nome da categoria na tabela (o template não aceita função de seta)
  nomeDaCategoria(idcategoria: number): string {
    const categoria = this.categorias().find(
      c => c.idcategoria === idcategoria
    );

    return categoria ? categoria.categoria : String(idcategoria);
  }

  salvarItem(): void {
    const dados = this.dadosItem();

    if (
      !dados.idcategoria ||
      !dados.item1.trim() ||
      !dados.descricaoItem.trim() ||
      dados.preco <= 0
    ) {
      this.erroItens.set('Preencha todos os campos com valores válidos.');
      return;
    }

    // Produto precisa de preço de venda e unidade (ex.: UN)
    if (
      dados.tipoItem === 'P' &&
      (!dados.unidade || !dados.unidade.trim() || !((dados.precoVenda ?? 0) > 0))
    ) {
      this.erroItens.set('Para produto, informe o preço de venda e a unidade.');
      return;
    }

    if (this.salvandoItem()) {
      return;
    }

    this.salvandoItem.set(true);
    this.erroItens.set('');
    this.mensagemItem.set('');

    const id = this.itemEditando();

    const requisicao = id === null
      ? this.itemService.cadastrarItem(dados)
      : this.itemService.atualizarItem(id, dados);

    requisicao.subscribe({
      next: () => {
        // Limpa o formulário primeiro (isso apaga as mensagens)...
        this.cancelarEdicaoItem();

        // ...e só depois mostra a mensagem de sucesso
        this.mensagemItem.set(
          id === null
            ? 'Produto/serviço cadastrado com sucesso!'
            : 'Produto/serviço atualizado com sucesso!'
        );

        this.salvandoItem.set(false);
        this.carregarItens();
        this.carregarEstoque();
      },
      error: (erro) => {
        console.error('Erro ao salvar produto/serviço:', erro);

        this.erroItens.set(
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível salvar o produto/serviço. Verifique os dados.'
        );

        this.salvandoItem.set(false);
      }
    });
  }

  editarItem(item: Item): void {
    if (!item.iditem) {
      return;
    }

    this.itemEditando.set(item.iditem);

    this.dadosItem.set({
      idcategoria: item.idcategoria,
      item1: item.item1,
      descricaoItem: item.descricaoItem,
      preco: item.preco,
      tipoItem: item.tipoItem,
      ativoProdutoServico: item.ativoProdutoServico,
      precoVenda: item.precoVenda ?? 0,
      unidade: item.unidade ?? 'UN'
    });

    this.mensagemItem.set('');
    this.erroItens.set('');
  }

  cancelarEdicaoItem(): void {
    this.itemEditando.set(null);

    this.dadosItem.set({
      idcategoria: 0,
      item1: '',
      descricaoItem: '',
      preco: 0,
      tipoItem: 'P',
      ativoProdutoServico: 'S',
      precoVenda: 0,
      unidade: 'UN'
    });

    this.mensagemItem.set('');
    this.erroItens.set('');
  }

 
  excluirItem(id: number): void {
    if (!confirm('Deseja realmente excluir este produto/serviço?')) {
      return;
    }

    this.erroItens.set('');
    this.mensagemItem.set('');

    this.itemService.excluirItem(id).subscribe({
      next: () => {
        this.mensagemItem.set('Produto/serviço excluído com sucesso!');
        this.carregarItens();
        this.carregarEstoque();
      },
      error: (erro) => {
        console.error('Erro ao excluir produto/serviço:', erro);

        this.erroItens.set(
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível excluir. Verifique se o item possui registros associados.'
        );
      }
    });
  }


  // ----- Gerenciamento de funcionários -----

  carregarFuncionarios(): void {
    this.carregandoFuncionarios.set(true);
    this.erroFuncionarios.set('');

    this.funcionarioService.listarFuncionarios().subscribe({
      next: (dados) => {
        this.funcionarios.set(dados);
        this.carregandoFuncionarios.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar funcionários:', erro);
        this.erroFuncionarios.set(
          'Não foi possível carregar os funcionários.'
        );
        this.carregandoFuncionarios.set(false);
      }
    });
  }

  atualizarCampoFuncionario(
    campo: 'nome' | 'cpf' | 'dataNascimento' | 'sexo' |
      'email' | 'telefone' | 'cargo' | 'ativoPessoa' |
      'dataAdmissao',
    valor: string | number
  ): void {
    this.dadosFuncionario.update(dados => ({
      ...dados,
      [campo]: valor
    }));
  }

  atualizarEnderecoFuncionario(
    indice: number,
    campo: 'cep' | 'numero' | 'complemento',
    valor: string
  ): void {
    this.enderecosFuncionario.update(enderecos =>
      enderecos.map((endereco, i) =>
        i === indice
          ? { ...endereco, [campo]: valor }
          : endereco
      )
    );
  }

  adicionarEnderecoFuncionario(): void {
    this.enderecosFuncionario.update(enderecos => [
      ...enderecos,
      {
        cep: '',
        numero: '',
        complemento: ''
      }
    ]);
  }

  removerEnderecoFuncionario(indice: number): void {
    if (this.enderecosFuncionario().length <= 1) {
      this.erroFuncionarios.set(
        'O funcionário precisa ter pelo menos um endereço.'
      );
      return;
    }

    this.enderecosFuncionario.update(enderecos =>
      enderecos.filter((_, i) => i !== indice)
    );

    this.erroFuncionarios.set('');
  }

  editarFuncionario(funcionario: Funcionario): void {
    this.funcionarioEditando.set(funcionario.pessoaIdpessoa);

    this.dadosFuncionario.set({
      nome: funcionario.pessoa.nome,
      cpf: funcionario.pessoa.cpf,
      dataNascimento: funcionario.pessoa.dataNascimento.substring(0, 10),
      sexo: funcionario.pessoa.sexo,
      email: funcionario.pessoa.email,
      telefone: funcionario.pessoa.telefone,
      cargo: funcionario.cargo,
      ativoPessoa: funcionario.pessoa.ativoPessoa,
      dataAdmissao: funcionario.dataAdmissao.substring(0, 10)
    });

    this.enderecosFuncionario.set(
      funcionario.enderecos.map(endereco => ({
        idendereco: endereco.idendereco,
        idpessoa: endereco.idpessoa,
        cep: endereco.cep,
        numero: endereco.numero,
        complemento: endereco.complemento
      }))
    );

    this.erroFuncionarios.set('');
    this.mensagemFuncionario.set('');
  }

  salvarFuncionario(): void {
    const dados = this.dadosFuncionario();
    const enderecos = this.enderecosFuncionario();

    if (
      !dados.nome.trim() ||
      !dados.cpf ||
      !dados.dataNascimento ||
      !dados.sexo ||
      !dados.email.trim() ||
      !dados.telefone ||
      !dados.cargo.trim() ||
      !dados.dataAdmissao ||
      !dados.ativoPessoa
    ) {
      this.erroFuncionarios.set(
        'Preencha todos os campos obrigatórios.'
      );
      return;
    }

    if (
      enderecos.length === 0 ||
      enderecos.some(e =>
        !e.cep.trim() ||
        !e.numero.trim() ||
        !e.complemento.trim()
      )
    ) {
      this.erroFuncionarios.set(
        'Preencha todos os campos dos endereços.'
      );
      return;
    }

    if (this.salvandoFuncionario()) {
      return;
    }

    this.salvandoFuncionario.set(true);
    this.erroFuncionarios.set('');
    this.mensagemFuncionario.set('');

    const id = this.funcionarioEditando();

    if (id === null) {
      const cadastro: FuncionarioCadastro = {
        ...dados,
        enderecos: enderecos.map(e => ({
          cep: e.cep,
          numero: e.numero,
          complemento: e.complemento
        }))
      };

      this.funcionarioService.cadastrarFuncionario(cadastro).subscribe({
        next: () => {
          this.mensagemFuncionario.set(
            'Funcionário cadastrado com sucesso!'
          );
          this.limparFormularioFuncionario();
          this.salvandoFuncionario.set(false);
          this.carregarFuncionarios();
        },
        error: (erro) => {
          console.error('Erro ao cadastrar funcionário:', erro);
          this.erroFuncionarios.set(
            typeof erro.error === 'string'
              ? erro.error
              : erro.error?.mensagem ||
                'Não foi possível cadastrar o funcionário.'
          );
          this.salvandoFuncionario.set(false);
        }
      });

    } else {
      const atualizacao: FuncionarioAtualizacao = {
        ...dados,
        enderecos: enderecos.map(e => ({
          ...e,
          idendereco: e.idendereco ?? 0,
          idpessoa: e.idpessoa ?? id
        }))
      };

      this.funcionarioService.atualizarFuncionario(
        id,
        atualizacao
      ).subscribe({
        next: () => {
          this.mensagemFuncionario.set(
            'Funcionário atualizado com sucesso!'
          );
          this.limparFormularioFuncionario();
          this.salvandoFuncionario.set(false);
          this.carregarFuncionarios();
        },
        error: (erro) => {
          console.error('Erro ao atualizar funcionário:', erro);
          this.erroFuncionarios.set(
            typeof erro.error === 'string'
              ? erro.error
              : 'Não foi possível atualizar o funcionário.'
          );
          this.salvandoFuncionario.set(false);
        }
      });
    }
  }

  limparFormularioFuncionario(): void {
    this.funcionarioEditando.set(null);

    this.dadosFuncionario.set({
      nome: '',
      cpf: 0,
      dataNascimento: '',
      sexo: '',
      email: '',
      telefone: 0,
      cargo: '',
      ativoPessoa: 'S',
      dataAdmissao: this.dataDeHoje()
    });

    this.enderecosFuncionario.set([
      {
        cep: '',
        numero: '',
        complemento: ''
      }
    ]);

    this.erroFuncionarios.set('');
  }

  excluirFuncionario(id: number): void {
    if (!confirm('Deseja realmente excluir este funcionário?')) {
      return;
    }

    this.erroFuncionarios.set('');
    this.mensagemFuncionario.set('');

    this.funcionarioService.excluirFuncionario(id).subscribe({
      next: () => {
        this.mensagemFuncionario.set(
          'Funcionário excluído com sucesso!'
        );
        this.carregarFuncionarios();
      },
      error: (erro) => {
        console.error('Erro ao excluir funcionário:', erro);

        this.erroFuncionarios.set(
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível excluir o funcionário. Verifique se existem atendimentos vinculados.'
        );
      }
    });
  }

}