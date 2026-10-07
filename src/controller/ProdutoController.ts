import { Produto } from "../model/Produto.js";
import { DatabaseModel } from "../model/DatabaseModel.js";
const database = new DatabaseModel().pool;
import type { Request, Response } from "express";

class ProdutoController extends Produto {

    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            const listaProdutos = await Produto.listarTodosProdutos();
            return res.status(200).json(listaProdutos);
        } catch (error) {
            console.error(`Erro ao listar produtos: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao acessar lista de produtos." });
        }
    }

    static async alerta(req: Request, res: Response): Promise<Response> {
        try {
            const produtosEmAlerta = await Produto.listarProdutosEmAlerta();
            return res.status(200).json(produtosEmAlerta);
        } catch (error) {
            console.error(`Erro ao listar produtos em alerta: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao acessar produtos em alerta." });
        }
    }

    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidos = req.body;
            const produto = new Produto(
                dadosRecebidos.descricao,
                dadosRecebidos.preco,
                dadosRecebidos.qtdEstoque,
                dadosRecebidos.qtdMinEstoque,
                dadosRecebidos.validade
            );
            const respostaModelo = await Produto.cadastrarProduto(produto);

            if (respostaModelo) {
                return res.status(201).json({ mensagem: "Produto cadastrado com sucesso." });
            } else {
                return res.status(400).json({ mensagem: "Erro ao cadastrar produto." });
            }
        } catch (error) {
            console.error(`Erro ao cadastrar produto: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao inserir produto." });
        }
    }

    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const idProdutoParam = req.params.idProduto;
            const idProduto = Number(idProdutoParam);

            if (isNaN(idProduto)) {
                return res.status(400).json({ erro: 'ID do produto inválido' });
            }
            const campos = req.body;
            const atualizado = await Produto.atualizarProduto(idProduto, campos);
            console.log(idProduto, campos);

            if (atualizado) {
                return res.status(200).json({ mensagem: "Produto atualizado com sucesso." });
            } else {
                return res.status(400).json({ mensagem: "Erro ao atualizar produto." });
            }
        } catch (error) {
            console.error(`Erro ao atualizar produto: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao atualizar produto." });
        }
    }

    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idProduto = Number(req.params.idProduto);
            if (isNaN(idProduto)) return res.status(400).json({ mensagem: 'ID inválido' });
            // Verifica se o produto está em itens de venda
            const r = await database.query('SELECT COUNT(*) AS cnt FROM item_venda WHERE id_produto = $1', [idProduto]);
            const cnt = Number(r.rows[0]?.cnt ?? 0);
            if (cnt > 0) return res.status(400).json({ mensagem: 'Não é possível excluir: produto está vinculado a vendas.' });

            const ok = await Produto.removerProduto(idProduto);
            return ok ? res.status(200).json({ mensagem: 'Produto removido com sucesso.' }) : res.status(400).json({ mensagem: 'Erro ao remover produto.' });
        } catch (error) {
            console.error(`Erro ao remover produto: ${error}`);
            return res.status(500).json({ mensagem: 'Erro ao remover produto.' });
        }
    }
}

export default ProdutoController;
