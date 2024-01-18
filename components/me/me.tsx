import { MeProperties } from "./me.interface";

export function Me({ name, birthDate }: MeProperties) {
    return <div>
        <div>{name}</div>
        <div>{birthDate}</div>
    </div>
}