const repo = require('../models/modelItem');
const purchaseRepo = require('../models/modelPurchease');

async function createItem(req, res, next) {
    try {
        const { id_product, quantity } = req.body;
        const id_user = req.user.id

        if (!id_product || !quantity) {
            return res.status(400).json({ message: "Produto e quantidade são obrigatórios" });
        }

        let purchase = await purchaseRepo.findOpenPurchaseByUserId(id_user);

        if (!purchase) {
            purchase = await purchaseRepo.createPurchase(id_user);
        }

        const price = await repo.findPriceByProductId(id_product);

        const item = await repo.findItemByPurchaseAndProduct(purchase.id, id_product);
        if (item) {
            const result = await repo.addItemQuantity(purchase.id, id_product, quantity, price);
            return res.status(200).json({ message: 'Produto adicionado ao carrinho', result });
        }

        const result = await repo.createItem(id_product, purchase.id, quantity, price);

        return res.status(200).json({ message: 'Produto adicionado ao carrinho', result });
    } catch (e) {
        next(e)
    }
}

async function getItemsByPurchase(req, res, next) {
    try {
      const id_user = req.user.id;
      
      const purhcase = await purchaseRepo.findOpenPurchaseByUserId(id_user);

      if (!purhcase) {
          return res.status(404).json({ message: "Carrinho não encontrado" });
      }

      const items = await repo.findItemsByPurchase(purhcase.id);
      return res.status(200).json({ message: 'Itens do carrinho', items });
    } catch (e) {
        next(e)
    }
}

async function removeItemQuantity(req, res, next) {
    try {
        const { id_product, quantity } = req.body;
        const id_user = req.user.id

        if (!id_product || !quantity) {
            return res.status(400).json({ message: "Produto e quantidade são obrigatórios" });
        }

        let purchase = await purchaseRepo.findOpenPurchaseByUserId(id_user);

        if (!purchase) {
            return res.status(404).json({ message: "Carrinho não encontrado" });
        }

        const item = await repo.findItemByPurchaseAndProduct(purchase.id, id_product);
        if (!item) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        if (quantity > item.quantity) {
            await repo.deleteItem(purchase.id, id_product);
            return res.status(200).json({ message: "Item removido do carrinho" });
        }


        if (quantity === item.quantity) {
            await repo.deleteItem(purchase.id, id_product);
            return res.status(200).json({ message: "Item deletado do carrinho" });
        }

        const result = await repo.removeItemQuantity(purchase.id, id_product, quantity);
        return res.status(200).json({ message: 'Produto removido do carrinho', result });
    } catch (e) {
        next(e)
    }
}

async function deleteItem(req, res, next) {
    try {
        const { id_product } = req.body;
        const id_user = req.user.id

        if (!id_product) {
            return res.status(400).json({ message: "Produto e quantidade são obrigatórios" });
        }

        let purchase = await purchaseRepo.findOpenPurchaseByUserId(id_user);

        if (!purchase) {
            return res.status(404).json({ message: "Carrinho não encontrado" });
        }

        const item = await repo.findItemByPurchaseAndProduct(purchase.id, id_product);
        if (!item) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        const result = await repo.deleteItem(purchase.id, id_product);
        return res.status(200).json({ message: 'Produto deletado do carrinho', result });

    } catch (e) {
        next(e)
    }
}

module.exports = { createItem, getItemsByPurchase, removeItemQuantity, deleteItem }
