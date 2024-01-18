export interface HardSkillsProperties {
    hardSkills: HardSkillProperties[]
}

export interface HardSkillProperties {
    name: string,
    totalTimeMonths: number,
    skillTimeMonths: number
}