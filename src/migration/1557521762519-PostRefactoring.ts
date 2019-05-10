import {MigrationInterface, QueryRunner} from "typeorm";

export class PostRefactoring1557521762519 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user_forecast" ADD "ipAddress" character varying NOT NULL DEFAULT 'not-defined'`);
        await queryRunner.query(`ALTER TABLE "forecast" ALTER COLUMN "percentage" TYPE numeric(4,1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "forecast" ALTER COLUMN "percentage" TYPE numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "user_forecast" DROP COLUMN "ipAddress"`);
    }

}
