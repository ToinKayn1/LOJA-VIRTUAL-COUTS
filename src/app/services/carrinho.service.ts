import { Injectable, computed, signal } from '@angular/core';

// Como cada item do carrinho é guardado
export interface ItemCarrinho {
  iditem: number;
  nome: string;
  preco: number;
  quantidade: number;
  tipo: 'produto' | 'servico';
  estoque: number | null; // serviço não tem estoque, então fica null
}

@Injectable({ providedIn: 'root' })
export class CarrinhoService {

  // Lista de itens do carrinho
  itens = signal<ItemCarrinho[]>([]);

  // Valor total do carrinho (calculado sozinho quando a lista muda)
  total = computed(() =>
    this.itens().reduce((soma, item) => soma + item.preco * item.quantidade, 0)
  );

  // Quantidade total de itens (para mostrar no menu)
  quantidadeTotal = computed(() =>
    this.itens().reduce((soma, item) => soma + item.quantidade, 0)
  );

  // Adiciona um item. Devolve um texto de erro, ou '' se deu certo.
  adicionar(novo: Omit<ItemCarrinho, 'quantidade'>): string {
    const existente = this.itens().find(i => i.iditem === novo.iditem);

    if (novo.tipo === 'servico') {
      if (existente) {
        return 'Este serviço já está no carrinho.';
      }
      this.itens.update(lista => [...lista, { ...novo, quantidade: 1 }]);
      return '';
    }

    // Produto: a quantidade não pode passar do estoque
    const estoque = novo.estoque ?? 0;
    const quantidadeAtual = existente ? existente.quantidade : 0;

    if (quantidadeAtual + 1 > estoque) {
      return 'Quantidade maior que o estoque disponível.';
    }

    if (existente) {
      this.itens.update(lista =>
        lista.map(i =>
          i.iditem === novo.iditem ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      );
    } else {
      this.itens.update(lista => [...lista, { ...novo, quantidade: 1 }]);
    }
    return '';
  }

  // Muda a quantidade de um produto (respeitando o estoque)
  alterarQuantidade(iditem: number, quantidade: number): void {
    this.itens.update(lista =>
      lista.map(item => {
        if (item.iditem !== iditem || item.tipo === 'servico') {
          return item;
        }
        const maximo = item.estoque ?? 1;
        const nova = Math.min(Math.max(quantidade, 1), maximo);
        return { ...item, quantidade: nova };
      })
    );
  }

  // Tira um item do carrinho
  remover(iditem: number): void {
    this.itens.update(lista => lista.filter(i => i.iditem !== iditem));
  }

  // Esvazia o carrinho (vai servir depois de confirmar o pedido)
  limpar(): void {
    this.itens.set([]);
  }
}