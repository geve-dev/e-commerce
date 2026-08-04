const repo = require('../models/modelProduct.js');
const storeRepo = require('../models/modelStore.js');
const { z } = require('zod');
const { withPublicImage } = require('../utils/imageUrl');

const productSchema = z.object({
  name: z.string().min(1, 'Obrigatório').max(120),
  description: z.string().min(1, 'Obrigatório').max(255),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  stock: z.coerce.number().int().min(0, 'Estoque não pode ser negativo'),
  id_store: z.coerce.number().int().positive(),
  category: z.string().min(1, 'Obrigatório').max(60),
  slug: z.string().min(1, 'Obrigatório').max(120)
    .regex(/^[a-z0-9-]+$/, 'Apenas minúsculas, números e hífens'),
  discount: z.coerce.number().min(0).max(100).optional(),
});

const imageFileSchema = z.object({
  originalname: z.string(),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  path: z.string().min(1, 'Caminho do arquivo obrigatório'),
  filename: z.string(),
  size: z.number().max(5 * 1024 * 1024, 'Arquivo muito grande (máx 5MB)'),
});

async function createProduct(req, res, next) {
  try {
    const bodyResult = productSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ errors: bodyResult.error.issues });
    }

    const fileResult = imageFileSchema.safeParse(req.file);
    if (!fileResult.success) {
      return res.status(400).json({ errors: fileResult.error.issues });
    }

    const { name, description, price, stock, id_store, category, slug } = bodyResult.data;
    const imagePath = `/uploads/products/${fileResult.data.filename}`;

    if (await repo.findProductBySlug(slug)) {
      return res.status(400).json({ error: 'Slug já existe' });
    }

    const product = await repo.createProduct(name, description, price, stock, imagePath, id_store, category, slug);

    return res.status(201).json({ product: withPublicImage(product), message: "Produto criado com sucesso" });
    } catch (e) {
        next(e);
    }
}

async function getAllProducts(req, res, next) {
    try {
        const products = await repo.getAllProducts();
        return res.status(200).json(withPublicImage(products));
    } catch (e) {
        next(e);
    }
}

async function getProductById(req, res, next) {
    try {
        const { id } = req.params;
        const product = await repo.getProductById(id);
        return res.status(200).json(withPublicImage(product));
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
    return res.status(200).json(withPublicImage(productsByStore));
  } catch (e) {
    next(e)
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const product = await repo.findProductBySlug(slug);

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    return res.status(200).json(withPublicImage(product));
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByStoreID,
  getProductBySlug
};
