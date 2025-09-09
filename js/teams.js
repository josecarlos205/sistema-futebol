// Gerenciamento de times

document.addEventListener('DOMContentLoaded', function() {
    const btnNovoTime = document.getElementById('btnNovoTime');
    const formNovoTime = document.getElementById('formNovoTime');
    const btnCancelar = document.getElementById('btnCancelar');
    const timeForm = document.getElementById('timeForm');
    const tabelaTimesBody = document.querySelector('#tabelaTimes tbody');

    btnNovoTime.addEventListener('click', () => {
        formNovoTime.style.display = 'block';
        btnNovoTime.style.display = 'none';
    });

    btnCancelar.addEventListener('click', () => {
        formNovoTime.style.display = 'none';
        btnNovoTime.style.display = 'inline-block';
        timeForm.reset();
    });

    timeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nomeTime').value.trim();
        const tecnico = document.getElementById('tecnico').value.trim();
        const cores = document.getElementById('cores').value.trim();
        const dataFundacao = document.getElementById('dataFundacao').value;
        const logo = document.getElementById('logo').value.trim();

        if (!nome) {
            alert('O nome do time é obrigatório.');
            return;
        }

        // Criar objeto time
        const novoTime = {
            nome: nome,
            tecnico: tecnico,
            cores_uniforme: cores,
            data_fundacao: dataFundacao || null,
            logo_url: logo,
            status: 'ativo'
        };

        try {
            const resultado = await createTime(novoTime);
            if (resultado && resultado.length > 0) {
                alert('Time cadastrado com sucesso!');
                timeForm.reset();
                formNovoTime.style.display = 'none';
                btnNovoTime.style.display = 'inline-block';
                carregarTimes();
            } else {
                alert('Erro ao cadastrar time.');
            }
        } catch (error) {
            console.error('Erro ao cadastrar time:', error);
            alert('Erro ao cadastrar time.');
        }
    });

    carregarTimes();

    async function carregarTimes() {
        tabelaTimesBody.innerHTML = '';
        try {
            // Para simplificação, buscar todos os times (ajustar conforme campeonato)
            const times = await getTimes(null);
            if (times && times.length > 0) {
                times.forEach(time => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${time.nome}</td>
                        <td>${time.tecnico || ''}</td>
                        <td>${time.cores_uniforme || ''}</td>
                        <td>${time.status}</td>
                        <td>
                            <button data-id="${time.id}" class="btn-editar">Editar</button>
                            <button data-id="${time.id}" class="btn-toggle-status">${time.status === 'ativo' ? 'Desativar' : 'Ativar'}</button>
                        </td>
                    `;
                    tabelaTimesBody.appendChild(tr);
                });
                adicionarEventosBotoes();
            } else {
                tabelaTimesBody.innerHTML = '<tr><td colspan="5">Nenhum time cadastrado.</td></tr>';
            }
        } catch (error) {
            console.error('Erro ao carregar times:', error);
            tabelaTimesBody.innerHTML = '<tr><td colspan="5">Erro ao carregar times.</td></tr>';
        }
    }

    function adicionarEventosBotoes() {
        const botoesEditar = document.querySelectorAll('.btn-editar');
        const botoesToggle = document.querySelectorAll('.btn-toggle-status');

        botoesEditar.forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.getAttribute('data-id');
                editarTime(id);
            });
        });

        botoesToggle.forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.getAttribute('data-id');
                toggleStatusTime(id);
            });
        });
    }

    async function editarTime(id) {
        try {
            const times = await getTimes(null);
            const time = times.find(t => t.id == id);
            if (!time) {
                alert('Time não encontrado.');
                return;
            }
            // Preencher formulário com dados do time
            document.getElementById('nomeTime').value = time.nome;
            document.getElementById('tecnico').value = time.tecnico || '';
            document.getElementById('cores').value = time.cores_uniforme || '';
            document.getElementById('dataFundacao').value = time.data_fundacao ? time.data_fundacao.split('T')[0] : '';
            document.getElementById('logo').value = time.logo_url || '';

            formNovoTime.style.display = 'block';
            btnNovoTime.style.display = 'none';

            // Alterar evento submit para atualizar
            timeForm.removeEventListener('submit', timeForm._submitHandler);
            timeForm._submitHandler = async function(e) {
                e.preventDefault();
                await atualizarTime(id);
            };
            timeForm.addEventListener('submit', timeForm._submitHandler);

        } catch (error) {
            console.error('Erro ao buscar time:', error);
            alert('Erro ao buscar time.');
        }
    }

    async function atualizarTime(id) {
        const nome = document.getElementById('nomeTime').value.trim();
        const tecnico = document.getElementById('tecnico').value.trim();
        const cores = document.getElementById('cores').value.trim();
        const dataFundacao = document.getElementById('dataFundacao').value;
        const logo = document.getElementById('logo').value.trim();

        if (!nome) {
            alert('O nome do time é obrigatório.');
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('times')
                .update({
                    nome: nome,
                    tecnico: tecnico,
                    cores_uniforme: cores,
                    data_fundacao: dataFundacao || null,
                    logo_url: logo
                })
                .eq('id', id);

            if (error) {
                console.error('Erro ao atualizar time:', error);
                alert('Erro ao atualizar time.');
                return;
            }

            alert('Time atualizado com sucesso!');
            timeForm.reset();
            formNovoTime.style.display = 'none';
            btnNovoTime.style.display = 'inline-block';
            carregarTimes();

            // Restaurar evento submit para criação
            timeForm.removeEventListener('submit', timeForm._submitHandler);
            timeForm._submitHandler = null;
            timeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Função de criação já definida
            });

        } catch (error) {
            console.error('Erro ao atualizar time:', error);
            alert('Erro ao atualizar time.');
        }
    }

    async function toggleStatusTime(id) {
        try {
            const times = await getTimes(null);
            const time = times.find(t => t.id == id);
            if (!time) {
                alert('Time não encontrado.');
                return;
            }
            const novoStatus = time.status === 'ativo' ? 'inativo' : 'ativo';

            const { data, error } = await supabaseClient
                .from('times')
                .update({ status: novoStatus })
                .eq('id', id);

            if (error) {
                console.error('Erro ao alterar status:', error);
                alert('Erro ao alterar status do time.');
                return;
            }

            alert(`Time ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
            carregarTimes();
        } catch (error) {
            console.error('Erro ao alterar status do time:', error);
            alert('Erro ao alterar status do time.');
        }
    }
});
