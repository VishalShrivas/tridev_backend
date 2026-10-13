import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export enum PromotionOutcome {
  PROMOTED = 'PROMOTED',
  REPEATED = 'REPEATED',
  LEFT = 'LEFT',
}

export class PromotionEntryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: PromotionOutcome })
  @IsEnum(PromotionOutcome)
  outcome!: PromotionOutcome;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Target class for this student. Required for PROMOTED/REPEATED outcomes.',
  })
  @IsOptional()
  @IsUUID()
  newClassId?: string;
}

export class BulkPromoteDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Source academic year being promoted from',
  })
  @IsUUID()
  fromAcademicYearId!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Target academic year being promoted into',
  })
  @IsUUID()
  toAcademicYearId!: string;

  @ApiProperty({ type: [PromotionEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PromotionEntryDto)
  entries!: PromotionEntryDto[];
}
