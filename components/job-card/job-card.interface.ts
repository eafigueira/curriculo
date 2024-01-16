import { ReactNode } from "react"

export interface JobPeriod {
    startDate: string
    endDate: string
}
export interface JobCardProperties {
    company: string
    city: string
    position: string
    period: JobPeriod[]
    children?: ReactNode
}

export interface JobProjectsProperties {
    children?: ReactNode
}

export interface JobProjectProperties {
    description: string
    stacks: string[]
}