import { IsString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class CreatePlaylistDTO {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly songs: number[];
  @IsNumber()
  @IsNotEmpty()
  readonly user: number;
}
