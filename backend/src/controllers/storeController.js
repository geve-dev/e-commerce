const repo = require('../models/modelStore')
const { z } = require('zod');

const storeSchema = z.object({
  store_name: z.string().min(1, 'Obrigatório').max(120),
  niche: z.string().min(1, 'Obrigatório').max(60),
  description: z.string().min(1, 'Obrigatório').max(255),
  logo: z.string().url('URL inválida').max(255).nullable().optional(),
  banner: z.string().url('URL inválida').max(255).nullable().optional(),
  contact_email: z.string().email('Email inválido').max(100),
  contact_phone: z.string().min(1, 'Obrigatório').max(15),
  cnpj: z.string().min(1, 'Obrigatório').max(100),
  slug: z.string().min(1, 'Obrigatório').max(120)
    .regex(/^[a-z0-9-]+$/, 'Apenas minúsculas, números e hífens'),
});

async function postStore(req, res, next) {
  try {
    const id_owner = req.user.id;
    
    const result = storeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { store_name, slug, niche, description, contact_email, contact_phone, cnpj, logo, banner } = result.data;
    
    if (await repo.findStoreBySlug(slug)) {
      return res.status(400).json({ error: 'Slug já existe' });
    }
    
    const store = await repo.postStore({ id_owner, store_name, slug, niche, description, contact_email, contact_phone, cnpj, logo, banner });
    
    return res.status(201).json({ store, message: "Store pendente, aguarde aprovação" });
  } catch (e) {
    next(e);
  }
};

async function getAllStores(req, res, next) {
  try {
    const stores = await repo.getAllStores();
    return res.status(200).json(stores);
  } catch (e) {
    next(e);
  }
};

async function getAllStoresWithProduct(req, res, next) {
  try {
    const stores = await repo.getAllStoresWithProduct();
    return res.status(200).json(stores);
  } catch (e) {
    next(e);
  }
};

async function getStorePending(req, res, next) {
  try {
    const pendingStores = await repo.getStorePending();
    return res.status(200).json(pendingStores);
  } catch (e) {
    next(e);
  }
}

async function getStoreActive(req, res, next) {
  try {
    const activeStores = await repo.getStoreActive();
    return res.status(200).json(activeStores);
  } catch (e) {
    next(e);
  }
}

async function getStoreById(req, res, next) {
  try {
      const store = await repo.getStoreById(req.params.id);
      return res.status(200).json(store);
  } catch (e) {
      next(e);
  }
}


async function getStoresByUser(req, res, next) {
  try {
    const storesByUser = await repo.storesByUser(req.params.id);
    return res.status(200).json(storesByUser);
  } catch (e) {
    next(e);
  }
}  

async function getStoreBySlug(req, res, next) {
  try {
    const store = await repo.getStoreBySlug(req.params.slug);
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' });
    
    return res.status(200).json(store);
  } catch (e) { next(e); }
}

async function approveStore(req, res, next) {
  try {
    await repo.approveStore(req.params.id);
    return res.status(200).json({ message: 'Loja aprovada' });
  } catch (e) {
    next(e);
  }
}

async function reproveStore(req, res, next) {
  try {
    await repo.reproveStore(req.params.id);
    return res.status(200).json({ message: 'Loja reprovada' });
  } catch (e) {
    next(e);
  }
}

async function getProductsByStore(req, res, next) {
  try {
    const productsByStore = await repo.getProductsByStore();
    return res.status(200).json(productsByStore);
  } catch (e) {
    next(e)
  }
}

module.exports = {
  postStore,
  getAllStores,
  getAllStoresWithProduct,
  getStorePending,
  getStoreActive,
  getStoreById,
  getStoresByUser,
  getStoreBySlug,
  getProductsByStore,
  approveStore,
  reproveStore
};