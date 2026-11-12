import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Um registro da consulta de estoque, igual ao que a API devolve
export interface ItemEstoque {
  iditem: number;
  item: string;
  descricaoItem: string;
  preco: number;
  precoVenda: number;
  unidade: string;
  categoria: string;
  quantidadeEstoque: number;
  ativo: string; // 'S' = ativo, 'N' = inativo
}

@Injectable({ providedIn: 'root' })
export class EstoqueService {

  private http = inject(HttpClient);
  private urlBase = 'http://localhost:5000/api/Estoque';

  // Lista todo o estoque
  listarEstoque(): Observable<ItemEstoque[]> {
    return this.http.get<ItemEstoque[]>(this.urlBase);
  }

  // Consulta o estoque de um item pelo ID
  buscarPorId(id: number): Observable<ItemEstoque> {
    return this.http.get<ItemEstoque>(this.urlBase + '/' + id);
  }
}