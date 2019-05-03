import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class UserForecast {
    @PrimaryGeneratedColumn("uuid") id: string;
    @PrimaryColumn({unique: true}) email: string;
    @PrimaryColumn({unique: true}) nickname: string;
    @Column() region: string;
    @Column() latestVersion: number;
}
