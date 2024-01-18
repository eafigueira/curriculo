import { HardSkillProperties, HardSkillsProperties } from "./hard-skills.interface";

export function HardSkills({ hardSkills }: HardSkillsProperties) {
    return <div>
        {hardSkills.map(hardSkill =>
            <HardSkill
                name={hardSkill.name}
                skillTimeMonths={hardSkill.skillTimeMonths}
                totalTimeMonths={hardSkill.totalTimeMonths} />)}
    </div>
}

export function HardSkill({ name, skillTimeMonths }: HardSkillProperties) {
    return <div>
        <div>{name}</div>
        <div>{skillTimeMonths}</div>
    </div>
}