const repo = require('../models/modelStore')

async function postStore(req, res, next) {
  try {
    const id_owner = req.user.id;
    const { name, slug, niche } = req.body;

    if (!name || !slug || !niche) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (await repo.findStoreBySlug(slug)) {
      return res.status(400).json({ error: 'Slug já existe' });
    }
    
    const store = await repo.postStore({ id_owner, name, slug, niche });
    
    return res.status(201).json({ store: store, message: "Store pendente, aguarde aprovação" });
  } catch (e) {
      next(e);
  }
};

async function getAllStore(req, res, next) {
  try {
    const stores = await repo.getAllStore();
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

module.exports = { postStore, getAllStore, getStorePending };
