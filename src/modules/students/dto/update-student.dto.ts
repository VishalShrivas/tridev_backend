import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';

/**
 * Corrections to an existing student's record. Excludes `scholarNumber`
 * (permanent identifier, never changes after admission) and the register
 * discharge fields (handled only via the dedicated discharge endpoint).
 */
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['scholarNumber'] as const),
) {}
