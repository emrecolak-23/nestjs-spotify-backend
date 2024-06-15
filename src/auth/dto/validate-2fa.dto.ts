import { IsNotEmpty, IsString } from 'class-validator';

export class Validate2FADTO {
  @IsNotEmpty()
  @IsString()
  token: string;
}
