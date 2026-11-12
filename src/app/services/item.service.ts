
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Estrutura dos dados de um produto ou serviço
export interface Item {
  iditem?: number;
  idcategoria: number;
  item1: string;
  descricaoItem: string;
  preco: number;
  tipoItem: string;
  ativoProdutoServico: string;

  // Dados específicos de produtos
  precoVenda?: number | null;
  unidade?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private http = inject(HttpClient);

  // Endereço da API do Backend
  private apiUrl = 'http://localhost:5000/api/Item';

  // Listar todos os itens
  listarItens(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  // Buscar um item pelo ID
  buscarPorId(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  // Cadastrar um novo item
  cadastrarItem(item: Item): Observable<string> {
    return this.http.post(
      this.apiUrl,
      item,
      { responseType: 'text' }
    );
  }

  // Atualizar um item existente
  atualizarItem(id: number, item: Item): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      item,
      { responseType: 'text' }
    );
  }

  // Excluir um item
  excluirItem(id: number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { responseType: 'text' }
    );
  }
}
