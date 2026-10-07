import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

export class Cliente {
  private idCliente?: number;  
  private nome: string;
  private cpf: string;

  constructor( _nome: string, _cpf: string) {    
    this.nome = _nome;
    this.cpf = _cpf;
  }

  // ========== GETTERS ==========
  public getIdCliente(): number | undefined { return this.idCliente; }
  public getCpf(): string { return this.cpf; }
  public getNome(): string { return this.nome; }

  // ========== SETTERS ==========
  public setIdCliente(_idCliente: number): void { this.idCliente = _idCliente }
  public setCpf(_cpf: string): void { this.cpf = _cpf; }
  public setNome(_nome: string): void { this.nome = _nome; }

  static async listarClientes(): Promise<Array<Cliente> | null> {
    try {
      let listaDeClientes: Array<Cliente> = [];
      const querySelectClientes = `SELECT * FROM cliente;`;

      const respostaBD = await database.query(querySelectClientes);

      // Percorre cada linha retornada pela consulta
      respostaBD.rows.forEach((clienteBD) => {
        // Cria um novo objeto Cliente usando os dados da linha atual (nome, cpf, telefone)
        const novoCliente: Cliente = new Cliente(
          clienteBD.nome,
          clienteBD.cpf
        );

        novoCliente.setIdCliente(clienteBD.id_cliente);
        console.log(novoCliente);
        listaDeClientes.push(novoCliente);

      });

      return listaDeClientes;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);
      return null;
    }
  }


  // CREATE
  static async cadastrarCliente(cliente: Cliente): Promise<boolean> {
    try {
      const queryInsertCliente = `INSERT INTO Cliente (nome, cpf)
        VALUES ( $1, $2)      
        RETURNING id_cliente;`;
        
      const result = await database.query(queryInsertCliente, [
        cliente.nome.toUpperCase(),
        cliente.cpf
      ]);

      if (result.rows.length > 0) {
        console.log(`Cliente cadastrado com sucesso. ID: ${result.rows[0].id_cliente}`);
        return true;
      }

      return false;

    } catch (error) {
      console.error(`Erro ao cadastrar cliente: ${error}`);
      return false
    }
  }

  static async atualizarCliente(idCliente: number, campos: Partial<{ nome: string; cpf: string }>): Promise<boolean> {
    try {
      const sets: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (campos.nome !== undefined) {
        sets.push(`nome = $${idx++}`);
        params.push(campos.nome.toUpperCase());
      }
      if (campos.cpf !== undefined) {
        sets.push(`cpf = $${idx++}`);
        params.push(campos.cpf);
      }

      if (sets.length === 0) return false;

      const query = `
        UPDATE cliente
           SET ${sets.join(', ')}
         WHERE id_cliente = $${idx}
         RETURNING id_cliente;
      `;
      params.push(idCliente);

      const result = await database.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Erro ao atualizar cliente: ${error}`);
      return false;
    }
  }

  static async removerCliente(idCliente: number): Promise<boolean> {
    try {
      const query = `DELETE FROM cliente WHERE id_cliente = $1 RETURNING id_cliente;`;
      const result = await database.query(query, [idCliente]);
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Erro ao remover cliente: ${error}`);
      return false;
    }
  }

  static async buscarPorId(idCliente: number): Promise<{ id_cliente: number; nome: string; cpf: string } | null> {
    try {
      const query = `SELECT id_cliente, nome, cpf FROM cliente WHERE id_cliente = $1`;
      const result = await database.query(query, [idCliente]);
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error(`Erro ao buscar cliente por id: ${error}`);
      return null;
    }
  }
} 
