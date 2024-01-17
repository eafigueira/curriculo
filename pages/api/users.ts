import data from '../../data/database.json'

function diferencaEmMeses(dataInicial: string, dataFinal: string) {
  const [mesInicial, anoInicial] = dataInicial.split('/').map(Number);

  let mesFinal, anoFinal;
  if (dataFinal) {
    [mesFinal, anoFinal] = dataFinal.split('/').map(Number);
  } else {
    const dataAtual = new Date();
    mesFinal = dataAtual.getMonth() + 1;
    anoFinal = dataAtual.getFullYear();
  }

  const dataInicio = new Date(anoInicial, mesInicial - 1);
  const dataFim = new Date(anoFinal, mesFinal - 1);

  const diferencaAnos = dataFim.getFullYear() - dataInicio.getFullYear();
  const diferencaMeses = dataFim.getMonth() - dataInicio.getMonth();

  return diferencaAnos * 12 + diferencaMeses;
}
function sumaryTimeByStack(jobs: any[]) {
  const stackTempo = {} as any;

  jobs.forEach(job => {
    job.period.forEach((periodo: any) => {
      const tempo = diferencaEmMeses(periodo.startDate, periodo.endDate);
      job.projects.forEach((project: any) => {
        project.stack.forEach((tech: any) => {
          if (stackTempo[tech]) {
            stackTempo[tech] += tempo;
          } else {
            stackTempo[tech] = tempo;
          }
        });
      });
    });
  });
  return Object.entries(stackTempo).map(([stack, tempoTotal]) => ({ stack, tempoTotal }));
}

export default function handler(req: any, res: any) {
  const users = data.map(user => ({ ...user, sumary: sumaryTimeByStack(user.jobs) }))
  res.status(200).json(users);
}