import { ContactProperties, ContactsProperties } from "./contacts.interface";
import styles from './contacts.module.css'

export function Contacts({ contacts }: ContactsProperties) {
    return <div className={styles.box}>
        {contacts?.map(({ contact, type }) => <Contact type={type} contact={contact} />)}
    </div>
}

export function Contact({ contact, type }: ContactProperties) {
    return <div className={styles.contactBox}>
        <img className={styles.photo} src={`/api/images?type=${type}`} width={16} height={16} />
        <div className={styles.concact}>{contact}</div>
    </div>
}