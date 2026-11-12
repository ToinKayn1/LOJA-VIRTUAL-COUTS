
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Dados enviados para cadastrar um cliente
export interface PessoaCadastro {
  nome: string;
  cpf: number;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: number;
}

// Resposta do cadastro
export interface PessoaResposta {
  mensagem: string;
  idpessoa: number;
}

// Dados recebidos do Backend
export interface PessoaAdmin {
  idpessoa: number;
  nome: string;
  cpf: number;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: number;
  ativoPessoa: string;
}

@Injectable({
  providedIn: 'root'
})
export class PessoaService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/Pessoa';

  // Cadastrar cliente
  cadastrarPessoa(pessoa: PessoaCadastro): Observable<PessoaResposta> {
    return this.http.post<PessoaResposta>(
      this.apiUrl,
      pessoa
    );
  }

  // Listar todos os clientes
  listarPessoas(): Observable<PessoaAdmin[]> {
    return this.http.get<PessoaAdmin[]>(this.apiUrl);
  }

  // Atualizar cliente pelo ID
  atualizarPessoa(
    id: number,
    pessoa: Omit<PessoaAdmin, 'idpessoa' | 'ativoPessoa'>
  ): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      pessoa,
      { responseType: 'text' }
    );
  }
}
