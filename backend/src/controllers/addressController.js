const repo = require('../models/modelAddress');
const cepService = require('../services/cepService');


async function createAddress(req, res, next) {
  try {
    const { street, number, complement, neighborhood, city, state, cep, full_name, phone_number } = req.body;
    const user_id = req.user.id;

    if( !street || !number || !neighborhood || !city || !state || !cep || !full_name || !phone_number ) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const result = await repo.createAddress({ user_id, street, number, complement, neighborhood, city, state, cep, full_name, phone_number });

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

module.exports = { createAddress, getAddressesById, getAddressByCep };
