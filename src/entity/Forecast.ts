import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import Party from "./Party";
import UserForecast from "./UserForecast";

@Entity()
export default class Forecast {
    @ManyToOne(type => UserForecast, {primary: true})
    userForecast: UserForecast;

    @PrimaryColumn()
    version: number;

    @ManyToOne(type => Party, {primary: true})
    @JoinColumn()
    party: Party;

    @Column()
    percentage: number;

    @Column({default: true})
    valid: boolean;
}
