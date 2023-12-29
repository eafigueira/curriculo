import { JobCardProperties, JobProjectProperties, JobProjectsProperties } from "./job-card.interface";

export function JobCard({ company, city, position, startDate, endDate, children }: JobCardProperties) {
    return <div className="job-card">
        <div className="company-city-box">
            <div className="company">{company}</div>
            <div className="city">{city}</div>
        </div>
        <div className="position-period-box">
            <div className="position">{position}</div>
            <div className="period">{startDate} a {endDate}</div>
        </div>
        {children}
    </div>
}

export function JobProjects({ children }: JobProjectsProperties) {
    return <div className="job-projects">
        {children}
    </div>
}

export function JobProject({ description, stacks }: JobProjectProperties) {
    return <div className="job-project">
        <div className="description">{description}</div>
    </div>
}