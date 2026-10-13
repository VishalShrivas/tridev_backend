import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Request body for a module's "option" search endpoint. Extend this in a
 * module-specific DTO to add extra filters (e.g. academicYearId for classes).
 */
export class OptionSearchDto {
  @ApiPropertyOptional({
    description:
      'Keyword to match against the display name (case-insensitive, partial match). Omit to list all.',
    example: 'Grade 5',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;
}
