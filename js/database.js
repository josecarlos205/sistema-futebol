// Configuração do Supabase para PostgreSQL
const SUPABASE_URL = 'https://seu-projeto.supabase.co'; // Substitua pela URL do seu projeto Supabase
const SUPABASE_ANON_KEY = 'sua-chave-anonima'; // Substitua pela chave anônima do Supabase

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funções para interagir com o banco de dados

// Campeonatos
async function getCampeonatos() {
    const { data, error } = await supabaseClient
        .from('campeonatos')
        .select('*');
    if (error) console.error('Erro ao buscar campeonatos:', error);
    return data;
}

async function createCampeonato(campeonato) {
    const { data, error } = await supabaseClient
        .from('campeonatos')
        .insert([campeonato]);
    if (error) console.error('Erro ao criar campeonato:', error);
    return data;
}

// Times
async function getTimes(campeonatoId) {
    const { data, error } = await supabaseClient
        .from('times')
        .select('*')
        .eq('campeonato_id', campeonatoId);
    if (error) console.error('Erro ao buscar times:', error);
    return data;
}

async function createTime(time) {
    const { data, error } = await supabaseClient
        .from('times')
        .insert([time]);
    if (error) console.error('Erro ao criar time:', error);
    return data;
}

// Jogadores
async function getJogadores(timeId) {
    const { data, error } = await supabaseClient
        .from('jogadores')
        .select('*')
        .eq('time_id', timeId);
    if (error) console.error('Erro ao buscar jogadores:', error);
    return data;
}

async function createJogador(jogador) {
    const { data, error } = await supabaseClient
        .from('jogadores')
        .insert([jogador]);
    if (error) console.error('Erro ao criar jogador:', error);
    return data;
}

// Jogos
async function getJogos(campeonatoId) {
    const { data, error } = await supabaseClient
        .from('jogos')
        .select('*')
        .eq('campeonato_id', campeonatoId);
    if (error) console.error('Erro ao buscar jogos:', error);
    return data;
}

async function createJogo(jogo) {
    const { data, error } = await supabaseClient
        .from('jogos')
        .insert([jogo]);
    if (error) console.error('Erro ao criar jogo:', error);
    return data;
}

// Gols
async function createGol(gol) {
    const { data, error } = await supabaseClient
        .from('gols')
        .insert([gol]);
    if (error) console.error('Erro ao registrar gol:', error);
    return data;
}

// Cartões
async function createCartao(cartao) {
    const { data, error } = await supabaseClient
        .from('cartoes')
        .insert([cartao]);
    if (error) console.error('Erro ao registrar cartão:', error);
    return data;
}

// Função para calcular classificação
async function calcularClassificacao(campeonatoId) {
    // Implementar lógica de cálculo baseada nas regras
    // Pontos, vitórias, saldo de gols, etc.
    const jogos = await getJogos(campeonatoId);
    const times = await getTimes(campeonatoId);

    // Lógica simplificada - implementar cálculo completo
    const classificacao = times.map(time => {
        const jogosTime = jogos.filter(j => j.time_casa_id === time.id || j.time_visitante_id === time.id);
        // Calcular pontos, etc.
        return {
            ...time,
            pontos: 0, // Calcular
            vitorias: 0,
            empates: 0,
            derrotas: 0,
            gols_pro: 0,
            gols_contra: 0,
            saldo_gols: 0
        };
    });

    return classificacao.sort((a, b) => b.pontos - a.pontos);
}
