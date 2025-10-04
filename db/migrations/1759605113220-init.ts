import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759605113220 implements MigrationInterface {
    name = 'Init1759605113220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_entity" ("email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_415c35b9b3b6fe45a3b065030f5" PRIMARY KEY ("email"))`);
        await queryRunner.query(`CREATE TABLE "article_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "text" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdByEmail" character varying, CONSTRAINT "PK_362cadb16e72c369a1406924e2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "article_entity" ADD CONSTRAINT "FK_acd38bb69eea5a6dc29426e5661" FOREIGN KEY ("createdByEmail") REFERENCES "user_entity"("email") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article_entity" DROP CONSTRAINT "FK_acd38bb69eea5a6dc29426e5661"`);
        await queryRunner.query(`DROP TABLE "article_entity"`);
        await queryRunner.query(`DROP TABLE "user_entity"`);
    }

}
