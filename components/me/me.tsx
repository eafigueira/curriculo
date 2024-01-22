import { MeProperties } from "./me.interface";
import styles from './me.module.css'

export function Me({ name, birthDate }: MeProperties) {
    return <div className={styles.box}>
        <img className={styles.photo} src={`/api/images?type=PHOTO`} width={150} height={150} />
        <div className={styles.name}>{name}</div>
        <div className={styles.birthDate}>{birthDate}</div>
    </div>
}