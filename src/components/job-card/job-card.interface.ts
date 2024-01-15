import { ReactNode } from "react"

export interface JobCardProperties{
    company: string
    city: string
    position: string 
    startDate: string 
    endDate: string
    children?: ReactNode
}

export interface JobProjectsProperties {
    children?: ReactNode
}

export interface JobProjectProperties {
    description: string
    stacks: string[]
}