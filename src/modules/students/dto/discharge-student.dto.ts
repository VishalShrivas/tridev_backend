import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class DischargeStudentDto {
  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  dischargeDate!: string;

  @ApiProperty({ example: '8th' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  dischargeClass!: string;

  @ApiProperty({ example: 'Family relocated to another city' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  dischargeCause!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
