const repo = require('../models/modelUser.js');
const bcrypt = require('bcrypt');

async function getAllUsers(req, res, next) {
    try {
        const users = await repo.getAllUsers();
        return res.status(200).json(users);
    } catch (e) {
        next(e);
    }
}

async function getUserById(req, res, next) {
    try {
        const user = await repo.getUserById(req.params.id);
        return res.status(200).json(user);
    } catch (e) {
        next(e);
    }
}

async function updateUser(req, res, next) {
    try {
        const targetId = req.params.id || req.user.id;
        const eu = req.user;

        // 1. Busca o usuário que será alterado para verificar o cargo dele
        const usuarioAlvo = await repo.getUserById(targetId);
        if (!usuarioAlvo) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // 2. Regra 1: Um cliente comum ('user') só altera o próprio perfil
        if (eu.id != targetId && eu.role !== 'adm') {
            return res.status(403).json({ message: "Você não tem permissão para editar outros usuários." });
        }
      
        // Monta objeto com apenas os campos enviados na requisição (atualização parcial)
        const updates = {};

        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.email !== undefined) updates.email = req.body.email;
        if (req.body.password !== undefined && req.body.password !== '') {
            updates.password = await bcrypt.hash(req.body.password, 10);
        }

        // Regra Especial: Apenas o Admin ('adm') pode alterar cargos.
        if (eu.role === 'adm' && req.body.role !== undefined) {
            updates.role = req.body.role;
        }

        // Se o email foi alterado, verificamos duplicidade
        if (updates.email) {
            const existUser = await repo.findUserByEmail(updates.email);
            if (existUser && existUser.id != targetId) return res.status(409).json({ message: "E-mail já cadastrado" });
        }

        // Se nenhum campo foi enviado, retorna erro
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Nenhum campo para atualizar." });
        }

        // Executa a atualização parcial no banco de dados
        await repo.updateUser(targetId, updates);

        // Busca os dados atualizados para retorno (sem senha)
        const updatedUser = await repo.getProfileById(targetId);

        return res.status(200).json({
            message: "Usuário atualizado com sucesso!",
            user: updatedUser
        });
    } catch (e) {
        next(e);
    }
}

async function deleteUser(req, res, next) {
    try {
        const targetId = req.params.id || req.user.id;
        const eu = req.user;

        const usuarioAlvo = await repo.getUserById(targetId);
        if (!usuarioAlvo) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        if (eu.id != targetId && eu.role !== 'adm' && eu.role !== 'mod') {
            return res.status(403).json({ message: "Você não tem permissão para deletar outros usuários." });
        }

        if (eu.role === 'mod' && usuarioAlvo.role === 'adm') {
            return res.status(403).json({ message: "Um moderador não pode deletar um administrador!" });
        }

        await repo.deleteUser(targetId);
        return res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } catch (e) {
        next(e);
    }
}

async function getMyProfile(req, res, next) {
    try {
        const id = req.user.id;
        const user = await repo.getProfileById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        return res.status(200).json(user);
    } catch (e) {
        next(e);
    }
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getMyProfile };