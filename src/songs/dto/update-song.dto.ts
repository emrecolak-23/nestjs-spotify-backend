import {
  IsArray,
  IsDateString,
  IsMilitaryTime,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSongDTO {
  @IsString()
  @IsOptional()
  title: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  artists;

  @IsDateString()
  @IsOptional()
  releasedDate: Date;

  @IsMilitaryTime()
  @IsOptional()
  duration: Date;

  @IsString()
  @IsOptional()
  lyrics: string;
}
