import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Resposta da busca de cliente pelo CPF
export interface ClienteIdentificado {
  idpessoa: number;
  nome: string;
}

// Um item do pedido, no formato que o backend espera
export interface ItemPedido {
  iditem: number;
  idfuncionario: number;
  quantidadeItens: number;
  valorunitarioEntrada: number;
}

// O pedido completo
export interface NovoPedido {
  idpessoa: number;
  dataAtendimento: string;   // formato AAAA-MM-DD
  statusAtendimento: string; // 'A' = aberto
  itens: ItemPedido[];
}

// Resposta do backend quando o pedido é salvo
export interface RespostaPedido {
  mensagem: string;
  idatendimento: number;
  quantidadeItens: number;
  valorTotal: number;
}

// Um item dentro de um pedido já salvo (tela "Meus pedidos")
export interface ItemPedidoCliente {
  iditem: number;
  nomeItem: string;
  quantidadeItens: number;
  valorunitarioEntrada: number;
  valorTotal: number;
}

// Um pedido já salvo
export interface PedidoCliente {
  idatendimento: number;
  dataAtendimento: string;
  statusAtendimento: string;
  valorTotal: number;
  itens: ItemPedidoCliente[];
}

// Resposta da busca de pedidos do cliente
export interface PedidosDoCliente {
  idpessoa: number;
  nome: string;
  pedidos: PedidoCliente[];
}

@Injectable({ providedIn: 'root' })
export class PedidoService {

  private http = inject(HttpClient);
  private urlBase = 'http://localhost:5000/api';

  // Procura o cliente pelo CPF
  buscarClientePorCpf(cpf: number): Observable<ClienteIdentificado> {
    return this.http.get<ClienteIdentificado>(
      this.urlBase + '/Pessoa/cpf/' + cpf
    );
  }

  // Salva o pedido no banco
  confirmarPedido(pedido: NovoPedido): Observable<RespostaPedido> {
    return this.http.post<RespostaPedido>(
      this.urlBase + '/Atendimento',
      pedido
    );
  }

  // Busca os pedidos de um cliente pelo CPF
  buscarPedidosPorCpf(cpf: number): Observable<PedidosDoCliente> {
    return this.http.get<PedidosDoCliente>(
      this.urlBase + '/Atendimento/cliente/' + cpf
    );
  }
}