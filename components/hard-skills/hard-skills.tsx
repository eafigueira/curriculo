import { HardSkillProperties, HardSkillsProperties } from "./hard-skills.interface";
import styles from './hard-skills.module.css'

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
    return <div className={styles.hardSkillBox}>
        <div className={styles.boxTypeStack}>
            <img src={`/api/images?type=${stack.type}`} width={16} height={16} />
            <div className={styles.nameStack}>{stack.name}</div>
        </div>
        <progress className={styles.progressBar} value={timeStackWorking} max={timeTotalWorking} />
    </div>
}