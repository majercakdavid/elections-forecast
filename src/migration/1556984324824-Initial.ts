import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1556984324824 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "party" ("id" character varying NOT NULL, "name" character varying NOT NULL, "iconUrl" character varying NOT NULL, "color" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_e6189b3d533e140bb33a6d2cec1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_forecast" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "nickname" character varying NOT NULL, "region" character varying NOT NULL, "latestVersion" integer NOT NULL, CONSTRAINT "UQ_0b2f4aff3e859a7fb328dce491d" UNIQUE ("email"), CONSTRAINT "UQ_cf3a33e128524e9fe54d6f344f7" UNIQUE ("nickname"), CONSTRAINT "PK_ae16b825f26887ce9fbdb285afb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "forecast" ("version" integer NOT NULL, "percentage" numeric(3,1) NOT NULL, "valid" boolean NOT NULL DEFAULT true, "userForecastId" uuid NOT NULL, "partyId" character varying NOT NULL, CONSTRAINT "PK_539a96a71510995ea41ef9f1c29" PRIMARY KEY ("version", "userForecastId", "partyId"))`);
        await queryRunner.query(`ALTER TABLE "forecast" ADD CONSTRAINT "FK_ae0cde22edc9326304658999aef" FOREIGN KEY ("userForecastId") REFERENCES "user_forecast"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forecast" ADD CONSTRAINT "FK_afe79c0f8b207c65246945f9720" FOREIGN KEY ("partyId") REFERENCES "party"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "forecast" DROP CONSTRAINT "FK_afe79c0f8b207c65246945f9720"`);
        await queryRunner.query(`ALTER TABLE "forecast" DROP CONSTRAINT "FK_ae0cde22edc9326304658999aef"`);
        await queryRunner.query(`DROP TABLE "forecast"`);
        await queryRunner.query(`DROP TABLE "user_forecast"`);
        await queryRunner.query(`DROP TABLE "party"`);
    }

}
