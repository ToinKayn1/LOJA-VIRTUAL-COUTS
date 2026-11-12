import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Um item dentro do pedido, com o funcionário que atendeu
export interface ItemPedidoAdmin {
  iditem: number;
  nomeItem: string;
  quantidadeItens: number;
  valorunitarioEntrada: number;
  valorTotal: number;
  funcionario: string;
  cargo: string;
}

// Um pedido, como o painel administrativo recebe
export interface PedidoAdmin {
  idatendimento: number;
  idpessoa: number;
  nomeCliente: string;
  dataAtendimento: string;
  statusAtendimento: string; // A, P, C ou X
  statusDescricao: string;   // Aberto, Em processamento, Concluído ou Cancelado
  valorTotal: number;
  itens: ItemPedidoAdmin[];
}

@Injectable({ providedIn: 'root' })
export class PedidosAdminService {

  private http = inject(HttpClient);
  private urlBase = 'http://localhost:5000/api/Pedidos';

  // Lista os pedidos. Se informar a situação, filtra por ela.
  listarPedidos(status: string = ''): Observable<PedidoAdmin[]> {
    let parametros = new HttpParams();

    if (status) {
      parametros = parametros.set('status', status);
    }

    return this.http.get<PedidoAdmin[]>(this.urlBase, { params: parametros });
  }

  // Abre um pedido pelo ID
  buscarPorId(id: number): Observable<PedidoAdmin> {
    return this.http.get<PedidoAdmin>(this.urlBase + '/' + id);
  }

  // Muda a situação do pedido (o backend responde com um texto simples)
  atualizarStatus(id: number, status: string): Observable<string> {
    return this.http.put(
      this.urlBase + '/' + id + '/status',
      { status: status },
      { responseType: 'text' }
    );
  }
}