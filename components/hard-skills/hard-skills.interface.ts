export interface HardSkillsProperties {
    hardSkills: HardSkillProperties[]
}

export interface HardSkillStackProperties {
    name:string,
    type: string
}

export interface HardSkillProperties {
    stack: HardSkillStackProperties,
    timeTotalWorking: number,
    timeStackWorking: number
}