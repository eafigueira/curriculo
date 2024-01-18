const dados = require('../data/database.json')

function formatarDataAtualParaString() {
    const dataAtual = new Date();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();
    return `${mes}/${ano}`;
}
function formatarData(dataString) {
    const [mes, ano] = dataString.split('/').map(Number);
    return new Date(ano, mes - 1);
}

function criarLinhaDoTempo(dataInicial) {
    let inicio = formatarData(dataInicial);
    let fim = new Date();
    let linhaDoTempo = [];

    for (let ano = inicio.getFullYear(); ano <= fim.getFullYear(); ano++) {
        let mesInicio = ano === inicio.getFullYear() ? inicio.getMonth() : 0;
        let mesFim = ano === fim.getFullYear() ? fim.getMonth() : 11;

        for (let mes = mesInicio; mes <= mesFim; mes++) {
            linhaDoTempo.push({ data: new Date(ano, mes), marcado: false });
        }
    }

    return linhaDoTempo;
}

function marcarPeriodosTrabalhados(linhaDoTempo, periodosTrabalhados) {
    periodosTrabalhados.forEach(periodo => {
        let inicio = formatarData(periodo.startDate);
        let fim = periodo.endDate ? formatarData(periodo.endDate) : new Date();

        linhaDoTempo.forEach(ponto => {
            if (ponto.data >= inicio && ponto.data <= fim) {
                ponto.marcado = true;
            }
        });
    });
}

function extrairPeriodosTrabalhados(jobs) {
    return jobs.flatMap(job => job.period.map(p => ({
        startDate: p.startDate,
        endDate: p.endDate || formatarDataAtualParaString()
    })));
}

function encontrarLacunas(jobs, dataInicial) {
    const periodosTrabalhados = extrairPeriodosTrabalhados(jobs);
    let linhaDoTempo = criarLinhaDoTempo(dataInicial);
    marcarPeriodosTrabalhados(linhaDoTempo, periodosTrabalhados);

    let lacunas = [];
    let lacunaAtual = null;

    linhaDoTempo.forEach(ponto => {
        if (!ponto.marcado) {
            if (!lacunaAtual) {
                lacunaAtual = { startDate: formatarDataParaString(ponto.data), endDate: null };
            }
        } else {
            if (lacunaAtual) {
                lacunaAtual.endDate = formatarDataParaString(new Date(ponto.data.getFullYear(), ponto.data.getMonth() - 1));
                lacunas.push(lacunaAtual);
                lacunaAtual = null;
            }
        }
    });

    if (lacunaAtual) {
        lacunaAtual.endDate = formatarDataParaString(new Date());
        lacunas.push(lacunaAtual);
    }

    return lacunas;
}

function formatarDataParaString(data) {
    return `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
}

const lacunas = encontrarLacunas(dados[0].jobs, "01/1999");
console.log(lacunas);
