import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { OptionSearchDto } from '../../../common/dto/option-search.dto';

export class ClassOptionSearchDto extends OptionSearchDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Restrict results to classes in this academic year. Omit to search across all years.',
  })
  @IsOptional()
  @IsUUID()
  academicYearId?: string;
}
