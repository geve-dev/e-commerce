const repo = require('../models/modelProduct.js');
const storeRepo = require('../models/modelStore.js');
const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(1, 'Obrigatório').max(120),
  description: z.string().min(1, 'Obrigatório').max(255),
  price: z.number().positive('Preço deve ser positivo'),
  stock: z.number().int().min(0, 'Estoque não pode ser negativo'),
  image: z.string().url('URL inválida').max(255).nullable().optional(),
  id_store: z.number().int().positive(),
  category: z.string().min(1, 'Obrigatório').max(60),
  slug: z.string().min(1, 'Obrigatório').max(120)
    .regex(/^[a-z0-9-]+$/, 'Apenas minúsculas, números e hífens'),
  discount: z.number().min(0).max(100).optional(),
});

async function createProduct(req, res, next) {
  try {
    const result = productSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { name, description, price, stock, image, id_store, category, slug } = result.data;

    if (await repo.findProductBySlug(slug)) {
      return res.status(400).json({ error: 'Slug já existe' });
    }

    const product = await repo.createProduct(name, description, price, stock, image, id_store, category, slug);

    return res.status(201).json({ product: product, message: "Produto criado com sucesso" });
    } catch (e) {
        next(e);
    }
}

async function getAllProducts(req, res, next) {
    try {
        const products = await repo.getAllProducts();
        return res.status(200).json(products);
    } catch (e) {
        next(e);
    }
}

async function getProductById(req, res, next) {
    try {
        const { id } = req.params;
        const product = await repo.getProductById(id);
        return res.status(200).json(product);
    } catch (e) {
        next(e);
    }
}

async function updateProduct(req, res, next) {
    try {
        const { id } = req.params;
        const { name, description, price, stock, image } = req.body;

        if (!name || typeof name !== 'string' || !description || typeof description !== 'string' || !price || typeof price !== 'number' || !stock || typeof stock !== 'number' || !image || typeof image !== 'string') {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        if (req.user.role !== 'adm' && req.user.role !== 'mod') {
            return res.status(403).json({ message: "Você não tem permissão para atualizar produtos" });
        }

        const result = await repo.updateProduct(id, name, description, price, stock, image);

        return res.status(200).json({ product: result, message: "Produto atualizado com sucesso" });
    } catch (e) {
        next(e);
    }
}

async function deleteProduct(req, res, next) {
    try {
        const { id } = req.params;

        if (req.user.role !== 'adm' && req.user.role !== 'mod') {
            return res.status(403).json({ message: "Você não tem permissão para deletar produtos" });
        }

        const result = await repo.deleteProduct(id);

        return res.status(200).json({ product: result, message: "Produto deletado com sucesso" });
    } catch (e) {
        next(e);
    }
}

async function getProductsByStoreID(req, res, next) {
  try {
    const { id_store } = req.params
    const store = await storeRepo.getStoreById(id_store)
    
    if (req.user.id !== store.id_owner && req.user.role !== 'adm') {
      return res.status(403).json({ message: "Você não tem permissão para acessar produtos dessa loja" });
    }
    
    const productsByStore = await repo.getProductsByStore(id_store);
    return res.status(200).json(productsByStore);
  } catch (e) {
    next(e)
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByStoreID
};
