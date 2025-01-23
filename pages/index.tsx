import { useEffect, useState } from "react";
import { Contacts } from "../components/contacts/contacts";
import {
  JobCard,
  JobProject,
  JobProjects,
} from "../components/job-card/job-card";
import { Me } from "../components/me/me";
import styles from "./index.module.css";

export default function Index() {
  const [current, setCurrent] = useState(undefined as any);
  useEffect(() => {
    fetch("/api/users")
      .then((data) => data.json())
      .then((data) => {
        setCurrent(data[0]);
      });
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.left}>
        <Me name={current?.name} birthDate={current?.birthDate} />
        <Contacts contacts={current?.contacts} />
      </div>
      <div className={styles.right}>
        {current?.jobs.map((job: any) => {
          return (
            <JobCard
              company={job?.company}
              period={job.period}
              position={job.position}
              city={job.city}
              breakPage={job.breakPage}
            >
              <JobProjects>
                {job.projects.map((project: any) => (
                  <JobProject
                    description={project.description}
                    stacks={project.stacks}
                  />
                ))}
              </JobProjects>
            </JobCard>
          );
        })}
      </div>
    </main>
  );
}
