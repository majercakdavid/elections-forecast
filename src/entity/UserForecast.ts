import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import Forecast from "./Forecast";

@Entity()
export default class UserForecast {
    @PrimaryGeneratedColumn("uuid") id: string;
    @PrimaryColumn({ unique: true }) email: string;
    @PrimaryColumn({ unique: true }) nickname: string;
    @Column() region: string;
    @Column() latestVersion: number;

    @OneToMany(type => Forecast, forecast => forecast.userForecast)
    forecasts: Forecast[];
}
