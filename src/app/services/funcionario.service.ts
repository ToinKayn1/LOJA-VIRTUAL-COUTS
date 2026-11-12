
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Dados de um endereço
export interface EnderecoFuncionario {
  idendereco?: number;
  idpessoa?: number;
  cep: string;
  numero: string;
  complemento: string;
}

// Dados pessoais do funcionário
export interface PessoaFuncionario {
  idpessoa: number;
  nome: string;
  cpf: number;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: number;
  ativoPessoa: string;
}

// Dados recebidos do Backend
export interface Funcionario {
  pessoaIdpessoa: number;
  cargo: string;
  dataAdmissao: string;
  pessoa: PessoaFuncionario;
  enderecos: EnderecoFuncionario[];
}

// Dados enviados para cadastrar
export interface FuncionarioCadastro {
  nome: string;
  cpf: number;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: number;
  cargo: string;
  ativoPessoa: string;
  dataAdmissao: string;
  enderecos: EnderecoFuncionario[];
}

// Dados enviados para atualizar
export interface FuncionarioAtualizacao {
  cargo: string;
  dataAdmissao: string;
  nome: string;
  cpf: number;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: number;
  ativoPessoa: string;
  enderecos: EnderecoFuncionario[];
}

@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/Funcionario';

  // Listar funcionários
  listarFuncionarios(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(this.apiUrl);
  }

  // Buscar funcionário pelo ID
  buscarFuncionario(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.apiUrl}/${id}`);
  }

  // Cadastrar funcionário
  cadastrarFuncionario(funcionario: FuncionarioCadastro): Observable<any> {
    return this.http.post<any>(this.apiUrl, funcionario);
  }

  // Atualizar funcionário
  atualizarFuncionario(
    id: number,
    funcionario: FuncionarioAtualizacao
  ): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      funcionario,
      { responseType: 'text' }
    );
  }

  // Excluir funcionário
  excluirFuncionario(id: number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { responseType: 'text' }
    );
  }
}
