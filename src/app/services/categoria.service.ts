import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Estrutura de uma categoria
export interface Categoria {
  idcategoria: number;
  categoria: string;
}

// Dados necessários para cadastrar ou atualizar
export interface CategoriaDados {
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private http = inject(HttpClient);

  // Endereço da API
  private apiUrl = 'http://localhost:5000/api/Categoria';

  // Listar todas as categorias
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // Buscar categoria pelo ID
  buscarPorId(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  // Cadastrar categoria (o backend responde com um texto simples)
  cadastrarCategoria(dados: CategoriaDados): Observable<string> {
    return this.http.post(this.apiUrl, dados, { responseType: 'text' });
  }

  // Atualizar categoria (o backend responde com um texto simples)
  atualizarCategoria(id: number, dados: CategoriaDados): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}`, dados, { responseType: 'text' });
  }

  // Excluir categoria (o backend responde com um texto simples)
  excluirCategoria(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}