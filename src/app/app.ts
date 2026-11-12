import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto, ProdutoService } from './services/produto.service';
import { Servico, ServicoService } from './services/servico.service';
import { PessoaCadastro, PessoaService } from './services/pessoa.service';
import { CarrinhoService } from './services/carrinho.service';
import { PedidoService, PedidosDoCliente } from './services/pedido.service';
import { PainelAdmin } from './admin/painel-admin';

// Funcionário que atende as compras feitas na loja virtual (Maria Oliveira)
const ID_FUNCIONARIO_LOJA = 8;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, PainelAdmin],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private produtoService = inject(ProdutoService);
  private servicoService = inject(ServicoService);
  private pessoaService = inject(PessoaService);
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef);

  carrinho = inject(CarrinhoService);

  // Qual módulo está aberto: a loja ou o painel administrativo
  modulo = signal<'loja' | 'admin'>('loja');

  produtos = signal<Produto[]>([]);
  servicos = signal<Servico[]>([]);

  // Filtros inicializados estritamente vazios para não ocultar produtos
  pesquisa = signal('');
  categoriaSelecionada = signal('');

  carregando = signal(true);
  carregandoServicos = signal(true);
  erro = signal('');
  erroServicos = signal('');

  mensagemCarrinho = signal('');

  // Confirmação do pedido
  cpfPedido = signal('');
  confirmandoPedido = signal(false);
  mensagemPedido = signal('');
  erroPedido = signal('');

  // Tela "Meus pedidos"
  cpfMeusPedidos = signal('');
  carregandoMeusPedidos = signal(false);
  meusPedidos = signal<PedidosDoCliente | null>(null);
  erroMeusPedidos = signal('');
  pedidoAberto = signal<number | null>(null);

  cliente: PessoaCadastro = this.novoCliente();

  salvandoCliente = false;
  mensagemCliente = '';
  erroCliente = '';

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarServicos();
  }

  novoCliente(): PessoaCadastro {
    return {
      nome: '',
      cpf: 0,
      dataNascimento: '',
      sexo: '',
      email: '',
      telefone: 0
    };
  }

  cadastrarCliente(): void {
    this.mensagemCliente = '';
    this.erroCliente = '';

    if (this.salvandoCliente) {
      return;
    }

    if (!this.cliente.nome.trim() ||
        !this.cliente.email.trim() ||
        !this.cliente.dataNascimento ||
        !this.cliente.sexo ||
        !this.cliente.cpf ||
        !this.cliente.telefone) {
      this.erroCliente = 'Preencha todos os campos obrigatórios.';
      return;
    }

    this.salvandoCliente = true;

    this.pessoaService.cadastrarPessoa(this.cliente).subscribe({
      next: (resposta) => {
        this.mensagemCliente = resposta.mensagem;
        this.cliente = this.novoCliente();
        this.salvandoCliente = false;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao cadastrar cliente:', erro);
        this.erroCliente =
          typeof erro.error === 'string'
            ? erro.error
            : 'Não foi possível cadastrar o cliente.';
        this.salvandoCliente = false;
        this.cdr.markForCheck();
      }
    });
  }

  adicionarProdutoAoCarrinho(produto: Produto): void {
    const resultado = this.carrinho.adicionar({
      iditem: produto.iditem,
      nome: produto.nome,
      preco: produto.precoVenda,
      tipo: 'produto',
      estoque: produto.quantidadeEstoque
    });

    this.mensagemCarrinho.set(
      resultado === '' ? produto.nome + ' adicionado ao carrinho.' : resultado
    );
  }

  adicionarServicoAoCarrinho(servico: Servico): void {
    const resultado = this.carrinho.adicionar({
      iditem: servico.iditem,
      nome: servico.nome,
      preco: servico.preco,
      tipo: 'servico',
      estoque: null
    });

    this.mensagemCarrinho.set(
      resultado === '' ? servico.nome + ' adicionado ao carrinho.' : resultado
    );
  }

  // Data de hoje no formato AAAA-MM-DD
  private dataDeHoje(): string {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return hoje.getFullYear() + '-' + mes + '-' + dia;
  }

  // Confirma o pedido: acha o cliente pelo CPF e salva no banco
  confirmarPedido(): void {
    this.mensagemPedido.set('');
    this.erroPedido.set('');

    if (this.confirmandoPedido()) {
      return;
    }

    if (this.carrinho.itens().length === 0) {
      this.erroPedido.set('O carrinho está vazio.');
      return;
    }

    const cpf = Number(this.cpfPedido().replace(/\D/g, ''));

    if (!cpf) {
      this.erroPedido.set('Informe o CPF do cliente.');
      return;
    }

    this.confirmandoPedido.set(true);

    // 1) Acha o cliente pelo CPF
    this.pedidoService.buscarClientePorCpf(cpf).subscribe({
      next: (cliente) => {

        // 2) Monta o pedido com os itens do carrinho
        const pedido = {
          idpessoa: cliente.idpessoa,
          dataAtendimento: this.dataDeHoje(),
          statusAtendimento: 'A',
          itens: this.carrinho.itens().map(item => ({
            iditem: item.iditem,
            idfuncionario: ID_FUNCIONARIO_LOJA,
            quantidadeItens: item.quantidade,
            valorunitarioEntrada: item.preco
          }))
        };

        // 3) Salva o pedido no banco
        this.pedidoService.confirmarPedido(pedido).subscribe({
          next: (resposta) => {
            this.mensagemPedido.set(
              'Pedido nº ' + resposta.idatendimento + ' registrado com sucesso!'
            );
            this.carrinho.limpar();
            this.cpfPedido.set('');
            this.confirmandoPedido.set(false);
            // Recarrega os produtos para mostrar o estoque novo
            this.carregarProdutos();
          },
          error: (erro) => {
            console.error('Erro ao confirmar pedido:', erro);
            this.erroPedido.set(
              typeof erro.error === 'string'
                ? erro.error
                : 'Não foi possível registrar o pedido.'
            );
            this.confirmandoPedido.set(false);
          }
        });
      },
      error: (erro) => {
        console.error('Erro ao buscar cliente:', erro);
        this.erroPedido.set(
          erro.status === 404
            ? 'Cliente não encontrado. Faça o cadastro antes de comprar.'
            : 'Não foi possível consultar o cliente.'
        );
        this.confirmandoPedido.set(false);
      }
    });
  }

  // Busca os pedidos de um cliente pelo CPF (tela "Meus pedidos")
  buscarMeusPedidos(): void {
    this.erroMeusPedidos.set('');
    this.meusPedidos.set(null);
    this.pedidoAberto.set(null);

    if (this.carregandoMeusPedidos()) {
      return;
    }

    const cpf = Number(this.cpfMeusPedidos().replace(/\D/g, ''));

    if (!cpf) {
      this.erroMeusPedidos.set('Informe o CPF do cliente.');
      return;
    }

    this.carregandoMeusPedidos.set(true);

    this.pedidoService.buscarPedidosPorCpf(cpf).subscribe({
      next: (dados) => {
        this.meusPedidos.set(dados);
        this.carregandoMeusPedidos.set(false);
      },
      error: (erro) => {
        console.error('Erro ao buscar pedidos:', erro);
        this.erroMeusPedidos.set(
          erro.status === 404
            ? 'Cliente não encontrado.'
            : 'Não foi possível consultar os pedidos.'
        );
        this.carregandoMeusPedidos.set(false);
      }
    });
  }

  // Abre ou fecha os detalhes de um pedido
  alternarDetalhesPedido(idatendimento: number): void {
    this.pedidoAberto.set(
      this.pedidoAberto() === idatendimento ? null : idatendimento
    );
  }

  carregarProdutos(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.produtoService.listarProdutos().subscribe({
      next: (dados) => {
        this.produtos.set(dados);
        this.carregando.set(false);
      },
      error: (erro) => {
        console.error('Erro ao buscar produtos:', erro);
        this.erro.set('Não foi possível carregar os produtos.');
        this.carregando.set(false);
      }
    });
  }

  carregarServicos(): void {
    this.carregandoServicos.set(true);
    this.erroServicos.set('');

    this.servicoService.listarServicos().subscribe({
      next: (dados) => {
        this.servicos.set(dados);
        this.carregandoServicos.set(false);
      },
      error: (erro) => {
        console.error('Erro ao buscar serviços:', erro);
        this.erroServicos.set('Não foi possível carregar os serviços.');
        this.carregandoServicos.set(false);
      }
    });
  }

  get categorias(): string[] {
    return [...new Set(
      this.produtos()
        .map(produto => produto.categoria)
        .filter(categoria => !!categoria)
    )].sort();
  }

  // Getter corrigido para permitir mostrar TODOS os produtos quando sem filtro
  get produtosFiltrados(): Produto[] {
    const termo = this.pesquisa().toLowerCase().trim();
    const categoria = this.categoriaSelecionada().trim();

    return this.produtos().filter(produto => {
      const nomeBate = !termo || produto.nome.toLowerCase().includes(termo);
      const categoriaBate = !categoria || produto.categoria === categoria;
      return nomeBate && categoriaBate;
    });
  }

  // Método auxiliar para limpar filtros na interface
  limparFiltros(): void {
    this.pesquisa.set('');
    this.categoriaSelecionada.set('');
  }
}