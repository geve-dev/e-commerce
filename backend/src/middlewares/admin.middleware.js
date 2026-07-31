const db = require('../config/db');

function adminRequired(req, res, next) {
    if (req.user.role !== 'adm') {
        return res.status(403).json({ message: "Apenas administradores podem acessar aqui!" });
    }
    next();
}

function modOrAdminRequired(req, res, next) {
    if (req.user.role !== 'adm' && req.user.role !== 'mod') {
        return res.status(403).json({ message: "Recurso exclusivo para administradores ou moderadores." });
    }
    next();
}

async function storeOwnerRequired(req, res, next) {
  const storeId = req.params.id_store || req.body.id_store;
  const [[store]] = await db.query(`SELECT id_owner FROM stores WHERE id = ?`, [storeId]);
  if (!store) return res.status(404).json({ message: "Loja não encontrada" });
  if (req.user.id !== store.id_owner && req.user.role !== 'adm') {
    return res.status(403).json({ message: "Você não é o dono desta loja" });
  }
  next();
}


module.exports = { adminRequired, modOrAdminRequired, storeOwnerRequired };
