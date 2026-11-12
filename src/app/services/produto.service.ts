
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Produto {
  iditem: number;
  nome: string;
  descricao: string;
  precoVenda: number;
  unidade: string;
  quantidadeEstoque: number;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/Produto/catalogo';

  listarProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }
}
