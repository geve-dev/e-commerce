// Estados fixos (UFs do Brasil). A cidade é digitada pelo usuário.
const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

function populateStates() {
  const stateSelect = document.getElementById('state');
  if (!stateSelect) return;

  const current = stateSelect.value;
  stateSelect.innerHTML = '<option value="">Selecione um estado</option>';
  BRAZIL_STATES.forEach((state) => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });
  if (current) stateSelect.value = current;
}

function getAddressFormFieldsHtml() {
  return `
    <p class="form-section-title">Identificação</p>
    <div class="form-group">
      <label for="address_name">Nome do endereço <span class="optional">(opcional)</span></label>
      <input type="text" id="address_name" name="address_name" placeholder="Ex: Casa, Trabalho">
    </div>

    <p class="form-section-title">Localização</p>
    <div class="two-cols">
      <div class="form-group">
        <label for="state">Estado</label>
        <select id="state" name="state" required>
          <option value="">Selecione um estado</option>
        </select>
      </div>
      <div class="form-group">
        <label for="city">Cidade</label>
        <input type="text" id="city" name="city" placeholder="Digite a cidade" required>
      </div>
      <div class="form-group">
        <label for="cep">CEP</label>
        <input type="text" id="cep" name="cep" placeholder="00000000" required maxlength="8">
      </div>
      <div class="form-group">
        <label for="neighborhood">Bairro</label>
        <input type="text" id="neighborhood" name="neighborhood" placeholder="Bairro" required>
      </div>
    </div>

    <p class="form-section-title">Logradouro</p>
    <div class="two-cols">
      <div class="form-group span-2">
        <label for="street">Rua</label>
        <input type="text" id="street" name="street" placeholder="Nome da rua" required>
      </div>
      <div class="form-group">
        <label for="number">Número</label>
        <input type="text" id="number" name="number" placeholder="Nº" required>
      </div>
      <div class="form-group">
        <label for="complement">Complemento <span class="optional">(opcional)</span></label>
        <input type="text" id="complement" name="complement" placeholder="Apto, bloco, etc.">
      </div>
    </div>

    <p class="form-section-title">Contato</p>
    <div class="two-cols">
      <div class="form-group">
        <label for="full_name">Nome completo</label>
        <input type="text" id="full_name" name="full_name" placeholder="Nome completo" required>
      </div>
      <div class="form-group">
        <label for="phone_number">Telefone</label>
        <input type="text" id="phone_number" name="phone_number" placeholder="(00) 00000-0000" required>
      </div>
    </div>
  `;
}

// Inicializa o select de estado (também após renderizar o form dinamicamente)
function initAddressOptions() {
  populateStates();
}

document.addEventListener('DOMContentLoaded', () => {
  initAddressOptions();
});
