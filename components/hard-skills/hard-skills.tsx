import { HardSkillProperties, HardSkillsProperties } from "./hard-skills.interface";

export function HardSkills({ hardSkills }: HardSkillsProperties) {
    return <div>
        {hardSkills?.map(hardSkill =>
            <HardSkill
                stack={hardSkill.stack}
                timeStackWorking={hardSkill.timeStackWorking}
                timeTotalWorking={hardSkill.timeTotalWorking} />)}
    </div>
}

export function HardSkill({ stack, timeStackWorking, timeTotalWorking }: HardSkillProperties) {
    return <div>
        <div>{stack}</div>
        <progress value={timeStackWorking} max={timeTotalWorking} />
    </div>
}