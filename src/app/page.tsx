import { JobCard, JobProject, JobProjects } from "@/components/job-card/job-card";

export default function Home() {
  return (
    <main className="main">
      <div className="left">

      </div>
      <div className="right">
        <JobCard
          company="Frigorifico Chapecó"
          position="Estagiário"
          startDate="01/1999"
          endDate="01/2001"
          city="Chapecó">
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
        <JobCard
          company="Frigorifico Chapecó"
          position="Estagiário"
          startDate="01/1999"
          endDate="01/2001"
          city="Chapecó">
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
    </main>

  )
}
