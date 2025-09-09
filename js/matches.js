// Gerenciamento de jogos

document.addEventListener('DOMContentLoaded', function() {
    const btnGerarTabela = document.getElementById('btnGerarTabela');
    const btnNovoJogo = document.getElementById('btnNovoJogo');
    const formNovoJogo = document.getElementById('formNovoJogo');
    const btnCancelarJogo = document.getElementById('btnCancelarJogo');
    const jogoForm = document.getElementById('jogoForm');
    const filtroStatus = document.getElementById('filtroStatus');
    const tabelaJogosBody = document.querySelector('#tabelaJogos tbody');
    const modalResultado = document.getElementById('modalResultado');
    const closeModal = document.querySelector('.close');
    const resultadoForm = document.getElementById('resultadoForm');

    let jogoAtual = null;

    btnNovoJogo.addEventListener('click', () => {
        formNovoJogo.style.display = 'block';
        btnNovoJogo.style.display = 'none';
    });

    btnCancelarJogo.addEventListener('click', () => {
        formNovoJogo.style.display = 'none';
        btnNovoJogo.style.display = 'inline-block';
        jogoForm.reset();
    });

    btnGerarTabela.addEventListener('click', () => {
        gerarTabelaJogos();
    });

    filtroStatus.addEventListener('change', () => {
        carregarJogos();
    });

    closeModal.addEventListener('click', () => {
        modalResultado.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modalResultado) {
            modalResultado.style.display = 'none';
        }
    });

    jogoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const timeCasa = document.getElementById('timeCasa').value;
        const timeVisitante = document.getElementById('timeVisitante').value;
        const dataHora = document.getElementById('dataHora').value;
        const local = document.getElementById('local').value.trim();
        const arbitro = document.getElementById('arbitro').value.trim();
        const observacoes = document.getElementById('observacoes').value.trim();

        if (!timeCasa || !timeVisitante || !dataHora || !local) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        if (timeCasa === timeVisitante) {
            alert('Os times da casa e visitante devem ser diferentes.');
            return;
        }

        const novoJogo = {
            time_casa_id: parseInt(timeCasa),
            time_visitante_id: parseInt(timeVisitante),
            data_hora: dataHora,
            local: local,
            arbitro: arbitro,
            observacoes: observacoes,
            status: 'agendado'
        };

        try {
            const resultado = await createJogo(novoJogo);
            if (resultado && resultado.length > 0) {
                alert('Jogo agendado com sucesso!');
                jogoForm.reset();
                formNovoJogo.style.display = 'none';
                btnNovoJogo.style.display = 'inline-block';
                carregarJogos();
            } else {
                alert('Erro ao agendar jogo.');
            }
        } catch (error) {
            console.error('Erro ao agendar jogo:', error);
            alert('Erro ao agendar jogo.');
        }
    });

    resultadoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await salvarResultado();
    });

    carregarTimes();
    carregarJogos();

    async function carregarTimes() {
        try {
            const times = await getTimes(null);
            if (times && times.length > 0) {
                const selectCasa = document.getElementById('timeCasa');
                const selectVisitante = document.getElementById('timeVisitante');

                selectCasa.innerHTML = '<option value="">Selecione</option>';
                selectVisitante.innerHTML = '<option value="">Selecione</option>';

                times.forEach(time => {
                    if (time.status === 'ativo') {
                        const option1 = document.createElement('option');
                        option1.value = time.id;
                        option1.textContent = time.nome;
                        selectCasa.appendChild(option1);

                        const option2 = document.createElement('option');
                        option2.value = time.id;
                        option2.textContent = time.nome;
                        selectVisitante.appendChild(option2);
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao carregar times:', error);
        }
    }

    async function carregarJogos() {
        tabelaJogosBody.innerHTML = '';
        try {
            const statusFiltro = filtroStatus.value;
            let jogos = await getJogos(null); // Assumindo campeonato único

            if (statusFiltro) {
                jogos = jogos.filter(j => j.status === statusFiltro);
            }

            if (jogos && jogos.length > 0) {
                // Ordenar por data
                jogos.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

                jogos.forEach(jogo => {
                    const tr = document.createElement('tr');
                    const dataFormatada = formatarDataHora(jogo.data_hora);
                    const placar = jogo.status === 'finalizado' ? `${jogo.gols_casa} - ${jogo.gols_visitante}` : '-';

                    tr.innerHTML = `
                        <td>${dataFormatada}</td>
                        <td>${jogo.time_casa_nome || 'Time Casa'} x ${jogo.time_visitante_nome || 'Time Visitante'}</td>
                        <td>${placar}</td>
                        <td>${jogo.local}</td>
                        <td>${jogo.status}</td>
                        <td>
                            ${jogo.status === 'agendado' ? `<button data-id="${jogo.id}" class="btn-registrar">Registrar Resultado</button>` : ''}
                            ${jogo.status === 'finalizado' ? `<button data-id="${jogo.id}" class="btn-sumula">Gerar Súmula</button>` : ''}
                            <button data-id="${jogo.id}" class="btn-editar">Editar</button>
                            <button data-id="${jogo.id}" class="btn-cancelar" ${jogo.status === 'cancelado' ? 'disabled' : ''}>${jogo.status === 'cancelado' ? 'Cancelado' : 'Cancelar'}</button>
                        </td>
                    `;
                    tabelaJogosBody.appendChild(tr);
                });
                adicionarEventosBotoes();
            } else {
                tabelaJogosBody.innerHTML = '<tr><td colspan="6">Nenhum jogo encontrado.</td></tr>';
            }
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            tabelaJogosBody.innerHTML = '<tr><td colspan="6">Erro ao carregar jogos.</td></tr>';
        }
    }

    function adicionarEventosBotoes() {
        const botoesRegistrar = document.querySelectorAll('.btn-registrar');
        const botoesSumula = document.querySelectorAll('.btn-sumula');
        const botoesEditar = document.querySelectorAll('.btn-editar');
        const botoesCancelar = document.querySelectorAll('.btn-cancelar');

        botoesRegistrar.forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.getAttribute('data-id');
                abrirModalResultado(id);
            });
        });

        botoesSumula.forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.getAttribute('data-id');
                gerarSumula(id);
            });
        });

        botoesEditar.forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.getAttribute('data-id');
                editarJogo(id);
            });
        });

        botoesCancelar.forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.getAttribute('data-id');
                cancelarJogo(id);
            });
        });
    }

    async function abrirModalResultado(id) {
        try {
            const { data: jogo, error } = await supabaseClient
                .from('jogos')
                .select(`
                    *,
                    time_casa:times!time_casa_id(nome),
                    time_visitante:times!time_visitante_id(nome)
                `)
                .eq('id', id)
                .single();

            if (error || !jogo) {
                alert('Jogo não encontrado.');
                return;
            }

            jogoAtual = jogo;

            document.getElementById('infoJogo').innerHTML = `
                <p><strong>${jogo.time_casa.nome} x ${jogo.time_visitante.nome}</strong></p>
                <p>${formatarDataHora(jogo.data_hora)} - ${jogo.local}</p>
            `;

            document.getElementById('golsCasa').value = jogo.gols_casa || 0;
            document.getElementById('golsVisitante').value = jogo.gols_visitante || 0;

            await carregarJogadoresParaGols(jogo.time_casa_id, jogo.time_visitante_id);
            await carregarJogadoresParaCartoes(jogo.time_casa_id, jogo.time_visitante_id);

            modalResultado.style.display = 'block';
        } catch (error) {
            console.error('Erro ao abrir modal:', error);
            alert('Erro ao abrir modal de resultado.');
        }
    }

    async function carregarJogadoresParaGols(timeCasaId, timeVisitanteId) {
        try {
            const jogadoresCasa = await getJogadores(timeCasaId);
            const jogadoresVisitante = await getJogadores(timeVisitanteId);

            const listaCasa = document.getElementById('listaGolsCasa');
            const listaVisitante = document.getElementById('listaGolsVisitante');

            listaCasa.innerHTML = '<h5>Time Casa</h5>';
            listaVisitante.innerHTML = '<h5>Time Visitante</h5>';

            jogadoresCasa.forEach(jogador => {
                if (jogador.status === 'ativo') {
                    listaCasa.innerHTML += `
                        <div class="gol-input">
                            <label>${jogador.nome_completo} (${jogador.numero_camisa}):</label>
                            <input type="number" min="0" max="120" placeholder="Minuto" data-jogador="${jogador.id}" data-time="casa">
                        </div>
                    `;
                }
            });

            jogadoresVisitante.forEach(jogador => {
                if (jogador.status === 'ativo') {
                    listaVisitante.innerHTML += `
                        <div class="gol-input">
                            <label>${jogador.nome_completo} (${jogador.numero_camisa}):</label>
                            <input type="number" min="0" max="120" placeholder="Minuto" data-jogador="${jogador.id}" data-time="visitante">
                        </div>
                    `;
                }
            });
        } catch (error) {
            console.error('Erro ao carregar jogadores para gols:', error);
        }
    }

    async function carregarJogadoresParaCartoes(timeCasaId, timeVisitanteId) {
        try {
            const jogadoresCasa = await getJogadores(timeCasaId);
            const jogadoresVisitante = await getJogadores(timeVisitanteId);

            const listaCasa = document.getElementById('listaCartoesCasa');
            const listaVisitante = document.getElementById('listaCartoesVisitante');

            listaCasa.innerHTML = '<h5>Time Casa</h5>';
            listaVisitante.innerHTML = '<h5>Time Visitante</h5>';

            jogadoresCasa.forEach(jogador => {
                if (jogador.status === 'ativo') {
                    listaCasa.innerHTML += `
                        <div class="cartao-input">
                            <label>${jogador.nome_completo} (${jogador.numero_camisa}):</label>
                            <select data-jogador="${jogador.id}" data-time="casa">
                                <option value="">Nenhum</option>
                                <option value="amarelo">Amarelo</option>
                                <option value="azul">Azul</option>
                                <option value="vermelho">Vermelho</option>
                            </select>
                            <input type="number" min="0" max="120" placeholder="Minuto" data-minuto-jogador="${jogador.id}" data-time="casa">
                        </div>
                    `;
                }
            });

            jogadoresVisitante.forEach(jogador => {
                if (jogador.status === 'ativo') {
                    listaVisitante.innerHTML += `
                        <div class="cartao-input">
                            <label>${jogador.nome_completo} (${jogador.numero_camisa}):</label>
                            <select data-jogador="${jogador.id}" data-time="visitante">
                                <option value="">Nenhum</option>
                                <option value="amarelo">Amarelo</option>
                                <option value="azul">Azul</option>
                                <option value="vermelho">Vermelho</option>
                            </select>
                            <input type="number" min="0" max="120" placeholder="Minuto" data-minuto-jogador="${jogador.id}" data-time="visitante">
                        </div>
                    `;
                }
            });
        } catch (error) {
            console.error('Erro ao carregar jogadores para cartões:', error);
        }
    }

    async function salvarResultado() {
        const golsCasa = parseInt(document.getElementById('golsCasa').value) || 0;
        const golsVisitante = parseInt(document.getElementById('golsVisitante').value) || 0;

        try {
            // Atualizar placar do jogo
            const { error: updateError } = await supabaseClient
                .from('jogos')
                .update({
                    gols_casa: golsCasa,
                    gols_visitante: golsVisitante,
                    status: 'finalizado'
                })
                .eq('id', jogoAtual.id);

            if (updateError) {
                console.error('Erro ao atualizar placar:', updateError);
                alert('Erro ao salvar resultado.');
                return;
            }

            // Registrar gols
            await registrarGols();

            // Registrar cartões
            await registrarCartoes();

            alert('Resultado salvo com sucesso!');
            modalResultado.style.display = 'none';
            carregarJogos();

        } catch (error) {
            console.error('Erro ao salvar resultado:', error);
            alert('Erro ao salvar resultado.');
        }
    }

    async function registrarGols() {
        const golInputs = document.querySelectorAll('.gol-input input');

        for (const input of golInputs) {
            const minuto = parseInt(input.value);
            if (minuto > 0) {
                const jogadorId = input.getAttribute('data-jogador');
                const gol = {
                    jogo_id: jogoAtual.id,
                    jogador_id: parseInt(jogadorId),
                    minuto: minuto
                };
                await createGol(gol);

                // Atualizar contador de gols do jogador
                await supabaseClient
                    .from('jogadores')
                    .update({ gols_marcados: supabaseClient.raw('gols_marcados + 1') })
                    .eq('id', jogadorId);
            }
        }
    }

    async function registrarCartoes() {
        const cartaoSelects = document.querySelectorAll('.cartao-input select');
        const minutoInputs = document.querySelectorAll('.cartao-input input[type="number"]');

        for (let i = 0; i < cartaoSelects.length; i++) {
            const tipo = cartaoSelects[i].value;
            const minutoInput = minutoInputs[i];
            const minuto = parseInt(minutoInput.value);

            if (tipo && minuto > 0) {
                const jogadorId = cartaoSelects[i].getAttribute('data-jogador');
                const cartao = {
                    jogo_id: jogoAtual.id,
                    jogador_id: parseInt(jogadorId),
                    tipo: tipo,
                    minuto: minuto
                };
                await createCartao(cartao);

                // Atualizar contador de cartões do jogador
                const coluna = tipo === 'amarelo' ? 'cartoes_amarelos' :
                              tipo === 'azul' ? 'cartoes_azuis' : 'cartoes_vermelhos';

                await supabaseClient
                    .from('jogadores')
                    .update({ [coluna]: supabaseClient.raw(`${coluna} + 1`) })
                    .eq('id', jogadorId);
            }
        }
    }

    async function gerarTabelaJogos() {
        try {
            const times = await getTimes(null);
            if (!times || times.length < 2) {
                alert('É necessário pelo menos 2 times para gerar a tabela.');
                return;
            }

            const confirmacao = confirm(`Gerar tabela de jogos para ${times.length} times? Isso criará ${times.length * (times.length - 1)} jogos.`);
            if (!confirmacao) return;

            // Lógica para gerar jogos todos contra todos
            const jogosGerados = [];
            for (let i = 0; i < times.length; i++) {
                for (let j = i + 1; j < times.length; j++) {
                    jogosGerados.push({
                        time_casa_id: times[i].id,
                        time_visitante_id: times[j].id,
                        data_hora: null, // Será definido depois
                        local: 'A definir',
                        status: 'agendado'
                    });
                }
            }

            // Inserir jogos em lote
            for (const jogo of jogosGerados) {
                await createJogo(jogo);
            }

            alert(`Tabela gerada com sucesso! ${jogosGerados.length} jogos criados.`);
            carregarJogos();

        } catch (error) {
            console.error('Erro ao gerar tabela:', error);
            alert('Erro ao gerar tabela de jogos.');
        }
    }

    async function editarJogo(id) {
        // Implementar edição de jogo
        alert('Funcionalidade de edição em desenvolvimento.');
    }

    async function cancelarJogo(id) {
        const confirmacao = confirm('Tem certeza que deseja cancelar este jogo?');
        if (!confirmacao) return;

        try {
            const { error } = await supabaseClient
                .from('jogos')
                .update({ status: 'cancelado' })
                .eq('id', id);

            if (error) {
                console.error('Erro ao cancelar jogo:', error);
                alert('Erro ao cancelar jogo.');
                return;
            }

            alert('Jogo cancelado com sucesso!');
            carregarJogos();
        } catch (error) {
            console.error('Erro ao cancelar jogo:', error);
            alert('Erro ao cancelar jogo.');
        }
    }

    async function gerarSumula(id) {
        try {
            // Buscar dados completos do jogo
            const { data: jogo, error: jogoError } = await supabaseClient
                .from('jogos')
                .select(`
                    *,
                    time_casa:times!time_casa_id(*),
                    time_visitante:times!time_visitante_id(*)
                `)
                .eq('id', id)
                .single();

            if (jogoError || !jogo) {
                alert('Jogo não encontrado.');
                return;
            }

            // Buscar gols do jogo
            const { data: gols, error: golsError } = await supabaseClient
                .from('gols')
                .select(`
                    *,
                    jogador:jogadores!jogador_id(nome_completo, numero_camisa)
                `)
                .eq('jogo_id', id)
                .order('minuto');

            // Buscar cartões do jogo
            const { data: cartoes, error: cartoesError } = await supabaseClient
                .from('cartoes')
                .select(`
                    *,
                    jogador:jogadores!jogador_id(nome_completo, numero_camisa)
                `)
                .eq('jogo_id', id)
                .order('minuto');

            // Gerar PDF da súmula
            gerarPDFSumula(jogo, gols || [], cartoes || []);

        } catch (error) {
            console.error('Erro ao gerar súmula:', error);
            alert('Erro ao gerar súmula.');
        }
    }

    function formatarDataHora(dataHora) {
        const data = new Date(dataHora);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});
