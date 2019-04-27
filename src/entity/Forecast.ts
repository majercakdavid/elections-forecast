import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import Party from "./Party";
import UserForecast from "./UserForecast";

@Entity()
export default class Forecast {
    @PrimaryColumn()
    @ManyToOne(type => UserForecast)
    userForecast: UserForecast;

    @PrimaryColumn()
    version: number;

    @PrimaryColumn()
    @ManyToOne(type => Party)
    @JoinColumn()
    party: Party;

    @Column()
    percentage: number;

    @Column({default: true})
    valid: boolean;
}
