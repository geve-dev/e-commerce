const axios = require('axios');

const getAddressByCep = async (cep) => {
    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro) {
            return null; // CEP não encontrado
        }
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        return null;
    }
};

module.exports = { getAddressByCep };
