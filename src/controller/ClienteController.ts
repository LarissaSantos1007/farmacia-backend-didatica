import { Cliente } from "../model/Cliente.js";
import { DatabaseModel } from "../model/DatabaseModel.js";
const database = new DatabaseModel().pool;
import type { Request, Response } from "express";

class ClienteController extends Cliente {

    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            const listaClientes: Array<Cliente> | null = await Cliente.listarClientes();
            return res.status(200).json(listaClientes);

        } catch (error) {
            console.error(`Erro ao consultar modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possivel acessar a lista de clientes." });

        }
    }

    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidosCliente = req.body;
            const respostaModelo = await Cliente.cadastrarCliente(dadosRecebidosCliente);

            if (respostaModelo) {
                return res.status(201).json({ mensagem: "Cliente cadastrado com sucesso." });

            } else {
                return res.status(400).json({ mensagem: "Erro ao cadastrar cliente." });
            }

        } catch (error) {
            console.error(`Erro no modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível inserir o cliente" });
        }
    }

    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const idParam = Number(req.params.idCliente);
            if (isNaN(idParam)) return res.status(400).json({ mensagem: 'ID inválido' });
            const campos = req.body;
            const atualizado = await Cliente.atualizarCliente(idParam, campos as any);
            return atualizado ? res.status(200).json({ mensagem: 'Cliente atualizado com sucesso.' }) : res.status(400).json({ mensagem: 'Erro ao atualizar cliente.' });
        } catch (error) {
            console.error(`Erro ao atualizar cliente: ${error}`);
            return res.status(500).json({ mensagem: 'Erro ao atualizar cliente.' });
        }
    }

    static async obter(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.idCliente);
            if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido' });
            const cliente = await Cliente.buscarPorId(id);
            if (!cliente) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
            return res.status(200).json(cliente);
        } catch (error) {
            console.error(`Erro ao obter cliente: ${error}`);
            return res.status(500).json({ mensagem: 'Erro ao obter cliente.' });
        }
    }

    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idParam = Number(req.params.idCliente);
            if (isNaN(idParam)) return res.status(400).json({ mensagem: 'ID inválido' });
            // Verifica se o cliente possui pedidos registrados
            const r = await database.query('SELECT COUNT(*) AS cnt FROM venda WHERE id_cliente = $1', [idParam]);
            const cnt = Number(r.rows[0]?.cnt ?? 0);
            if (cnt > 0) return res.status(400).json({ mensagem: 'Não é possível excluir: cliente possui pedidos.' });

            const ok = await Cliente.removerCliente(idParam);
            return ok ? res.status(200).json({ mensagem: 'Cliente removido com sucesso.' }) : res.status(400).json({ mensagem: 'Erro ao remover cliente.' });
        } catch (error) {
            console.error(`Erro ao remover cliente: ${error}`);
            return res.status(500).json({ mensagem: 'Erro ao remover cliente.' });
        }
    }
}

export default ClienteController;