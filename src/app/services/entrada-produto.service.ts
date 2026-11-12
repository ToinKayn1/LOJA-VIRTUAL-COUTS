import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Dados enviados para registrar uma entrada de produto
export interface NovaEntrada {
  iditem: number;
  dataEntradaProduto: string; // formato AAAA-MM-DD
  quantidadeEntrada: number;
  unidade: string;
  valorUnitarioEntrada: number;
}

// Uma entrada já registrada, como a API devolve
export interface EntradaRegistrada {
  identradaProduto: number;
  iditem: number;
  dataEntradaProduto: string;
  quantidadeEntrada: number;
  unidade: string;
  valorUnitarioEntrada: number;
}

@Injectable({ providedIn: 'root' })
export class EntradaProdutoService {

  private http = inject(HttpClient);
  private urlBase = 'http://localhost:5000/api/EntradaProduto';

  // Lista todas as entradas já registradas
  listarEntradas(): Observable<EntradaRegistrada[]> {
    return this.http.get<EntradaRegistrada[]>(this.urlBase);
  }

  // Registra uma entrada (o backend responde com um texto simples)
  registrarEntrada(entrada: NovaEntrada): Observable<string> {
    return this.http.post(this.urlBase, entrada, { responseType: 'text' });
  }
}