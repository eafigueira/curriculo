import {
  JobCardProperties,
  JobProjectProperties,
  JobProjectsProperties,
} from "./job-card.interface";
import styles from "./job-card.module.css";

export function JobCard({
  company,
  city,
  position,
  period,
  children,
  breakPage,
}: JobCardProperties) {
  return (
    <div
      className={styles.card}
      style={breakPage ? { pageBreakAfter: "always" } : {}}
    >
      <div className={styles.companyCityBox}>
        <div className={styles.company}>{company}</div>
        <div className={styles.city}>{city}</div>
      </div>
      <div className={styles.positionPeriodBox}>
        <div className={styles.position}>{position}</div>
        <JobPeriod period={period} />
      </div>
      {children}
    </div>
  );
}

export function JobProjects({ children }: JobProjectsProperties) {
  return <div className={styles.jobProjects}>{children}</div>;
}

export function JobProject({ description }: JobProjectProperties) {
  return <li className={styles.description}>{description}</li>;
}

export function JobPeriod({ period }: any) {
  return (
    <div className={styles.period}>
      {period.map((item: any) => {
        if (item.endDate) {
          return (
            <div key={item.startDate + item.endDate} className={styles.item}>
              {item.startDate} a {item.endDate}
            </div>
          );
        }
        return (
          <div key={item.startDate + item.endDate} className={styles.item}>
            Atualmente
          </div>
        );
      })}
    </div>
  );
}
