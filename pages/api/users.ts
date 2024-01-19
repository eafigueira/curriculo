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
function sumaryHardSkills(jobs: any[]) {
  const stackTempo = {} as any;

  const firstJobDate = jobs[0].period[0].startDate
  const lastJobDate = jobs[jobs.length - 1].period[jobs[jobs.length - 1].period.length - 1].endDate

  const timeTotalWorking = diferencaEmMeses(firstJobDate, lastJobDate)

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
  return Object.entries(stackTempo).map(([stack, tempoTotal]) => ({ stack, timeTotalWorking, timeStackWorking: tempoTotal }));
}

function parseDate(dateString: string): Date {
  const [month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1);
}

export default function handler(req: Request, res: any) {
  if (req.method === 'GET') {
    data.forEach(user => {
      user.jobs.sort((a, b) => parseDate(a.period[0].startDate).getTime() - parseDate(b.period[0].startDate).getTime());
    });
    const users = data.map(user => ({ ...user, hardSkills: sumaryHardSkills(user.jobs) }))
    res.status(200).json(users);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} Não Permitido`);
  }
}