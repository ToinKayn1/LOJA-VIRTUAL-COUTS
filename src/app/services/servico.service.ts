
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Servico {
  iditem: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/Item/servicos';

  listarServicos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.apiUrl);
  }
}
