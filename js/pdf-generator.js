// Geração de PDFs usando jsPDF
// Nota: Este arquivo requer a biblioteca jsPDF (https://github.com/parallax/jsPDF)

function gerarSumulaPDF(jogo, escalaoCasa, escalaoVisitante, gols, cartoes, arbitro, observacoes) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('SÚMULA OFICIAL', 105, 20, { align: 'center' });

    // Informações do jogo
    doc.setFontSize(12);
    doc.text(`Data/Hora: ${formatarDataHora(jogo.data_hora)}`, 20, 40);
    doc.text(`Local: ${jogo.local}`, 20, 50);
    doc.text(`Árbitro: ${arbitro || 'Não informado'}`, 20, 60);

    // Placar
    doc.setFontSize(14);
    doc.text(`${jogo.time_casa.nome} ${jogo.gols_casa} x ${jogo.gols_visitante} ${jogo.time_visitante.nome}`, 105, 80, { align: 'center' });

    // Escalação Time Casa
    doc.setFontSize(12);
    doc.text(`Escalação - ${jogo.time_casa.nome}:`, 20, 100);
    let yPos = 110;
    escalaoCasa.forEach(jogador => {
        doc.text(`${jogador.apelido} (${jogador.posicao})`, 30, yPos);
        yPos += 10;
    });

    // Escalação Time Visitante
    yPos += 10;
    doc.text(`Escalação - ${jogo.time_visitante.nome}:`, 20, yPos);
    yPos += 10;
    escalaoVisitante.forEach(jogador => {
        doc.text(`${jogador.apelido} (${jogador.posicao})`, 30, yPos);
        yPos += 10;
    });

    // Gols
    if (gols.length > 0) {
        yPos += 20;
        doc.text('Gols:', 20, yPos);
        yPos += 10;
        gols.forEach(gol => {
            doc.text(`${gol.jogador_nome} - ${gol.minuto}' ${gol.tipo === 'penalti' ? '(Pênalti)' : gol.tipo === 'contra' ? '(Contra)' : ''}`, 30, yPos);
            yPos += 10;
        });
    }

    // Cartões
    if (cartoes.length > 0) {
        yPos += 10;
        doc.text('Cartões:', 20, yPos);
        yPos += 10;
        cartoes.forEach(cartao => {
            const cor = cartao.tipo === 'amarelo' ? 'Amarelo' : cartao.tipo === 'azul' ? 'Azul' : 'Vermelho';
            doc.text(`${cor}: ${cartao.jogador_nome} - ${cartao.minuto}' (${cartao.motivo})`, 30, yPos);
            yPos += 10;
        });
    }

    // Observações
    if (observacoes) {
        yPos += 20;
        doc.text('Observações:', 20, yPos);
        yPos += 10;
        const linhas = doc.splitTextToSize(observacoes, 170);
        doc.text(linhas, 30, yPos);
    }

    // Assinaturas
    yPos += 40;
    doc.text('______________________________', 40, yPos);
    doc.text('Árbitro', 60, yPos + 10);

    doc.text('______________________________', 120, yPos);
    doc.text('Representante Time Casa', 130, yPos + 10);

    yPos += 30;
    doc.text('______________________________', 120, yPos);
    doc.text('Representante Time Visitante', 130, yPos + 10);

    // Salvar PDF
    doc.save(`sumula_${jogo.id}.pdf`);
}

function gerarClassificacaoPDF(classificacao, nomeCampeonato) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(`Classificação - ${nomeCampeonato}`, 105, 20, { align: 'center' });

    // Cabeçalho da tabela
    doc.setFontSize(12);
    let yPos = 40;
    doc.text('Pos', 20, yPos);
    doc.text('Time', 40, yPos);
    doc.text('P', 140, yPos);
    doc.text('J', 150, yPos);
    doc.text('V', 160, yPos);
    doc.text('E', 170, yPos);
    doc.text('D', 180, yPos);

    // Dados da classificação
    yPos += 10;
    classificacao.forEach((time, index) => {
        doc.text(`${index + 1}`, 20, yPos);
        doc.text(time.nome, 40, yPos);
        doc.text(time.pontos.toString(), 140, yPos);
        doc.text(time.jogos.toString(), 150, yPos);
        doc.text(time.vitorias.toString(), 160, yPos);
        doc.text(time.empates.toString(), 170, yPos);
        doc.text(time.derrotas.toString(), 180, yPos);
        yPos += 10;
    });

    // Salvar PDF
    doc.save(`classificacao_${nomeCampeonato.replace(/\s+/g, '_')}.pdf`);
}

function gerarArtilhariaPDF(artilheiros, nomeCampeonato) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(`Artilharia - ${nomeCampeonato}`, 105, 20, { align: 'center' });

    // Cabeçalho
    doc.setFontSize(12);
    let yPos = 40;
    doc.text('Pos', 20, yPos);
    doc.text('Jogador', 40, yPos);
    doc.text('Time', 120, yPos);
    doc.text('Gols', 170, yPos);

    // Dados dos artilheiros
    yPos += 10;
    artilheiros.forEach((jogador, index) => {
        doc.text(`${index + 1}`, 20, yPos);
        doc.text(jogador.nome_completo, 40, yPos);
        doc.text(jogador.time_nome, 120, yPos);
        doc.text(jogador.gols_marcados.toString(), 170, yPos);
        yPos += 10;
    });

    // Salvar PDF
    doc.save(`artilharia_${nomeCampeonato.replace(/\s+/g, '_')}.pdf`);
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
