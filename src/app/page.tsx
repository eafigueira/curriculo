import { JobCard, JobProject, JobProjects } from "@/components/job-card/job-card"

export default function Home() {
  return (
    <div className="page">
      <div className="left">
      </div>
      <div className="right">
        <JobCard
          company="Frigorifico chapecó"
          position="Estagiário"
          startDate="01/1999"
          city="Chapecó"
          endDate="01/2001">
          <JobProjects>
            <JobProject
              description="Atuação na correção do bug do milênio, convertendo o padrão de input de datas"
              stacks={["PICK BASIC", "UNIDATA"]}
            />
            <JobProject
              description="Manutenção no modulo de mercado externo, criando relatórios"
              stacks={["PICK BASIC", "UNIDATA"]}
            />
          </JobProjects>
        </JobCard>
      </div>
    </div>
  )
}
