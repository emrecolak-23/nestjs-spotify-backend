import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshToken1712924042106 implements MigrationInterface {
    name = 'AddRefreshToken1712924042106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
