import { ContactProperties, ContactsProperties } from "./contacts.interface";

export function Contacts({ contacts }: ContactsProperties) {
    return <div>
        {contacts.map(({ contact, type }) => <Contact type={type} contact={contact} />)}
    </div>
}

export function Contact({ contact, type }: ContactProperties) {
    return <div>
        <div>{contact}</div>
        <div>{type}</div>
    </div>

}