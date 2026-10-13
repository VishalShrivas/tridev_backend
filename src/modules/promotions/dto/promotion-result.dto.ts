import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PromotionResultDto {
  @ApiProperty({ format: 'uuid' })
  studentId!: string;

  @ApiProperty()
  success!: boolean;

  @ApiPropertyOptional({ format: 'uuid' })
  newEnrollmentId?: string;

  @ApiPropertyOptional()
  error?: string;
}
