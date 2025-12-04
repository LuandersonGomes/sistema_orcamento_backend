const API_BASE = 'https://sistema-orcamento-backend.onrender.com/api';

class SistemaAdmin {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.authToken = '';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    setupEventListeners() {
        $('#loginForm').on('submit', (e) => {
            e.preventDefault();
            this.login();
        });
    }

    async login() {
        const username = $('#username').val();
        const password = $('#password').val();

        try {
            console.log('Enviando login com JSON:', { username, password });

            // ⭐ USE JSON EM VEZ DE FORMDATA ⭐
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
                // ⭐ REMOVA credentials: 'include' SE NÃO PRECISAR DE SESSÃO ⭐
            });

            console.log('Status do login:', response.status);
            console.log('Content-Type da resposta:', response.headers.get('content-type'));

            if (response.ok) {
                const data = await response.json();
                console.log('Login bem-sucedido:', data);

                this.isLoggedIn = true;
                this.currentUser = data.username;
                localStorage.setItem('currentUser', this.currentUser);

                this.showMainContent();
                this.showDashboard();
                this.showSuccess('Login realizado com sucesso!');
            } else {
                // Tenta ler como texto primeiro
                const errorText = await response.text();
                console.log('Erro completo:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    this.showError(errorData.error || 'Credenciais inválidas');
                } catch {
                    this.showError(errorText || 'Credenciais inválidas');
                }
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showError('Erro ao conectar com o servidor');
        }
    }

    // Função para fazer requisições autenticadas
    async makeAuthenticatedRequest(url, options = {}) {
        const defaultOptions = {
            credentials: 'include', // ⭐ ENVIA COOKIES DE SESSÃO AUTOMATICAMENTE
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(url, mergedOptions);

        if (response.status === 401) {
            this.logout();
            throw new Error('Não autorizado');
        }

        return response;
    }

    showMainContent() {
        $('#loginPage').hide();
        $('#mainContent').show();
        $('#userName').text(this.currentUser);
    }

    showDashboard() {
        const content = `
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0">Dashboard</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-lg-3 col-6">
                            <div class="small-box bg-info">
                                <div class="inner">
                                    <h3 id="countPessoasFisicas">0</h3>
                                    <p>Pessoas Físicas</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-user"></i>
                                </div>
                                <a href="#" onclick="showView('pessoa-fisica')" class="small-box-footer">
                                    Mais info <i class="fas fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-6">
                            <div class="small-box bg-success">
                                <div class="inner">
                                    <h3 id="countOrcamentos">0</h3>
                                    <p>Orçamentos</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-file-invoice-dollar"></i>
                                </div>
                                <a href="#" onclick="showView('orcamento')" class="small-box-footer">
                                    Mais info <i class="fas fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-6">
                            <div class="small-box bg-warning">
                                <div class="inner">
                                    <h3 id="countPessoasJuridicas">0</h3>
                                    <p>Pessoas Jurídicas</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-building"></i>
                                </div>
                                <a href="#" onclick="showView('pessoa-juridica')" class="small-box-footer">
                                    Mais info <i class="fas fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-6">
                            <div class="small-box bg-danger">
                                <div class="inner">
                                    <h3 id="countImoveis">0</h3>
                                    <p>Imóveis</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-home"></i>
                                </div>
                                <a href="#" onclick="showView('imovel')" class="small-box-footer">
                                    Mais info <i class="fas fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#content').html(content);
        this.loadDashboardCounts();
    }

    async loadDashboardCounts() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/dashboard/contadores`);
            const contadores = await response.json();

            $('#countPessoasFisicas').text(contadores.pessoasFisicas || 0);
            $('#countOrcamentos').text(contadores.orcamentos || 0);
            $('#countPessoasJuridicas').text(contadores.pessoasJuridicas || 0);
            $('#countImoveis').text(contadores.imoveis || 0);
        } catch (error) {
            console.error('Erro ao carregar contadores:', error);
        }
    }

    async showView(viewName) {
        $('.nav-link').removeClass('active');
        $(`[onclick="showView('${viewName}')"]`).addClass('active');

        switch(viewName) {
            case 'pessoa-fisica':
                await this.showPessoaFisica();
                break;
            case 'pessoa-juridica':
                await this.showPessoaJuridica();
                break;
            case 'imovel':
                await this.showImovel();
                break;
            case 'secretaria':
                await this.showSecretaria();
                break;
            case 'servico':
                await this.showServico();
                break;
            case 'orcamento':
                await this.showOrcamento();
                break;
            case 'usuarios':
                await this.showUsuarios();
                break;
            case 'tipo-documento':
                await this.showTipoDocumento();
                break;
            case 'checklist':
                await this.showChecklist();
                break;
        }
    }

    async showPessoaFisica() {
        const content = `
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0">Pessoas Físicas</h1>
                        </div>
                        <div class="col-sm-6">
                            <button class="btn btn-success float-right" onclick="sistema.showPessoaFisicaForm()">
                                <i class="fas fa-plus"></i> Nova Pessoa
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="container-fluid">
                    <div class="card">
                        <div class="card-body">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>CPF</th>
                                        <th>Nome</th>
                                        <th>Endereço</th>
                                        <th>Estado Civil</th>
                                        <th>Notificação</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="pessoaFisicaTable"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#content').html(content);
        await this.loadPessoasFisicas();
    }

    async loadPessoasFisicas() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/pessoas-fisicas`);
            const pessoas = await response.json();

            const table = $('#pessoaFisicaTable');
            table.html(pessoas.map(pessoa => `
                <tr>
                    <td>${pessoa.cpf || ''}</td>
                    <td>${pessoa.nomeCompleto}</td>
                    <td>${pessoa.endereco || ''}</td>
                    <td>${pessoa.estadoCivil || ''}</td>
                    <td>${pessoa.notificacao ? 'Sim' : 'Não'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="sistema.editPessoaFisica(${pessoa.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="sistema.deletePessoaFisica(${pessoa.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar pessoas físicas');
        }
    }

    showPessoaFisicaForm(pessoa = null) {
        const modalContent = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${pessoa ? 'Editar' : 'Nova'} Pessoa Física</h5>
                    <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="pessoaFisicaForm">
                        <input type="hidden" id="id" value="${pessoa ? pessoa.id : ''}">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="cpf">CPF *</label>
                                    <input type="text" class="form-control" id="cpf" value="${pessoa ? pessoa.cpf : ''}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="rg">RG</label>
                                    <input type="text" class="form-control" id="rg" value="${pessoa ? pessoa.rg : ''}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="nomeCompleto">Nome Completo *</label>
                            <input type="text" class="form-control" id="nomeCompleto" value="${pessoa ? pessoa.nomeCompleto : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="endereco">Endereço</label>
                            <textarea class="form-control" id="endereco" rows="3">${pessoa ? pessoa.endereco : ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="estadoCivil">Estado Civil</label>
                                    <select class="form-control" id="estadoCivil">
                                        <option value="">Selecione</option>
                                        <option value="Solteiro" ${pessoa && pessoa.estadoCivil === 'Solteiro' ? 'selected' : ''}>Solteiro(a)</option>
                                        <option value="Casado" ${pessoa && pessoa.estadoCivil === 'Casado' ? 'selected' : ''}>Casado(a)</option>
                                        <option value="Divorciado" ${pessoa && pessoa.estadoCivil === 'Divorciado' ? 'selected' : ''}>Divorciado(a)</option>
                                        <option value="Viúvo" ${pessoa && pessoa.estadoCivil === 'Viúvo' ? 'selected' : ''}>Viúvo(a)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <div class="form-check mt-4">
                                        <input type="checkbox" class="form-check-input" id="notificacao" ${pessoa && pessoa.notificacao ? 'checked' : ''}>
                                        <label class="form-check-label" for="notificacao">Receber Notificações</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="sistema.savePessoaFisica()">Salvar</button>
                </div>
            </div>
        </div>
    `;

        this.showModal(modalContent);
    }

    async savePessoaFisica() {
        const formData = {
            id: $('#id').val() || null,
            cpf: $('#cpf').val(),
            rg: $('#rg').val(),
            nomeCompleto: $('#nomeCompleto').val(),
            endereco: $('#endereco').val(),
            estadoCivil: $('#estadoCivil').val(),
            notificacao: $('#notificacao').is(':checked')
        };

        try {
            let url, method;

            if (formData.id) {
                url = `${API_BASE}/pessoas-fisicas/${formData.id}`;
                method = 'PUT';
            } else {
                url = `${API_BASE}/pessoas-fisicas`;
                method = 'POST';
            }

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.fecharModal(); // ⭐ Agora usa fecharModal
                await this.loadPessoasFisicas();
                this.showSuccess('Pessoa salva com sucesso!');
            } else {
                const errorText = await response.text();
                this.showError('Erro ao salvar pessoa: ' + response.status);
            }
        } catch (error) {
            this.showError('Erro ao conectar com o servidor');
        }
    }

    async editPessoaFisica(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/pessoas-fisicas/${id}`);
            const pessoa = await response.json();
            this.showPessoaFisicaForm(pessoa);
        } catch (error) {
            this.showError('Erro ao carregar pessoa');
        }
    }

    async deletePessoaFisica(id) {
        if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
            try {
                await this.makeAuthenticatedRequest(`${API_BASE}/pessoas-fisicas/${id}`, {
                    method: 'DELETE'
                });
                await this.loadPessoasFisicas();
                this.showSuccess('Pessoa excluída com sucesso!');
            } catch (error) {
                this.showError('Erro ao excluir pessoa');
            }
        }
    }

    // Métodos para Pessoa Jurídica
    async showPessoaJuridica() {
        const content = `
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0">Pessoas Jurídicas</h1>
                        </div>
                        <div class="col-sm-6">
                            <button class="btn btn-success float-right" onclick="sistema.showPessoaJuridicaForm()">
                                <i class="fas fa-plus"></i> Nova Empresa
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="container-fluid">
                    <div class="card">
                        <div class="card-body">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>CNPJ</th>
                                        <th>Razão Social</th>
                                        <th>Nome Fantasia</th>
                                        <th>Inscrição Estadual</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="pessoaJuridicaTable"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#content').html(content);
        await this.loadPessoasJuridicas();
    }

    async loadPessoasJuridicas() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/pessoas-juridicas`);
            const pessoas = await response.json();

            const table = $('#pessoaJuridicaTable');
            table.html(pessoas.map(pessoa => `
                <tr>
                    <td>${pessoa.cnpj || ''}</td>
                    <td>${pessoa.razaoSocial || ''}</td>
                    <td>${pessoa.nomeFantasia || ''}</td>
                    <td>${pessoa.inscricaoEstadual || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="sistema.editPessoaJuridica(${pessoa.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="sistema.deletePessoaJuridica(${pessoa.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar pessoas jurídicas');
        }
    }

    showPessoaJuridicaForm(pessoa = null) {
        const modalContent = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${pessoa ? 'Editar' : 'Nova'} Pessoa Jurídica</h5>
                    <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="pessoaJuridicaForm">
                        <input type="hidden" id="id" value="${pessoa ? pessoa.id : ''}">
                        <div class="form-group">
                            <label for="cnpj">CNPJ *</label>
                            <input type="text" class="form-control" id="cnpj" value="${pessoa ? pessoa.cnpj : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="razaoSocial">Razão Social *</label>
                            <input type="text" class="form-control" id="razaoSocial" value="${pessoa ? pessoa.razaoSocial : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="nomeFantasia">Nome Fantasia</label>
                            <input type="text" class="form-control" id="nomeFantasia" value="${pessoa ? pessoa.nomeFantasia : ''}">
                        </div>
                        <div class="form-group">
                            <label for="inscricaoEstadual">Inscrição Estadual</label>
                            <input type="text" class="form-control" id="inscricaoEstadual" value="${pessoa ? pessoa.inscricaoEstadual : ''}">
                        </div>
                        <div class="form-group">
                            <label for="ataConstitucao">Ata de Constituição</label>
                            <textarea class="form-control" id="ataConstitucao" rows="3">${pessoa ? pessoa.ataConstitucao : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="sistema.savePessoaJuridica()">Salvar</button>
                </div>
            </div>
        </div>
    `;

        this.showModal(modalContent);
    }

    async savePessoaJuridica() {
        const formData = {
            id: $('#id').val() || null,
            cnpj: $('#cnpj').val(),
            razaoSocial: $('#razaoSocial').val(),
            nomeFantasia: $('#nomeFantasia').val(),
            inscricaoEstadual: $('#inscricaoEstadual').val(),
            ataConstitucao: $('#ataConstitucao').val()
        };

        try {
            const url = formData.id ?
                `${API_BASE}/pessoas-juridicas/${formData.id}` :
                `${API_BASE}/pessoas-juridicas`;

            const method = formData.id ? 'PUT' : 'POST';

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                $('.modal').modal('hide');
                await this.loadPessoasJuridicas();
                this.showSuccess('Empresa salva com sucesso!');
            } else {
                this.showError('Erro ao salvar empresa');
            }
        } catch (error) {
            this.showError('Erro ao salvar empresa');
        }
    }

    async editPessoaJuridica(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/pessoas-juridicas/${id}`);
            const pessoa = await response.json();
            this.showPessoaJuridicaForm(pessoa);
        } catch (error) {
            this.showError('Erro ao carregar empresa');
        }
    }

    async deletePessoaJuridica(id) {
        if (confirm('Tem certeza que deseja excluir esta empresa?')) {
            try {
                await this.makeAuthenticatedRequest(`${API_BASE}/pessoas-juridicas/${id}`, {
                    method: 'DELETE'
                });
                await this.loadPessoasJuridicas();
                this.showSuccess('Empresa excluída com sucesso!');
            } catch (error) {
                this.showError('Erro ao excluir empresa');
            }
        }
    }

    // Métodos para Imóveis
    async showImovel() {
        const content = `
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0">Imóveis</h1>
                        </div>
                        <div class="col-sm-6">
                            <button class="btn btn-success float-right" onclick="sistema.showImovelForm()">
                                <i class="fas fa-plus"></i> Novo Imóvel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="container-fluid">
                    <div class="card">
                        <div class="card-body">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Lote</th>
                                        <th>Quadra</th>
                                        <th>Logradouro</th>
                                        <th>Matrícula</th>
                                        <th>Proprietário</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="imovelTable"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#content').html(content);
        await this.loadImoveis();
    }

    async loadImoveis() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/imoveis`);
            const imoveis = await response.json();

            const table = $('#imovelTable');
            table.html(imoveis.map(imovel => `
                <tr>
                    <td>${imovel.lote || ''}</td>
                    <td>${imovel.quadra || ''}</td>
                    <td>${imovel.logradouro || ''}</td>
                    <td>${imovel.matricula || ''}</td>
                    <td>${imovel.proprietarioFisico ? imovel.proprietarioFisico.nomeCompleto :
                imovel.proprietarioJuridico ? imovel.proprietarioJuridico.nomeFantasia : ''}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="sistema.editImovel(${imovel.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="sistema.deleteImovel(${imovel.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar imóveis');
        }
    }

    // Métodos para Orçamentos
    async showOrcamento() {
        const content = `
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0">Orçamentos</h1>
                        </div>
                        <div class="col-sm-6">
                            <button class="btn btn-success float-right" onclick="sistema.showOrcamentoForm()">
                                <i class="fas fa-plus"></i> Novo Orçamento
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="container-fluid">
                    <div class="card">
                        <div class="card-body">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Data Criação</th>
                                        <th>Imóvel</th>
                                        <th>Qtd. Serviços</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="orcamentoTable"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#content').html(content);
        await this.loadOrcamentos();
    }

    async loadOrcamentos() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/orcamentos`);
            const orcamentos = await response.json();

            const table = $('#orcamentoTable');
            table.html(orcamentos.map(orcamento => `
                <tr>
                    <td>${orcamento.descricao || ''}</td>
                    <td>${new Date(orcamento.dataCriacao).toLocaleDateString()}</td>
                    <td>${orcamento.imovel ? orcamento.imovel.logradouro : ''}</td>
                    <td>${orcamento.servicos ? orcamento.servicos.length : 0}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="sistema.showOrcamentoDetalhes(${orcamento.id})">
                            <i class="fas fa-eye"></i> Detalhes
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="sistema.editOrcamento(${orcamento.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="sistema.deleteOrcamento(${orcamento.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar orçamentos');
        }
    }

     async showOrcamentoDetalhes(orcamentoId) {
            try {
                const response = await this.makeAuthenticatedRequest(`${API_BASE}/orcamentos/${orcamentoId}`);
                const orcamento = await response.json();

                const content = `
                <div class="content-header">
                    <div class="container-fluid">
                        <div class="row mb-2">
                            <div class="col-sm-6">
                                <h1 class="m-0">Orçamento - ${orcamento.descricao}</h1>
                            </div>
                            <div class="col-sm-6">
                                <div class="float-right">
                                    <button class="btn btn-info mr-2" onclick="sistema.gerarPDFChecklistOrcamento(${orcamento.id})">
                                        <i class="fas fa-file-pdf"></i> Gerar Checklist PDF
                                    </button>
                                    <button class="btn btn-secondary" onclick="sistema.showView('orcamento')">
                                        <i class="fas fa-arrow-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content">
                    <div class="container-fluid">
                        <div class="card">
                            <div class="card-header">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h3 class="card-title">Informações do Orçamento</h3>
                                    <button class="btn btn-sm btn-info" onclick="sistema.gerarPDFChecklistOrcamento(${orcamento.id})">
                                        <i class="fas fa-file-pdf mr-1"></i> Checklist PDF
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>Descrição:</strong> ${orcamento.descricao}</p>
                                        <p><strong>Data de Criação:</strong> ${new Date(orcamento.dataCriacao).toLocaleDateString()}</p>
                                        <p><strong>Imóvel:</strong> ${orcamento.imovel ? orcamento.imovel.logradouro : 'N/A'}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Status:</strong>
                                            <span class="badge bg-${this.getStatusBadgeColor(orcamento.status)}">
                                                ${this.getStatusText(orcamento.status)}
                                            </span>
                                        </p>
                                        <p><strong>Quantidade de Serviços:</strong> ${orcamento.servicos ? orcamento.servicos.length : 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card mt-3">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-file-alt"></i> Documentos por Secretaria
                                </h3>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-12">
                                        <div id="secretariasTabs"></div>
                                        <div id="secretariasContent" class="mt-3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

                $('#content').html(content);
                await this.loadSecretariasOrcamento(orcamento);
            } catch (error) {
                this.showError('Erro ao carregar detalhes do orçamento');
            }
     }

    async loadSecretariasOrcamento(orcamento) {
        const tabs = document.getElementById('secretariasTabs');
        const content = document.getElementById('secretariasContent');

        // Agrupar serviços por secretaria
        const secretariasMap = new Map();

        if (orcamento.servicos) {
            for (const servico of orcamento.servicos) {
                if (servico.secretaria) {
                    if (!secretariasMap.has(servico.secretaria.id)) {
                        secretariasMap.set(servico.secretaria.id, {
                            secretaria: servico.secretaria,
                            servicos: []
                        });
                    }
                    secretariasMap.get(servico.secretaria.id).servicos.push(servico);
                }
            }
        }

        // Se não há secretarias, mostra mensagem
        if (secretariasMap.size === 0) {
            tabs.innerHTML = '<div class="alert alert-info">Nenhuma secretaria encontrada para os serviços deste orçamento.</div>';
            content.innerHTML = '';
            return;
        }

        let tabsHTML = '<ul class="nav nav-tabs" id="secretariaTabs" role="tablist">';
        let contentHTML = '<div class="tab-content" id="secretariaContent">';

        let index = 0;
        for (const [secretariaId, data] of secretariasMap) {
            const active = index === 0 ? 'active' : '';
            const tabId = `tab-${secretariaId}`;
            const contentId = `secretaria-${secretariaId}`;

            tabsHTML += `
            <li class="nav-item" role="presentation">
                <button class="nav-link ${active}" id="${tabId}" data-bs-toggle="tab" 
                        data-bs-target="#${contentId}" type="button" role="tab"
                        aria-controls="${contentId}" aria-selected="${index === 0}">
                    <i class="fas fa-landmark me-1"></i>${data.secretaria.nome}
                    <span class="badge bg-secondary ms-1">${data.servicos.length}</span>
                </button>
            </li>
        `;

            contentHTML += `
            <div class="tab-pane fade show ${active}" id="${contentId}" role="tabpanel" 
                 aria-labelledby="${tabId}">
                <div class="secretaria-content">
                    <h5 class="mb-4">
                        <i class="fas fa-landmark text-primary me-2"></i>
                        ${data.secretaria.nome}
                    </h5>
                    
                    <!-- Serviços e Documentos -->
                    ${await this.generateServicosDocumentosHTML(data.servicos, orcamento.id)}
                    
                </div>
            </div>
        `;

            index++;
        }

        tabsHTML += '</ul>';
        contentHTML += '</div>';

        tabs.innerHTML = tabsHTML;
        content.innerHTML = contentHTML;
    }

    async generateServicosDocumentosHTML(servicos, orcamentoId) {
        let html = '';

        // Carrega documentos enviados uma vez para todos os serviços
        const documentosEnviados = await this.loadDocumentosEnviados(orcamentoId);

        for (const servico of servicos) {
            console.log(`Processando serviço: ${servico.id} - ${servico.nome}`);

            // Carrega checklist para este serviço
            const documentosChecklist = await this.loadDocumentosChecklist(servico.id);

            console.log(`Documentos checklist:`, documentosChecklist);
            console.log(`Documentos enviados:`, documentosEnviados);

            html += `
            <div class="card mb-4">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                        <i class="fas fa-cogs text-warning me-2"></i>
                        <strong>${servico.nome}</strong>
                    </h6>
                    <span class="badge bg-primary">
                        ${documentosChecklist.length} documento(s)
                    </span>
                </div>
                <div class="card-body">
                    ${this.generateDocumentosHTML(documentosChecklist, documentosEnviados, servico.id, orcamentoId)}
                </div>
            </div>
        `;
        }

        return html;
    }

    async loadDocumentosServico(servicoId, orcamentoId) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/checklist/servico/${servicoId}`);
            const checklist = await response.json();

            const documentosDiv = document.getElementById(`documentos-${servicoId}`);
            if (documentosDiv) {
                documentosDiv.innerHTML = checklist.tiposDocumentos ? checklist.tiposDocumentos.map(tipo => `
                    <div class="mb-3 p-3 border rounded">
                        <h6>${tipo.nomeTipo}</h6>
                        <input type="file" class="form-control mb-2" 
                               onchange="sistema.uploadDocumento(${tipo.id}, ${servicoId}, ${orcamentoId}, this)">
                        <small class="text-muted">Faça o upload do documento</small>
                    </div>
                `).join('') : '<p>Nenhum documento necessário para este serviço.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar documentos do serviço:', error);
        }
    }

    async loadDocumentosChecklist(servicoId) {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${API_BASE}/checklist/servico/${servicoId}`
            );

            if (response.ok) {
                const data = await response.json();
                return data.tiposDocumentos || [];
            }
            return [];
        } catch (error) {
            console.error('Erro ao carregar checklist:', error);
            return [];
        }
    }

    async loadDocumentosEnviados(orcamentoId) {
        try {
            // Carrega todos documentos do orçamento
            const response = await this.makeAuthenticatedRequest(
                `${API_BASE}/documentos/orcamento/${orcamentoId}`
            );

            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Erro ao carregar documentos enviados:', error);
            return [];
        }
    }

    async loadDocumentosAuxiliares(orcamentoId, secretariaId) {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${API_BASE}/documentos-auxiliares/orcamento/${orcamentoId}/secretaria/${secretariaId}`
            );

            let documentoAuxiliar = null;
            if (response.ok) {
                documentoAuxiliar = await response.json();
            }

            const auxiliaresDiv = document.getElementById(`documentos-auxiliares-${secretariaId}`);
            if (!auxiliaresDiv) return;

            auxiliaresDiv.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="font-weight-bold">Boleto:</label>
                            <input type="file" class="form-control mb-2" 
                                   onchange="sistema.uploadDocumentoAuxiliar('boleto', ${orcamentoId}, ${secretariaId}, this)">
                            ${documentoAuxiliar && documentoAuxiliar.boleto ?
                `<small class="text-success">Arquivo salvo: ${documentoAuxiliar.boleto}</small>` :
                '<small class="text-muted">Nenhum arquivo enviado</small>'}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="font-weight-bold">Licença Final:</label>
                            <input type="file" class="form-control mb-2" 
                                   onchange="sistema.uploadDocumentoAuxiliar('licencaFinal', ${orcamentoId}, ${secretariaId}, this)">
                            ${documentoAuxiliar && documentoAuxiliar.licencaFinal ?
                `<small class="text-success">Arquivo salvo: ${documentoAuxiliar.licencaFinal}</small>` :
                '<small class="text-muted">Nenhum arquivo enviado</small>'}
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="font-weight-bold">NC (Nota de Crédito):</label>
                            <input type="file" class="form-control mb-2" 
                                   onchange="sistema.uploadDocumentoAuxiliar('nc', ${orcamentoId}, ${secretariaId}, this)">
                            ${documentoAuxiliar && documentoAuxiliar.nc ?
                `<small class="text-success">Arquivo salvo: ${documentoAuxiliar.nc}</small>` :
                '<small class="text-muted">Nenhum arquivo enviado</small>'}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="font-weight-bold">4P:</label>
                            <input type="file" class="form-control mb-2" 
                                   onchange="sistema.uploadDocumentoAuxiliar('campo4p', ${orcamentoId}, ${secretariaId}, this)">
                            ${documentoAuxiliar && documentoAuxiliar.campo4p ?
                `<small class="text-success">Arquivo salvo: ${documentoAuxiliar.campo4p}</small>` :
                '<small class="text-muted">Nenhum arquivo enviado</small>'}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Erro ao carregar documentos auxiliares:', error);
        }
    }

    async uploadDocumentoAuxiliar(campo, orcamentoId, secretariaId, input) {
        const file = input.files[0];
        if (!file) return;

        try {
            // Simular upload - em produção, enviaria o arquivo real para o servidor
            const fileName = `${campo}_${orcamentoId}_${secretariaId}_${Date.now()}_${file.name}`;

            // Salvar referência no banco de dados
            const documentoAuxiliar = {
                orcamento: { id: orcamentoId },
                secretaria: { id: secretariaId },
                [campo]: fileName
            };

            const response = await this.makeAuthenticatedRequest(
                `${API_BASE}/documentos-auxiliares/orcamento/${orcamentoId}/secretaria/${secretariaId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(documentoAuxiliar)
                }
            );

            if (response.ok) {
                this.showSuccess('Documento auxiliar salvo com sucesso!');
                // Recarregar a visualização para mostrar o arquivo salvo
                await this.loadDocumentosAuxiliares(orcamentoId, secretariaId);
            } else {
                this.showError('Erro ao salvar documento auxiliar');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            this.showError('Erro no upload do documento');
        }
    }

    async uploadDocumento(tipoDocumentoId, servicoId, orcamentoId, input) {
        const file = input.files[0];
        if (!file) return;

        try {
            // Simular upload
            const fileName = `doc_${tipoDocumentoId}_${servicoId}_${orcamentoId}_${Date.now()}_${file.name}`;

            // Salvar documento principal
            const documento = {
                tipo: { id: tipoDocumentoId },
                orcamento: { id: orcamentoId },
                arquivoLocal: fileName
            };

            const response = await this.makeAuthenticatedRequest(`${API_BASE}/documentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(documento)
            });

            if (response.ok) {
                this.showSuccess('Documento salvo com sucesso!');
            } else {
                this.showError('Erro ao salvar documento');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            this.showError('Erro no upload do documento');
        }
    }

    generateDocumentosHTML(documentosChecklist, documentosEnviados, servicoId, orcamentoId) {
        if (documentosChecklist.length === 0) {
            return `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Nenhum documento configurado para este serviço.
            </div>
        `;
        }

        let html = '<div class="row">';

        documentosChecklist.forEach(tipoDocumento => {
            // Encontra se já existe documento deste tipo para este orçamento
            const documentoEnviado = documentosEnviados.find(doc =>
                doc.tipo && doc.tipo.id === tipoDocumento.id
            );

            html += `
            <div class="col-md-6 mb-3">
                <div class="documento-card border rounded p-3 h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0">
                            <i class="fas fa-file text-primary me-2"></i>
                            ${tipoDocumento.nomeTipo}
                        </h6>
                        ${documentoEnviado ?
                '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Enviado</span>' :
                '<span class="badge bg-warning"><i class="fas fa-clock me-1"></i>Pendente</span>'
            }
                    </div>
                    
                    <div class="documento-actions">
                        ${documentoEnviado ?
                this.generateDocumentoActions(documentoEnviado, orcamentoId) :
                this.generateUploadForm(tipoDocumento, orcamentoId)
            }
                    </div>
                    
                    ${documentoEnviado ? this.generateDocumentoInfo(documentoEnviado) : ''}
                </div>
            </div>
        `;
        });

        html += '</div>';
        return html;
    }

    generateDocumentoActions(documentoEnviado, orcamentoId) {
        return `
        <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-sm btn-info"
                    onclick="sistema.viewDocumentoInfo(${documentoEnviado.id})">
                <i class="fas fa-download me-1"></i>Baixar
            </button>
            <button type="button" class="btn btn-sm btn-danger"
                    onclick="sistema.deleteDocumento(${documentoEnviado.id}, ${orcamentoId})">
                <i class="fas fa-trash me-1"></i>Excluir
            </button>
        </div>
    `;
    }

    generateDocumentoInfo(documentoEnviado) {
        return `
        <div class="documento-info mt-2 p-2 bg-light rounded">
            <small class="text-muted d-block">
                <i class="fas fa-file me-1"></i>
                Arquivo: ${documentoEnviado.arquivoLocal}
            </small>
            <small class="text-muted">
                <i class="fas fa-calendar me-1"></i>
                Data: ${documentoEnviado.dataUpload ? new Date(documentoEnviado.dataUpload).toLocaleDateString() : 'N/A'}
            </small>
        </div>
    `;
    }


    // Métodos para Secretarias
    async showSecretaria() {
        const content = `
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0">Secretarias</h1>
                        </div>
                        <div class="col-sm-6">
                            <button class="btn btn-success float-right" onclick="sistema.showSecretariaForm()">
                                <i class="fas fa-plus"></i> Nova Secretaria
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="container-fluid">
                    <div class="card">
                        <div class="card-body">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="secretariaTable"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#content').html(content);
        await this.loadSecretarias();
    }

    async loadSecretarias() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/secretarias`);
            const secretarias = await response.json();

            const table = $('#secretariaTable');
            table.html(secretarias.map(secretaria => `
                <tr>
                    <td>${secretaria.nome}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="sistema.editSecretaria(${secretaria.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="sistema.deleteSecretaria(${secretaria.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar secretarias');
        }
    }

    // MÉTODOS PARA USUÁRIOS
    async showUsuarios() {
        const content = `
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0">Gerenciar Usuários</h1>
                        </div>
                        <div class="col-sm-6">
                            <button class="btn btn-success float-right" onclick="sistema.showUsuarioForm()">
                                <i class="fas fa-plus"></i> Novo Usuário
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="container-fluid">
                    <div class="card">
                        <div class="card-body">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuário</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="usuarioTable"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#content').html(content);
        await this.loadUsuarios();
    }

    async loadUsuarios() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/usuarios`);
            const usuarios = await response.json();

            const table = $('#usuarioTable');
            table.html(usuarios.map(usuario => `
                <tr>
                    <td>${usuario.id}</td>
                    <td>${usuario.username}</td>
                    <td>
                        <span class="badge ${usuario.ativo ? 'bg-success' : 'bg-danger'}">
                            ${usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="sistema.editUsuario(${usuario.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="sistema.deleteUsuario(${usuario.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar usuários');
        }
    }

    showUsuarioForm(usuario = null) {
        const modalContent = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${usuario ? 'Editar' : 'Novo'} Usuário</h5>
                    <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="usuarioForm">
                        <input type="hidden" id="id" value="${usuario ? usuario.id : ''}">
                        <div class="form-group">
                            <label for="username">Usuário *</label>
                            <input type="text" class="form-control" id="username" value="${usuario ? usuario.username : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Senha *</label>
                            <input type="password" class="form-control" id="password" ${usuario ? '' : 'required'}>
                            ${usuario ? '<small class="text-muted">Deixe em branco para manter a senha atual</small>' : ''}
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="ativo" ${usuario && usuario.ativo ? 'checked' : ''}>
                            <label class="form-check-label" for="ativo">Usuário Ativo</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="sistema.saveUsuario()">Salvar</button>
                </div>
            </div>
        </div>
    `;

        this.showModal(modalContent);
    }


    async saveUsuario() {
        const formData = {
            id: $('#id').val() || null,
            username: $('#username').val(),
            ativo: $('#ativo').is(':checked')
        };

        // Só inclui a senha se foi preenchida
        const password = $('#password').val();
        if (password) {
            formData.password = password;
        }

        try {
            const url = formData.id ?
                `${API_BASE}/usuarios/${formData.id}` :
                `${API_BASE}/usuarios`;

            const method = formData.id ? 'PUT' : 'POST';

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                $('.modal').modal('hide');
                await this.loadUsuarios();
                this.showSuccess('Usuário salvo com sucesso!');
            } else {
                this.showError('Erro ao salvar usuário. Verifique se o nome de usuário já existe.');
            }
        } catch (error) {
            this.showError('Erro ao salvar usuário');
        }
    }

    async editUsuario(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/usuarios/${id}`);
            const usuario = await response.json();
            this.showUsuarioForm(usuario);
        } catch (error) {
            this.showError('Erro ao carregar usuário');
        }
    }

    async deleteUsuario(id) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await this.makeAuthenticatedRequest(`${API_BASE}/usuarios/${id}`, {
                    method: 'DELETE'
                });
                await this.loadUsuarios();
                this.showSuccess('Usuário excluído com sucesso!');
            } catch (error) {
                this.showError('Erro ao excluir usuário');
            }
        }
    }

    // Métodos auxiliares
    showModal(content) {
        // Remove qualquer modal existente
        $('#modalContainer').remove();

        // Cria o novo modal
        const modalHtml = `
        <div class="modal fade" id="modalContainer" tabindex="-1" role="dialog" aria-hidden="true">
            ${content}
        </div>
    `;

        // Adiciona ao body
        $('body').append(modalHtml);

        // Mostra o modal
        $('#modalContainer').modal('show');

        // Configura evento para remover o modal quando fechar
        $('#modalContainer').on('hidden.bs.modal', function () {
            $(this).remove();
        });
    }

    // Métodos para Imóveis
    async showImovel() {
        const content = `
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Imóveis</h1>
                    </div>
                    <div class="col-sm-6">
                        <button class="btn btn-success float-right" onclick="sistema.showImovelForm()">
                            <i class="fas fa-plus"></i> Novo Imóvel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="container-fluid">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Lote</th>
                                    <th>Quadra</th>
                                    <th>Logradouro</th>
                                    <th>Matrícula</th>
                                    <th>Proprietário</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="imovelTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
        $('#content').html(content);
        await this.loadImoveis();
    }

    async loadImoveis() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/imoveis`);
            const imoveis = await response.json();

            const table = $('#imovelTable');
            table.html(imoveis.map(imovel => `
            <tr>
                <td>${imovel.lote || ''}</td>
                <td>${imovel.quadra || ''}</td>
                <td>${imovel.logradouro || ''}</td>
                <td>${imovel.matricula || ''}</td>
                <td>${imovel.proprietarioFisico ? imovel.proprietarioFisico.nomeCompleto :
                imovel.proprietarioJuridico ? imovel.proprietarioJuridico.nomeFantasia : ''}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="sistema.editImovel(${imovel.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="sistema.deleteImovel(${imovel.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar imóveis');
        }
    }

    showImovelForm(imovel = null) {
        // Primeiro carrega as pessoas para os selects
        this.carregarProprietarios().then(({ pessoasFisicas, pessoasJuridicas }) => {
            const modalContent = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${imovel ? 'Editar' : 'Novo'} Imóvel</h5>
                        <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="imovelForm">
                            <input type="hidden" id="id" value="${imovel ? imovel.id : ''}">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="lote">Lote</label>
                                        <input type="text" class="form-control" id="lote" value="${imovel ? imovel.lote : ''}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="quadra">Quadra</label>
                                        <input type="text" class="form-control" id="quadra" value="${imovel ? imovel.quadra : ''}">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="logradouro">Logradouro</label>
                                <input type="text" class="form-control" id="logradouro" value="${imovel ? imovel.logradouro : ''}">
                            </div>
                            <div class="form-group">
                                <label for="matricula">Matrícula</label>
                                <input type="text" class="form-control" id="matricula" value="${imovel ? imovel.matricula : ''}">
                            </div>
                            <div class="form-group">
                                <label for="docPosse">Documento de Posse</label>
                                <input type="text" class="form-control" id="docPosse" value="${imovel ? imovel.docPosse : ''}">
                            </div>
                            
                            <!-- Seleção de Proprietário -->
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="proprietarioFisico">Proprietário (Pessoa Física)</label>
                                        <select class="form-control" id="proprietarioFisico">
                                            <option value="">Selecione uma pessoa física</option>
                                            ${pessoasFisicas.map(pessoa => `
                                                <option value="${pessoa.id}" ${imovel && imovel.proprietarioFisico && imovel.proprietarioFisico.id === pessoa.id ? 'selected' : ''}>
                                                    ${pessoa.nomeCompleto} - ${pessoa.cpf}
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="proprietarioJuridico">Proprietário (Pessoa Jurídica)</label>
                                        <select class="form-control" id="proprietarioJuridico">
                                            <option value="">Selecione uma pessoa jurídica</option>
                                            ${pessoasJuridicas.map(pessoa => `
                                                <option value="${pessoa.id}" ${imovel && imovel.proprietarioJuridico && imovel.proprietarioJuridico.id === pessoa.id ? 'selected' : ''}>
                                                    ${pessoa.nomeFantasia} - ${pessoa.cnpj}
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <small class="text-muted">Obs: Selecione apenas um tipo de proprietário (Física OU Jurídica)</small>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="sistema.saveImovel()">Salvar</button>
                    </div>
                </div>
            </div>
        `;

            this.showModal(modalContent);
        }).catch(error => {
            this.showError('Erro ao carregar lista de proprietários');
        });
    }

// Método para carregar pessoas físicas e jurídicas
    async carregarProprietarios() {
        try {
            const [responseFisica, responseJuridica] = await Promise.all([
                this.makeAuthenticatedRequest(`${API_BASE}/pessoas-fisicas`),
                this.makeAuthenticatedRequest(`${API_BASE}/pessoas-juridicas`)
            ]);

            const pessoasFisicas = await responseFisica.json();
            const pessoasJuridicas = await responseJuridica.json();

            return { pessoasFisicas, pessoasJuridicas };
        } catch (error) {
            console.error('Erro ao carregar proprietários:', error);
            return { pessoasFisicas: [], pessoasJuridicas: [] };
        }
    }

    async saveImovel() {
        const proprietarioFisicoId = $('#proprietarioFisico').val();
        const proprietarioJuridicoId = $('#proprietarioJuridico').val();

        const formData = {
            id: $('#id').val() || null,
            lote: $('#lote').val(),
            quadra: $('#quadra').val(),
            logradouro: $('#logradouro').val(),
            matricula: $('#matricula').val(),
            docPosse: $('#docPosse').val()
        };

        // Adiciona o proprietário selecionado
        if (proprietarioFisicoId) {
            formData.proprietarioFisico = { id: proprietarioFisicoId };
        } else if (proprietarioJuridicoId) {
            formData.proprietarioJuridico = { id: proprietarioJuridicoId };
        }

        try {
            const url = formData.id ?
                `${API_BASE}/imoveis/${formData.id}` :
                `${API_BASE}/imoveis`;

            const method = formData.id ? 'PUT' : 'POST';

            console.log('Enviando dados do imóvel:', formData);

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.fecharModal();
                await this.loadImoveis();
                this.showSuccess('Imóvel salvo com sucesso!');
            } else {
                const errorText = await response.text();
                console.error('Erro do servidor:', errorText);
                this.showError('Erro ao salvar imóvel: ' + response.status);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro ao salvar imóvel');
        }
    }

    async editImovel(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/imoveis/${id}`);
            const imovel = await response.json();
            this.showImovelForm(imovel);
        } catch (error) {
            this.showError('Erro ao carregar imóvel');
        }
    }

    async deleteImovel(id) {
        if (confirm('Tem certeza que deseja excluir este imóvel?')) {
            try {
                await this.makeAuthenticatedRequest(`${API_BASE}/imoveis/${id}`, {
                    method: 'DELETE'
                });
                await this.loadImoveis();
                this.showSuccess('Imóvel excluído com sucesso!');
            } catch (error) {
                this.showError('Erro ao excluir imóvel');
            }
        }
    }

    // Métodos para Secretaria
    async showSecretaria() {
        const content = `
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Secretarias</h1>
                    </div>
                    <div class="col-sm-6">
                        <button class="btn btn-success float-right" onclick="sistema.showSecretariaForm()">
                            <i class="fas fa-plus"></i> Nova Secretaria
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="container-fluid">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="secretariaTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
        $('#content').html(content);
        await this.loadSecretarias();
    }

    async loadSecretarias() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/secretarias`);
            const secretarias = await response.json();

            const table = $('#secretariaTable');
            table.html(secretarias.map(secretaria => `
            <tr>
                <td>${secretaria.nome}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="sistema.editSecretaria(${secretaria.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="sistema.deleteSecretaria(${secretaria.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar secretarias');
        }
    }

    showSecretariaForm(secretaria = null) {
        const modalContent = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${secretaria ? 'Editar' : 'Nova'} Secretaria</h5>
                    <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="secretariaForm">
                        <input type="hidden" id="id" value="${secretaria ? secretaria.id : ''}">
                        <div class="form-group">
                            <label for="nome">Nome *</label>
                            <input type="text" class="form-control" id="nome" value="${secretaria ? secretaria.nome : ''}" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="sistema.saveSecretaria()">Salvar</button>
                </div>
            </div>
        </div>
    `;

        this.showModal(modalContent);
    }

    async saveSecretaria() {
        const formData = {
            id: $('#id').val() || null,
            nome: $('#nome').val()
        };

        try {
            const url = formData.id ?
                `${API_BASE}/secretarias/${formData.id}` :
                `${API_BASE}/secretarias`;

            const method = formData.id ? 'PUT' : 'POST';

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.fecharModal();
                await this.loadSecretarias();
                this.showSuccess('Secretaria salva com sucesso!');
            } else {
                this.showError('Erro ao salvar secretaria');
            }
        } catch (error) {
            this.showError('Erro ao salvar secretaria');
        }
    }

    async editSecretaria(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/secretarias/${id}`);
            const secretaria = await response.json();
            this.showSecretariaForm(secretaria);
        } catch (error) {
            this.showError('Erro ao carregar secretaria');
        }
    }

    async deleteSecretaria(id) {
        if (confirm('Tem certeza que deseja excluir esta secretaria?')) {
            try {
                await this.makeAuthenticatedRequest(`${API_BASE}/secretarias/${id}`, {
                    method: 'DELETE'
                });
                await this.loadSecretarias();
                this.showSuccess('Secretaria excluída com sucesso!');
            } catch (error) {
                this.showError('Erro ao excluir secretaria');
            }
        }
    }

// Métodos para Serviços
    async showServico() {
        const content = `
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Serviços</h1>
                    </div>
                    <div class="col-sm-6">
                        <button class="btn btn-success float-right" onclick="sistema.showServicoForm()">
                            <i class="fas fa-plus"></i> Novo Serviço
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="container-fluid">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Secretaria</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="servicoTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
        $('#content').html(content);
        await this.loadServicos();
    }

    async loadServicos() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/servicos`);
            const servicos = await response.json();

            const table = $('#servicoTable');
            table.html(servicos.map(servico => `
            <tr>
                <td>${servico.nome}</td>
                <td>${servico.secretaria ? servico.secretaria.nome : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="sistema.editServico(${servico.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="sistema.deleteServico(${servico.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar serviços');
        }
    }

    async showServicoForm(servico = null) {
        // Carrega as secretarias para o select
        const secretarias = await this.carregarSecretarias();

        const modalContent = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${servico ? 'Editar' : 'Novo'} Serviço</h5>
                    <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="servicoForm">
                        <input type="hidden" id="id" value="${servico ? servico.id : ''}">
                        <div class="form-group">
                            <label for="nome">Nome do Serviço *</label>
                            <input type="text" class="form-control" id="nome" value="${servico ? servico.nome : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="secretaria">Secretaria Responsável *</label>
                            <select class="form-control" id="secretaria" required>
                                <option value="">Selecione uma secretaria</option>
                                ${secretarias.map(secretaria => `
                                    <option value="${secretaria.id}" ${servico && servico.secretaria && servico.secretaria.id === secretaria.id ? 'selected' : ''}>
                                        ${secretaria.nome}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="descricao">Descrição</label>
                            <textarea class="form-control" id="descricao" rows="3">${servico ? servico.descricao : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="sistema.saveServico()">Salvar</button>
                </div>
            </div>
        </div>
    `;

        this.showModal(modalContent);
    }

// Método para carregar secretarias
    async carregarSecretarias() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/secretarias`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar secretarias:', error);
            return [];
        }
    }

    async saveServico() {
        const secretariaId = $('#secretaria').val();

        const formData = {
            id: $('#id').val() || null,
            nome: $('#nome').val(),
            descricao: $('#descricao').val()
        };

        // Adiciona a secretaria selecionada
        if (secretariaId) {
            formData.secretaria = { id: secretariaId };
        }

        // Validação
        if (!formData.nome || !secretariaId) {
            this.showError('Nome e Secretaria são obrigatórios');
            return;
        }

        try {
            const url = formData.id ?
                `${API_BASE}/servicos/${formData.id}` :
                `${API_BASE}/servicos`;

            const method = formData.id ? 'PUT' : 'POST';

            console.log('Enviando dados do serviço:', formData);

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.fecharModal();
                await this.loadServicos();
                this.showSuccess('Serviço salvo com sucesso!');
            } else {
                const errorText = await response.text();
                console.error('Erro do servidor:', errorText);
                this.showError('Erro ao salvar serviço: ' + response.status);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro ao salvar serviço');
        }
    }

    async editServico(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/servicos/${id}`);

            if (response.ok) {
                const servico = await response.json();
                this.showServicoForm(servico);
            } else {
                this.showError('Erro ao carregar serviço');
            }
        } catch (error) {
            console.error('Erro ao carregar serviço:', error);
            this.showError('Erro ao carregar serviço');
        }
    }

    async deleteServico(id) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                const response = await this.makeAuthenticatedRequest(`${API_BASE}/servicos/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadServicos();
                    this.showSuccess('Serviço excluído com sucesso!');
                } else {
                    this.showError('Erro ao excluir serviço');
                }
            } catch (error) {
                console.error('Erro ao excluir serviço:', error);
                this.showError('Erro ao excluir serviço');
            }
        }
    }

    // Métodos para Orçamentos
    async showOrcamento() {
        const content = `
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Orçamentos</h1>
                    </div>
                    <div class="col-sm-6">
                        <button class="btn btn-success float-right" onclick="sistema.showOrcamentoForm()">
                            <i class="fas fa-plus"></i> Novo Orçamento
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="container-fluid">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Data Criação</th>
                                    <th>Imóvel</th>
                                    <th>Qtd. Serviços</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="orcamentoTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
        $('#content').html(content);
        await this.loadOrcamentos();
    }

    async loadOrcamentos() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/orcamentos`);
            const orcamentos = await response.json();

            const table = $('#orcamentoTable');
            table.html(orcamentos.map(orcamento => `
            <tr>
                <td>${orcamento.descricao || ''}</td>
                <td>${new Date(orcamento.dataCriacao).toLocaleDateString()}</td>
                <td>${orcamento.imovel ? orcamento.imovel.logradouro : 'N/A'}</td>
                <td>${orcamento.servicos ? orcamento.servicos.length : 0}</td>
                <td>
                    <span class="badge bg-${this.getStatusBadgeColor(orcamento.status)}">
                        ${this.getStatusText(orcamento.status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="sistema.showOrcamentoDetalhes(${orcamento.id})">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="sistema.editOrcamento(${orcamento.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="sistema.deleteOrcamento(${orcamento.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar orçamentos');
        }
    }

// Métodos auxiliares para status
    getStatusBadgeColor(status) {
        const colors = {
            'RASCUNHO': 'secondary',
            'ENVIADO': 'warning',
            'APROVADO': 'success',
            'REJEITADO': 'danger',
            'CANCELADO': 'dark'
        };
        return colors[status] || 'secondary';
    }

    getStatusText(status) {
        const textos = {
            'RASCUNHO': 'Rascunho',
            'ENVIADO': 'Enviado',
            'APROVADO': 'Aprovado',
            'REJEITADO': 'Rejeitado',
            'CANCELADO': 'Cancelado'
        };
        return textos[status] || 'Rascunho';
    }

    async showOrcamentoForm(orcamento = null) {
        // Carrega dados necessários
        const [imoveis, servicos] = await Promise.all([
            this.carregarImoveis(),
            this.carregarServicos()
        ]);

        const modalContent = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${orcamento ? 'Editar' : 'Novo'} Orçamento</h5>
                    <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="orcamentoForm">
                        <input type="hidden" id="id" value="${orcamento ? orcamento.id : ''}">
                        
                        <div class="row">
                            <div class="col-md-8">
                                <div class="form-group">
                                    <label for="descricao">Descrição do Orçamento *</label>
                                    <input type="text" class="form-control" id="descricao" 
                                           value="${orcamento ? orcamento.descricao : ''}" required
                                           placeholder="Ex: Reforma do imóvel XYZ">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="status">Status</label>
                                    <select class="form-control" id="status">
                                        <option value="RASCUNHO" ${orcamento && orcamento.status === 'RASCUNHO' ? 'selected' : ''}>Rascunho</option>
                                        <option value="ENVIADO" ${orcamento && orcamento.status === 'ENVIADO' ? 'selected' : ''}>Enviado</option>
                                        <option value="APROVADO" ${orcamento && orcamento.status === 'APROVADO' ? 'selected' : ''}>Aprovado</option>
                                        <option value="REJEITADO" ${orcamento && orcamento.status === 'REJEITADO' ? 'selected' : ''}>Rejeitado</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="imovel">Imóvel *</label>
                            <select class="form-control" id="imovel" required>
                                <option value="">Selecione um imóvel</option>
                                ${imoveis.map(imovel => `
                                    <option value="${imovel.id}" ${orcamento && orcamento.imovel && orcamento.imovel.id === imovel.id ? 'selected' : ''}>
                                        ${imovel.logradouro} - ${imovel.lote || ''}/${imovel.quadra || ''}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Serviços Selecionados</label>
                            <div id="servicosSelecionados" class="border rounded p-2 mb-3" style="min-height: 100px; max-height: 200px; overflow-y: auto;">
                                ${orcamento && orcamento.servicos ? orcamento.servicos.map(servico => `
                                    <span class="badge bg-primary me-2 mb-2 p-2">
                                        ${servico.nome}
                                        <button type="button" class="btn-close btn-close-white ms-1" onclick="sistema.removerServico(${servico.id})"></button>
                                    </span>
                                `).join('') : '<small class="text-muted">Nenhum serviço selecionado</small>'}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="servicoSelect">Adicionar Serviços</label>
                            <div class="input-group">
                                <select class="form-control" id="servicoSelect">
                                    <option value="">Selecione um serviço para adicionar</option>
                                    ${servicos.map(servico => `
                                        <option value="${servico.id}">
                                            ${servico.nome} - ${servico.secretaria ? servico.secretaria.nome : 'N/A'}
                                        </option>
                                    `).join('')}
                                </select>
                                <button type="button" class="btn btn-primary" onclick="sistema.adicionarServico()">
                                    <i class="fas fa-plus"></i> Adicionar
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="observacoes">Observações</label>
                            <textarea class="form-control" id="observacoes" rows="3" 
                                      placeholder="Observações adicionais sobre o orçamento">${orcamento ? orcamento.observacoes : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="sistema.saveOrcamento()">Salvar Orçamento</button>
                </div>
            </div>
        </div>
    `;

        this.showModal(modalContent);

        // Inicializa a lista de serviços selecionados
        this.servicosSelecionados = orcamento && orcamento.servicos ?
            orcamento.servicos.map(s => s.id) : [];
    }

// Métodos para gerenciar serviços no orçamento
    adicionarServico() {
        const servicoSelect = document.getElementById('servicoSelect');
        const servicoId = servicoSelect.value;

        if (!servicoId) {
            this.showError('Selecione um serviço para adicionar');
            return;
        }

        // Evita duplicatas
        if (this.servicosSelecionados.includes(parseInt(servicoId))) {
            this.showError('Este serviço já foi adicionado');
            return;
        }

        this.servicosSelecionados.push(parseInt(servicoId));
        this.atualizarListaServicos();
        servicoSelect.value = '';
    }

    removerServico(servicoId) {
        this.servicosSelecionados = this.servicosSelecionados.filter(id => id !== servicoId);
        this.atualizarListaServicos();
    }

    atualizarListaServicos() {
        const container = document.getElementById('servicosSelecionados');

        if (this.servicosSelecionados.length === 0) {
            container.innerHTML = '<small class="text-muted">Nenhum serviço selecionado</small>';
            return;
        }

        // Busca os detalhes dos serviços para mostrar os nomes
        this.carregarServicos().then(servicos => {
            const servicosFiltrados = servicos.filter(s => this.servicosSelecionados.includes(s.id));
            container.innerHTML = servicosFiltrados.map(servico => `
            <span class="badge bg-primary me-2 mb-2 p-2">
                ${servico.nome}
                <button type="button" class="btn-close btn-close-white ms-1" onclick="sistema.removerServico(${servico.id})"></button>
            </span>
        `).join('');
        });
    }

    async saveOrcamento() {
        const imovelId = $('#imovel').val();

        const formData = {
            id: $('#id').val() || null,
            descricao: $('#descricao').val(),
            status: $('#status').val(),
            observacoes: $('#observacoes').val()
        };

        // Validação
        if (!formData.descricao || !imovelId) {
            this.showError('Descrição e Imóvel são obrigatórios');
            return;
        }

        if (this.servicosSelecionados.length === 0) {
            this.showError('Adicione pelo menos um serviço ao orçamento');
            return;
        }

        // Adiciona relacionamentos
        formData.imovel = { id: imovelId };
        formData.servicos = this.servicosSelecionados.map(id => ({ id }));

        try {
            const url = formData.id ?
                `${API_BASE}/orcamentos/${formData.id}` :
                `${API_BASE}/orcamentos`;

            const method = formData.id ? 'PUT' : 'POST';

            console.log('Enviando dados do orçamento:', formData);

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.fecharModal();
                await this.loadOrcamentos();
                this.showSuccess('Orçamento salvo com sucesso!');
            } else {
                const errorText = await response.text();
                console.error('Erro do servidor:', errorText);
                this.showError('Erro ao salvar orçamento: ' + response.status);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro ao salvar orçamento');
        }
    }

    async editOrcamento(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/orcamentos/${id}`);

            if (response.ok) {
                const orcamento = await response.json();
                this.showOrcamentoForm(orcamento);
            } else {
                this.showError('Erro ao carregar orçamento');
            }
        } catch (error) {
            console.error('Erro ao carregar orçamento:', error);
            this.showError('Erro ao carregar orçamento');
        }
    }

    async deleteOrcamento(id) {
        if (confirm('Tem certeza que deseja excluir este orçamento?')) {
            try {
                const response = await this.makeAuthenticatedRequest(`${API_BASE}/orcamentos/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadOrcamentos();
                    this.showSuccess('Orçamento excluído com sucesso!');
                } else {
                    this.showError('Erro ao excluir orçamento');
                }
            } catch (error) {
                console.error('Erro ao excluir orçamento:', error);
                this.showError('Erro ao excluir orçamento');
            }
        }
    }

// Métodos auxiliares para carregar dados
    async carregarImoveis() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/imoveis`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar imóveis:', error);
            return [];
        }
    }

    async carregarServicos() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/servicos`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            return [];
        }
    }

    // Métodos para Tipo de Documentos
    async showTipoDocumento() {
        const content = `
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Tipos de Documentos</h1>
                    </div>
                    <div class="col-sm-6">
                        <button class="btn btn-success float-right" onclick="sistema.showTipoDocumentoForm()">
                            <i class="fas fa-plus"></i> Novo Tipo
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="container-fluid">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome do Tipo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="tipoDocumentoTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
        $('#content').html(content);
        await this.loadTiposDocumento();
    }

    async loadTiposDocumento() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/tipos-documento`);
            const tipos = await response.json();

            const table = $('#tipoDocumentoTable');
            table.html(tipos.map(tipo => `
            <tr>
                <td>${tipo.id}</td>
                <td>${tipo.nomeTipo}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="sistema.editTipoDocumento(${tipo.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="sistema.deleteTipoDocumento(${tipo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar tipos de documento');
        }
    }

    showTipoDocumentoForm(tipo = null) {
        const modalContent = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${tipo ? 'Editar' : 'Novo'} Tipo de Documento</h5>
                    <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="tipoDocumentoForm">
                        <input type="hidden" id="id" value="${tipo ? tipo.id : ''}">
                        <div class="form-group">
                            <label for="nomeTipo">Nome do Tipo *</label>
                            <input type="text" class="form-control" id="nomeTipo" 
                                   value="${tipo ? tipo.nomeTipo : ''}" required
                                   placeholder="Ex: RG, CPF, Contrato, etc.">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="sistema.saveTipoDocumento()">Salvar</button>
                </div>
            </div>
        </div>
    `;

        this.showModal(modalContent);
    }

    async saveTipoDocumento() {
        const formData = {
            id: $('#id').val() || null,
            nomeTipo: $('#nomeTipo').val()
        };

        // Validação
        if (!formData.nomeTipo) {
            this.showError('Nome do tipo é obrigatório');
            return;
        }

        try {
            const url = formData.id ?
                `${API_BASE}/tipos-documento/${formData.id}` :
                `${API_BASE}/tipos-documento`;

            const method = formData.id ? 'PUT' : 'POST';

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.fecharModal();
                await this.loadTiposDocumento();
                this.showSuccess('Tipo de documento salvo com sucesso!');
            } else {
                this.showError('Erro ao salvar tipo de documento');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro ao salvar tipo de documento');
        }
    }

    async editTipoDocumento(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/tipos-documento/${id}`);

            if (response.ok) {
                const tipo = await response.json();
                this.showTipoDocumentoForm(tipo);
            } else {
                this.showError('Erro ao carregar tipo de documento');
            }
        } catch (error) {
            console.error('Erro ao carregar tipo de documento:', error);
            this.showError('Erro ao carregar tipo de documento');
        }
    }

    async deleteTipoDocumento(id) {
        if (confirm('Tem certeza que deseja excluir este tipo de documento?')) {
            try {
                const response = await this.makeAuthenticatedRequest(`${API_BASE}/tipos-documento/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadTiposDocumento();
                    this.showSuccess('Tipo de documento excluído com sucesso!');
                } else {
                    this.showError('Erro ao excluir tipo de documento');
                }
            } catch (error) {
                console.error('Erro ao excluir tipo de documento:', error);
                this.showError('Erro ao excluir tipo de documento');
            }
        }
    }


    async handleDocumentUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const tipoDocumentoId = input.getAttribute('data-tipo-documento-id');
        const orcamentoId = input.getAttribute('data-orcamento-id');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('tipoDocumentoId', tipoDocumentoId);
            formData.append('orcamentoId', orcamentoId);

            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE}/documentos/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${token}`
                },
                body: formData
            });

            if (response.ok) {
                this.showSuccess('Documento enviado com sucesso!');
                // Recarregar a visualização do orçamento
                await this.showOrcamentoDetalhes(orcamentoId);
            } else {
                const errorText = await response.text();
                this.showError('Erro ao enviar documento: ' + errorText);
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            this.showError('Erro ao enviar documento: ' + error.message);
        }
    }

    generateUploadForm(tipoDocumento, orcamentoId) {
        return `
        <div class="upload-area">
            <input type="file" 
                   class="form-control documento-upload" 
                   data-tipo-documento-id="${tipoDocumento.id}"
                   data-orcamento-id="${orcamentoId}"
                   onchange="sistema.handleDocumentUpload(this)"
                   accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
            <small class="form-text text-muted">
                Formatos aceitos: PDF, Word, JPG, PNG
            </small>
        </div>
    `;
    }


    async downloadDocumento(documentoId) {
        await this.viewDocumentoInfo(documentoId); // Reusa a mesma lógica
    }

    async viewDocumentoInfo(documentoId) {
        try {
            // Tenta baixar o documento diretamente
            const url = `${API_BASE}/documentos/download/${documentoId}`;

            // Cria um link temporário para download
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank'; // Abre em nova aba
            a.rel = 'noopener noreferrer';

            // Adiciona token de autenticação se necessário
            if (this.authToken) {
                a.setAttribute('data-token', this.authToken);
            }

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            this.showSuccess('Iniciando download do documento...');

        } catch (error) {
            console.error('Erro ao baixar documento:', error);
            this.showError('Erro ao baixar documento. Tente novamente.');
        }
    }

    async deleteDocumento(documentoId, orcamentoId) {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            try {
                const response = await this.makeAuthenticatedRequest(
                    `${API_BASE}/documentos/${documentoId}`,
                    {
                        method: 'DELETE'
                    }
                );

                if (response.ok) {
                    this.showSuccess('Documento excluído com sucesso!');
                    // Recarregar a visualização do orçamento
                    if (orcamentoId) {
                        await this.showOrcamentoDetalhes(orcamentoId);
                    }
                } else {
                    this.showError('Erro ao excluir documento');
                }
            } catch (error) {
                console.error('Erro:', error);
                this.showError('Erro ao excluir documento');
            }
        }
    }

    // Métodos para Checklist de Documentos
    async showChecklist() {
        const content = `
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Checklist de Documentos</h1>
                    </div>
                    <div class="col-sm-6">
                        <button class="btn btn-success float-right" onclick="sistema.showChecklistForm()">
                            <i class="fas fa-plus"></i> Novo Checklist
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="container-fluid">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Secretaria</th>
                                    <th>Serviço</th>
                                    <th>Qtd. Documentos</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="checklistTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
        $('#content').html(content);
        await this.loadChecklists();
    }

    async loadChecklists() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/checklist`);
            const checklists = await response.json();

            const table = $('#checklistTable');
            table.html(checklists.map(checklist => `
            <tr>
                <td>${checklist.id}</td>
                <td>${checklist.secretaria ? checklist.secretaria.nome : 'N/A'}</td>
                <td>${checklist.servico ? checklist.servico.nome : 'N/A'}</td>
                <td>${checklist.tiposDocumentos ? checklist.tiposDocumentos.length : 0}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="sistema.showChecklistDetalhes(${checklist.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="sistema.editChecklist(${checklist.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="sistema.deleteChecklist(${checklist.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));
        } catch (error) {
            this.showError('Erro ao carregar checklists');
        }
    }

    async showChecklistForm(checklist = null) {
        // Carrega dados necessários
        const [secretarias, servicos, tiposDocumento] = await Promise.all([
            this.carregarSecretarias(),
            this.carregarServicos(),
            this.carregarTiposDocumento()
        ]);

        const modalContent = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${checklist ? 'Editar' : 'Novo'} Checklist</h5>
                    <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="checklistForm">
                        <input type="hidden" id="id" value="${checklist ? checklist.id : ''}">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="secretaria">Secretaria *</label>
                                    <select class="form-control" id="secretaria" required>
                                        <option value="">Selecione uma secretaria</option>
                                        ${secretarias.map(secretaria => `
                                            <option value="${secretaria.id}" ${checklist && checklist.secretaria && checklist.secretaria.id === secretaria.id ? 'selected' : ''}>
                                                ${secretaria.nome}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="servico">Serviço *</label>
                                    <select class="form-control" id="servico" required>
                                        <option value="">Selecione um serviço</option>
                                        ${servicos.map(servico => `
                                            <option value="${servico.id}" ${checklist && checklist.servico && checklist.servico.id === servico.id ? 'selected' : ''}>
                                                ${servico.nome}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Documentos Obrigatórios</label>
                            <div id="documentosSelecionados" class="border rounded p-2 mb-3" style="min-height: 100px; max-height: 200px; overflow-y: auto;">
                                ${checklist && checklist.tiposDocumentos ? checklist.tiposDocumentos.map(tipo => `
                                    <span class="badge bg-primary me-2 mb-2 p-2">
                                        ${tipo.nomeTipo}
                                        <button type="button" class="btn-close btn-close-white ms-1" onclick="sistema.removerDocumentoChecklist(${tipo.id})"></button>
                                    </span>
                                `).join('') : '<small class="text-muted">Nenhum documento selecionado</small>'}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="tipoDocumentoSelect">Adicionar Documentos</label>
                            <div class="input-group">
                                <select class="form-control" id="tipoDocumentoSelect">
                                    <option value="">Selecione um tipo de documento</option>
                                    ${tiposDocumento.map(tipo => `
                                        <option value="${tipo.id}">
                                            ${tipo.nomeTipo}
                                        </option>
                                    `).join('')}
                                </select>
                                <button type="button" class="btn btn-primary" onclick="sistema.adicionarDocumentoChecklist()">
                                    <i class="fas fa-plus"></i> Adicionar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="sistema.saveChecklist()">Salvar Checklist</button>
                </div>
            </div>
        </div>
    `;

        this.showModal(modalContent);

        // Inicializa a lista de documentos selecionados
        this.documentosChecklistSelecionados = checklist && checklist.tiposDocumentos ?
            checklist.tiposDocumentos.map(t => t.id) : [];
    }

// Métodos para gerenciar documentos no checklist
    adicionarDocumentoChecklist() {
        const tipoDocumentoSelect = document.getElementById('tipoDocumentoSelect');
        const tipoDocumentoId = tipoDocumentoSelect.value;

        if (!tipoDocumentoId) {
            this.showError('Selecione um tipo de documento para adicionar');
            return;
        }

        // Evita duplicatas
        if (this.documentosChecklistSelecionados.includes(parseInt(tipoDocumentoId))) {
            this.showError('Este documento já foi adicionado');
            return;
        }

        this.documentosChecklistSelecionados.push(parseInt(tipoDocumentoId));
        this.atualizarListaDocumentosChecklist();
        tipoDocumentoSelect.value = '';
    }

    removerDocumentoChecklist(tipoDocumentoId) {
        this.documentosChecklistSelecionados = this.documentosChecklistSelecionados.filter(id => id !== tipoDocumentoId);
        this.atualizarListaDocumentosChecklist();
    }

    atualizarListaDocumentosChecklist() {
        const container = document.getElementById('documentosSelecionados');

        if (this.documentosChecklistSelecionados.length === 0) {
            container.innerHTML = '<small class="text-muted">Nenhum documento selecionado</small>';
            return;
        }

        // Busca os detalhes dos tipos de documento para mostrar os nomes
        this.carregarTiposDocumento().then(tipos => {
            const tiposFiltrados = tipos.filter(t => this.documentosChecklistSelecionados.includes(t.id));
            container.innerHTML = tiposFiltrados.map(tipo => `
            <span class="badge bg-primary me-2 mb-2 p-2">
                ${tipo.nomeTipo}
                <button type="button" class="btn-close btn-close-white ms-1" onclick="sistema.removerDocumentoChecklist(${tipo.id})"></button>
            </span>
        `).join('');
        });
    }

    async saveChecklist() {
        const secretariaId = $('#secretaria').val();
        const servicoId = $('#servico').val();

        const formData = {
            id: $('#id').val() || null,
            secretaria: { id: secretariaId },
            servico: { id: servicoId },
            tiposDocumentos: this.documentosChecklistSelecionados.map(id => ({ id }))
        };

        try {
            const url = formData.id ?
                `${API_BASE}/checklist/${formData.id}` :
                `${API_BASE}/checklist`;

            const method = formData.id ? 'PUT' : 'POST';

            console.log('Enviando dados do checklist:', formData);

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.fecharModal();
                await this.loadChecklists();
                this.showSuccess('Checklist salvo com sucesso!');
            } else {
                const errorText = await response.text();
                console.error('Erro do servidor:', errorText);
                this.showError('Erro ao salvar checklist: ' + response.status);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro ao salvar checklist');
        }
    }

    async editChecklist(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/checklist/${id}`);

            if (response.ok) {
                const checklist = await response.json();
                this.showChecklistForm(checklist);
            } else {
                this.showError('Erro ao carregar checklist');
            }
        } catch (error) {
            console.error('Erro ao carregar checklist:', error);
            this.showError('Erro ao carregar checklist');
        }
    }

    async deleteChecklist(id) {
        if (confirm('Tem certeza que deseja excluir este checklist?')) {
            try {
                const response = await this.makeAuthenticatedRequest(`${API_BASE}/checklist/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadChecklists();
                    this.showSuccess('Checklist excluído com sucesso!');
                } else {
                    this.showError('Erro ao excluir checklist');
                }
            } catch (error) {
                console.error('Erro ao excluir checklist:', error);
                this.showError('Erro ao excluir checklist');
            }
        }
    }

    async showChecklistDetalhes(id) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/checklist/${id}`);

            if (response.ok) {
                const checklist = await response.json();

                const modalContent = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalhes do Checklist</h5>
                            <button type="button" class="close" onclick="sistema.fecharModal()" aria-label="Fechar">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Secretaria:</strong> ${checklist.secretaria ? checklist.secretaria.nome : 'N/A'}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Serviço:</strong> ${checklist.servico ? checklist.servico.nome : 'N/A'}</p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <h6>Documentos Obrigatórios:</h6>
                                <ul class="list-group">
                                    ${checklist.tiposDocumentos ? checklist.tiposDocumentos.map(tipo => `
                                        <li class="list-group-item">${tipo.nomeTipo}</li>
                                    `).join('') : '<li class="list-group-item">Nenhum documento</li>'}
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="sistema.fecharModal()">Fechar</button>
                        </div>
                    </div>
                </div>
            `;

                this.showModal(modalContent);
            } else {
                this.showError('Erro ao carregar detalhes do checklist');
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do checklist:', error);
            this.showError('Erro ao carregar detalhes do checklist');
        }
    }

// Método auxiliar para carregar tipos de documento
    async carregarTiposDocumento() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE}/tipos-documento`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar tipos de documento:', error);
            return [];
        }
    }

    fecharModal() {
        $('#modalContainer').remove();
        $('.modal-backdrop').remove();
        console.log('Modal fechado');
    }


    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        const alert = `
            <div class="alert alert-${type} alert-dismissible">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                ${message}
            </div>
        `;
        $('.content-header').after(alert);
        setTimeout(() => $('.alert').alert('close'), 5000);
    }

    async logout() {
        try {
            // Faz logout no backend também
            await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            this.isLoggedIn = false;
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            $('#mainContent').hide();
            $('#loginPage').show();
            $('#username').val('');
            $('#password').val('');
        }
    }

    checkAuth() {
        // Verificar se usuário está logado
        const savedUser = localStorage.getItem('currentUser');
        const savedToken = localStorage.getItem('authToken');
        if (savedUser && savedToken) {
            this.isLoggedIn = true;
            this.currentUser = savedUser;
            this.authToken = savedToken;
            this.showMainContent();
            this.showDashboard();
        }
    }

    // Adicione este método à classe SistemaAdmin
    async gerarPDFChecklistOrcamento(orcamentoId) {
        try {
            // 1. Buscar dados do orçamento
            const responseOrcamento = await this.makeAuthenticatedRequest(
                `${API_BASE}/orcamentos/${orcamentoId}`
            );

            if (!responseOrcamento.ok) {
                this.showError('Erro ao buscar dados do orçamento');
                return;
            }

            const orcamento = await responseOrcamento.json();

            // 2. Buscar checklists de todos os serviços do orçamento
            const checklists = [];
            if (orcamento.servicos && orcamento.servicos.length > 0) {
                for (const servico of orcamento.servicos) {
                    try {
                        const responseChecklist = await this.makeAuthenticatedRequest(
                            `${API_BASE}/checklist/servico/${servico.id}`
                        );

                        if (responseChecklist.ok) {
                            const checklist = await responseChecklist.json();
                            checklists.push({
                                servico: servico.nome,
                                secretaria: servico.secretaria ? servico.secretaria.nome : 'N/A',
                                documentos: checklist.tiposDocumentos || []
                            });
                        }
                    } catch (error) {
                        console.error(`Erro ao buscar checklist do serviço ${servico.id}:`, error);
                    }
                }
            }

            // 3. Verificar e carregar jsPDF se necessário
            await this.carregarJSPDF();

            // 4. Gerar PDF
            this.gerarPDFComDados(orcamento, checklists);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showError('Erro ao gerar PDF do checklist');
        }
    }

    async carregarJSPDF() {
        return new Promise((resolve, reject) => {
            // Verificar se jsPDF já está carregado
            if (window.jspdf && window.jspdf.jsPDF) {
                resolve();
                return;
            }

            // Mostrar mensagem de carregamento
            this.showSuccess('Carregando biblioteca PDF...');

            // Criar elemento script
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.integrity = 'sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNTlrdUmTzrDgektczlKNRRhy5X5AAOnx5S09ydFYWWNSfcEqDTTHgtNA==';
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                console.log('jsPDF carregado com sucesso');
                resolve();
            };

            script.onerror = () => {
                this.showError('Erro ao carregar biblioteca PDF. Tente novamente.');
                reject(new Error('Falha ao carregar jsPDF'));
            };

            document.head.appendChild(script);
        });
    }

    // Método para gerar o PDF com os dados
    gerarPDFComDados(orcamento, checklists) {
        try {
            // Verificar se jsPDF está disponível
            if (!window.jspdf || !window.jspdf.jsPDF) {
                this.showError('Biblioteca PDF não disponível. Tente novamente.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Configurações
            const marginLeft = 15;
            const marginTop = 20;
            let yPos = marginTop;
            const lineHeight = 7;
            const pageHeight = doc.internal.pageSize.height;

            // Título
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.text('CHECKLIST DE DOCUMENTOS', 105, yPos, { align: 'center' });

            // Subtítulo
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            yPos += 10;
            doc.text('ORÇAMENTO Nº ' + orcamento.id, 105, yPos, { align: 'center' });
            yPos += 15;

            // Linha divisória
            doc.setDrawColor(200, 200, 200);
            doc.line(marginLeft, yPos, 200 - marginLeft, yPos);
            yPos += 10;

            // Informações do Orçamento
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('INFORMAÇÕES DO ORÇAMENTO', marginLeft, yPos);
            yPos += 8;

            doc.setFont('helvetica', 'normal');
            const infoOrcamento = [
                `Descrição: ${orcamento.descricao || 'N/A'}`,
                `Data: ${new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR')}`,
                `Status: ${this.getStatusText(orcamento.status)}`,
                `Imóvel: ${orcamento.imovel ? orcamento.imovel.logradouro : 'N/A'}`
            ];

            infoOrcamento.forEach(info => {
                doc.text(info, marginLeft + 5, yPos);
                yPos += 6;
            });

            yPos += 10;

            // Checklist por Serviço
            doc.setFont('helvetica', 'bold');
            doc.text('DOCUMENTOS NECESSÁRIOS', marginLeft, yPos);
            yPos += 8;

            if (checklists.length === 0) {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text('Nenhum checklist encontrado para os serviços deste orçamento.', marginLeft + 5, yPos);
                yPos += 6;
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(40, 40, 40);

                checklists.forEach((checklist, index) => {
                    // Verificar se precisa de nova página
                    if (yPos > pageHeight - 60) {
                        doc.addPage();
                        yPos = marginTop;
                    }

                    // Título do Serviço
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(12);
                    doc.text(`${index + 1}. ${checklist.servico}`, marginLeft, yPos);
                    yPos += 7;

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.text(`Secretaria: ${checklist.secretaria}`, marginLeft + 5, yPos);
                    yPos += 6;

                    // Documentos necessários
                    doc.setTextColor(40, 40, 40);
                    if (checklist.documentos.length === 0) {
                        doc.text('   • Nenhum documento configurado', marginLeft + 5, yPos);
                        yPos += 6;
                    } else {
                        checklist.documentos.forEach((documento, docIndex) => {
                            // Verificar se precisa de nova página
                            if (yPos > pageHeight - 20) {
                                doc.addPage();
                                yPos = marginTop;
                            }

                            doc.text(`   ${docIndex + 1}. ${documento.nomeTipo}`, marginLeft + 5, yPos);
                            yPos += 6;
                        });
                    }

                    yPos += 8; // Espaço entre serviços
                    doc.setDrawColor(240, 240, 240);
                    doc.line(marginLeft, yPos - 2, 200 - marginLeft, yPos - 2);
                });
            }

            yPos += 10;

            // Resumo
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('RESUMO', marginLeft, yPos);
            yPos += 7;

            doc.setFont('helvetica', 'normal');
            const totalServicos = checklists.length;
            const totalDocumentos = checklists.reduce((total, checklist) => total + checklist.documentos.length, 0);

            doc.text(`• Total de Serviços: ${totalServicos}`, marginLeft + 5, yPos);
            yPos += 6;
            doc.text(`• Total de Documentos Necessários: ${totalDocumentos}`, marginLeft + 5, yPos);
            yPos += 10;

            // Linha final
            doc.setDrawColor(200, 200, 200);
            doc.line(marginLeft, yPos, 200 - marginLeft, yPos);
            yPos += 5;

            // Rodapé
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                     marginLeft, pageHeight - 15);
            doc.text(`Sistema de Gestão de Orçamentos • Página ${doc.internal.getNumberOfPages()} de ${doc.internal.getNumberOfPages()}`,
                     105, pageHeight - 15, { align: 'center' });

            // Salvar PDF
            const filename = `checklist_orcamento_${orcamento.id}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

            this.showSuccess(`PDF gerado com sucesso: ${filename}`);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showError('Erro ao criar PDF. Tente novamente.');
        }
    }

    // Método para gerar o PDF usando jsPDF
    gerarPDF(orcamento, checklists) {
        // Verificar se jsPDF está carregado
        if (typeof jsPDF === 'undefined') {
            this.showError('Biblioteca jsPDF não carregada. Inclua no HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurações
        const marginLeft = 10;
        const marginTop = 20;
        let yPos = marginTop;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;

        // Título
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('CHECKLIST DE DOCUMENTOS - ORÇAMENTO', marginLeft, yPos);
        yPos += lineHeight * 2;

        // Informações do Orçamento
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Informações do Orçamento:', marginLeft, yPos);
        yPos += lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.text(`Descrição: ${orcamento.descricao || 'N/A'}`, marginLeft + 5, yPos);
        yPos += lineHeight;
        doc.text(`ID: ${orcamento.id}`, marginLeft + 5, yPos);
        yPos += lineHeight;
        doc.text(`Data: ${new Date(orcamento.dataCriacao).toLocaleDateString()}`, marginLeft + 5, yPos);
        yPos += lineHeight;
        doc.text(`Status: ${this.getStatusText(orcamento.status)}`, marginLeft + 5, yPos);
        yPos += lineHeight;

        if (orcamento.imovel) {
            doc.text(`Imóvel: ${orcamento.imovel.logradouro || ''} ${orcamento.imovel.lote || ''}/${orcamento.imovel.quadra || ''}`, marginLeft + 5, yPos);
            yPos += lineHeight;
        }

        yPos += lineHeight; // Espaço

        // Checklist por Serviço
        doc.setFont('helvetica', 'bold');
        doc.text('Documentos Necessários por Serviço:', marginLeft, yPos);
        yPos += lineHeight;

        if (checklists.length === 0) {
            doc.setFont('helvetica', 'normal');
            doc.text('Nenhum checklist encontrado para os serviços deste orçamento.', marginLeft + 5, yPos);
            yPos += lineHeight;
        } else {
            checklists.forEach((checklist, index) => {
                // Verificar se precisa de nova página
                if (yPos > pageHeight - 50) {
                    doc.addPage();
                    yPos = marginTop;
                }

                // Título do Serviço
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(`${index + 1}. ${checklist.servico}`, marginLeft, yPos);
                yPos += lineHeight;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(`Secretaria: ${checklist.secretaria}`, marginLeft + 5, yPos);
                yPos += lineHeight;

                // Documentos necessários
                if (checklist.documentos.length === 0) {
                    doc.text('   - Nenhum documento configurado', marginLeft + 5, yPos);
                    yPos += lineHeight;
                } else {
                    checklist.documentos.forEach((documento, docIndex) => {
                        // Verificar se precisa de nova página
                        if (yPos > pageHeight - 20) {
                            doc.addPage();
                            yPos = marginTop;
                        }

                        doc.text(`   ${docIndex + 1}. ${documento.nomeTipo}`, marginLeft + 5, yPos);
                        yPos += lineHeight;
                    });
                }

                yPos += lineHeight; // Espaço entre serviços
            });
        }

        yPos += lineHeight;

        // Rodapé
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(`Gerado em: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, marginLeft, pageHeight - 10);
        doc.text(`Sistema de Gestão de Orçamentos - Página ${doc.internal.getNumberOfPages()}`, marginLeft, pageHeight - 5);

        // Salvar PDF
        const filename = `checklist_orcamento_${orcamento.id}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);

        this.showSuccess(`PDF gerado: ${filename}`);
    }

    // Atualize o método showOrcamentoDetalhes para adicionar o botão de PDF

}

// Global functions
function showView(viewName) {
    sistema.showView(viewName);
}

function showDashboard() {
    sistema.showDashboard();
}

function logout() {
    sistema.logout();
}

// Initialize system
const sistema = new SistemaAdmin();
