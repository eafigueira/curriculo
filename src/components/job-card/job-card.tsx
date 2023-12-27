import { CardProperties } from "./job-card.interface";

export function JobCard({ title, position, description, startDate, endDate }: CardProperties) {
    return <div className="job-card">
        <div className="position">{position}</div>
        <div className="title">{title}</div>
        <div className="description">{description}</div>
        <div className="period">
            <div className="start-date">{startDate}</div>
            <div className="end-date">{endDate}</div>
        </div>
    </div>
}