import { useEffect, useState } from "react";
import { JobCard, JobProject, JobProjects } from "../components/job-card/job-card";
import styles from './index.module.css';
export default function Index() {
  const [current, setCurrent] = useState(undefined as any)
  useEffect(() => {
    fetch("/api/users").then(data => data.json())
    .then(data => {
      setCurrent(data[0])
    })
  }, [])
  
  
  return (
    <main className={styles.main}>
      <div className={styles.left}>
        <div>{current?.name}</div>
        <div>{current?.birthDate}</div>
      </div>
      <div className={styles.right}>
        {current?.jobs.map(job => <JobCard
          company={job?.company}
          period={[
            {
              startDate: job.period[0].startDate,
              endDate: job.period[0].endDate
            }
          ]}
          position={job.position}
          city={job.city}>
          <JobProjects>
            {job.projects.map(project => <JobProject
              description={project.description}
              stacks={project.stacks}
            />)}
          </JobProjects>
        </JobCard>)
        }
      </div>
    </main>
  )
}
