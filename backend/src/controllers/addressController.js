const repo = require('../models/modelAddress');
const cepService = require('../services/cepService');


async function createAddress(req, res, next) {
  try {
    const { street, number, complement, neighborhood, city, state, cep, address_name, full_name, phone_number } = req.body;
    const user_id = req.user.id;

    if( !street || !number || !neighborhood || !city || !state || !cep || !address_name || !full_name || !phone_number ) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const userAddressesExists = await repo.userAddressesExists({ user_id, street, number, complement, neighborhood, city, state, cep, address_name, full_name, phone_number });
    if(userAddressesExists) {
      return res.status(400).json({ message: 'Endereço já cadastrado' });
    }

    const result = await repo.createAddress({ user_id, street, number, complement, neighborhood, city, state, cep, address_name, full_name, phone_number });

    return res.status(201).json({ address: result, message: "Endereço cadastrado com sucesso" });
  } catch (e) {
    next(e);
  }
}

async function getAddressesById(req, res, next) {
  try {
    const user_id = req.user.id;
    const addresses = await repo.getAddressesByUserId(user_id);
    return res.status(200).json(addresses);
  } catch (e) {
    next(e);
  }
}

async function getAddressByCep(req, res, next) {
    const cep = req.query.cep;

    if (!cep) {
      return res.status(400).json({ message: 'CEP é obrigatório' });
    }
  
  try {
    const address = await cepService.getAddressByCep(cep);
    if (!address) {
      return res.status(404).json({ message: 'CEP não encontrado' });
    }
    
    return res.status(200).json(address);
  } catch (e) {
    next(e);
  }
}

async function updateAddress(req, res, next) {
  try {
    const id = req.body.id
    const user_id = req.user.id

    const updates = {};

    if (req.body.address_name !== undefined) updates.address_name = req.body.address_name;
    if (req.body.state !== undefined) updates.state = req.body.state;
    if (req.body.city !== undefined) updates.city = req.body.city;
    if (req.body.cep !== undefined) updates.cep = req.body.cep;
    if (req.body.neighborhood !== undefined) updates.neighborhood = req.body.neighborhood;
    if (req.body.street !== undefined) updates.street = req.body.street;
    if (req.body.number !== undefined) updates.number = req.body.number;
    if (req.body.complement !== undefined) updates.complement = req.body.complement;
    if (req.body.full_name !== undefined) updates.full_name = req.body.full_name;
    if (req.body.phone_number !== undefined) updates.phone_number = req.body.phone_number;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Nenhum campo para atualizar." });
    }

    const result = await repo.updateAddress(user_id, id, updates);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Endereço não encontrado ou nada foi alterado' });
    }

    return res.status(200).json({ message: 'Endereço atualizado com sucesso' });
  } catch (e) {
    next(e)
  }
}

async function deleteAddress(req, res, next) {
  try {
    const id = req.body.id
    const user_id = req.user.id

    const deleteAddress = await repo.deleteAddress(id, user_id)
    
    return res.status(200).json({ deleteAddress,  messagem: 'Endereço deletado com sucesso'})
  } catch (e) {
    next(e)
  }
}

module.exports = { createAddress, getAddressesById, getAddressByCep, updateAddress, deleteAddress };
