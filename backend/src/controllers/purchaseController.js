const repo = require('../models/modelPurchease');
const storeRepo = require('../models/modelStore');
const db = require('../config/db');

async function createPurchase(req, res, next) {
    try {
        const id_user = req.user.id;
        
        const existingPurchase = await repo.findOpenPurchaseByUserId(id_user);

        if (existingPurchase) {
            return res.status(400).json({ purchase: existingPurchase, message: 'Você já tem um carrinho aberto, continue usando ele.'});
        }

        const result = await repo.createPurchase(id_user, null);

        return res.status(201).json({ purchase: result, message: 'Pedido criado com sucesso' });
    } catch (e) {
        next(e)
    }
}

async function deletePurchase(req, res, next) {
    try {
        const id_user = req.user.id;
        const purchase = await repo.findOpenPurchaseByUserId(id_user);
        if (!purchase) return res.status(404).json({ message: 'Carrinho não encontrado' });

        // delete items then purchase
        await db.query('DELETE FROM items WHERE id_purchase = ?', [purchase.id]);
        await db.query('DELETE FROM purchase WHERE id = ?', [purchase.id]);

        return res.status(200).json({ message: 'Carrinho deletado com sucesso' });
    } catch (e) {
        next(e);
    }
}

async function checkout(req, res, next) {
    try {
        const id_user = req.user.id;
        const { payment_method_id } = req.body;

        if (!payment_method_id) return res.status(400).json({ message: 'payment_method_id é obrigatório' });

        const purchase = await repo.findOpenPurchaseByUserId(id_user);
        if (!purchase) return res.status(404).json({ message: 'Carrinho não encontrado' });

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // busca itens com estoque atual
            const [items] = await connection.query(`
                SELECT i.*, p.stock, p.price AS original_price
                FROM items i
                JOIN products p ON p.id = i.id_product
                WHERE i.id_purchase = ?
                FOR UPDATE
            `, [purchase.id]);

            if (!items || items.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Carrinho vazio' });
            }

            // valida estoque
            const insufficient = items.filter(it => Number(it.stock) < Number(it.quantity));
            if (insufficient.length > 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Estoque insuficiente para alguns produtos', details: insufficient.map(i => ({ id_product: i.id_product, requested: i.quantity, stock: i.stock })) });
            }

            // calcula total
            let total = items.reduce((acc, it) => acc + (Number(it.unit_value || it.original_price) * Number(it.quantity)), 0);
            total = Number(total.toFixed(2));

            // cria pagamento (status pending)
            const [paymentRes] = await connection.query('INSERT INTO payments (order_id, user_id, payment_method_id, amount, status) VALUES (?, ?, ?, ?, ?)', [purchase.id, id_user, payment_method_id, total, 'pending']);
            const paymentId = paymentRes.insertId;

            // atualiza estoque dos produtos
            for (const it of items) {
                await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [it.quantity, it.id_product]);
            }

            // fecha compra
            await connection.query('UPDATE purchase SET all_price = ?, status = ? WHERE id = ?', [total, 'fechado', purchase.id]);

            await connection.commit();

            return res.status(200).json({ message: 'Compra finalizada com sucesso', purchase: { id: purchase.id, all_price: total, status: 'fechado' }, payment: { id: paymentId, status: 'pending' } });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (e) {
        next(e);
    }
}

async function getAllPurchases(req, res, next) {
  try {
    const purchases = await repo.getAllPurchases();
    return res.status(200).json(purchases);
  } catch (e) {
    next(e);
  }
}

async function updatePurchaseStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: 'Status é obrigatório' });

    await repo.updatePurchaseStatus(id, status);
    return res.status(200).json({ message: 'Status atualizado com sucesso' });
  } catch (e) {
    next(e);
  }
}

async function getPurchasesByStore(req, res, next) {
  try {
    const { id_store } = req.params
    const store = await storeRepo.getStoreById(id_store)
    
    if (req.user.id !== store.id_owner && req.user.role !== 'adm') {
      return res.status(403).json({ message: "Você não tem permissão para acessar pedidos dessa loja" });
    }
    
    const purchases = await repo.getPurchasesByStore(id_store);
    return res.status(200).json(purchases);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createPurchase,
  deletePurchase,
  checkout,
  getAllPurchases,
  updatePurchaseStatus,
  getPurchasesByStore,
}