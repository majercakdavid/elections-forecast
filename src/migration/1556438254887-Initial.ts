import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1556438254887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "party" ("id" character varying NOT NULL, "name" character varying NOT NULL, "iconUrl" character varying NOT NULL, "color" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_e6189b3d533e140bb33a6d2cec1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_forecast" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "nickname" character varying NOT NULL, "region" character varying NOT NULL, "latestVersion" integer NOT NULL, CONSTRAINT "PK_16a21378272f4b10b9ca87ac59d" PRIMARY KEY ("id", "email", "nickname"))`);
        await queryRunner.query(`CREATE TABLE "forecast" ("version" integer NOT NULL, "percentage" integer NOT NULL, "valid" boolean NOT NULL DEFAULT true, "userForecastId" uuid NOT NULL, "userForecastEmail" character varying NOT NULL, "userForecastNickname" character varying NOT NULL, "partyId" character varying NOT NULL, CONSTRAINT "PK_d84df94344984464c1f45a6b506" PRIMARY KEY ("version", "userForecastId", "userForecastEmail", "userForecastNickname", "partyId"))`);
        await queryRunner.query(`ALTER TABLE "forecast" ADD CONSTRAINT "FK_cbfb88b95f7c990257e13c81bc6" FOREIGN KEY ("userForecastId", "userForecastEmail", "userForecastNickname") REFERENCES "user_forecast"("id","email","nickname") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forecast" ADD CONSTRAINT "FK_afe79c0f8b207c65246945f9720" FOREIGN KEY ("partyId") REFERENCES "party"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "forecast" DROP CONSTRAINT "FK_afe79c0f8b207c65246945f9720"`);
        await queryRunner.query(`ALTER TABLE "forecast" DROP CONSTRAINT "FK_cbfb88b95f7c990257e13c81bc6"`);
        await queryRunner.query(`DROP TABLE "forecast"`);
        await queryRunner.query(`DROP TABLE "user_forecast"`);
        await queryRunner.query(`DROP TABLE "party"`);
    }

}
