import { JobCardProperties, JobProjectProperties, JobProjectsProperties } from "./job-card.interface";
import styles from './job-card.module.css';

export function JobCard({ company, city, position, period, children }: JobCardProperties) {
    return <div className={styles.card}>
        <div className={styles.companyCityBox}>
            <div className={styles.company}>{company}</div>
            <div className={styles.city}>{city}</div>
        </div>
        <div className={styles.positionPeriodBox}>
            <div className={styles.position}>{position}</div>
            <div className={styles.period}>{period[0].startDate} a {period[0].endDate}</div>
        </div>
        {children}
    </div>
}

export function JobProjects({ children }: JobProjectsProperties) {
    return <div className={styles.jobProjects}>
        {children}
    </div>
}

export function JobProject({ description, stacks }: JobProjectProperties) {
    return <li className={styles.description}>{description}</li>
}