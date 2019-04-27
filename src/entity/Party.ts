import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export default class Party {
    @PrimaryColumn() id: string;
    @Column() name: string;
    @Column() iconUrl: string;
    @Column() color: string;
    @Column() description: string;
}
