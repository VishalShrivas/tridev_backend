import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { EnrollmentResponseDto } from '../dto/enrollment-response.dto';
import { QueryEnrollmentsDto } from '../dto/query-enrollments.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import { EnrollmentsService } from '../services/enrollments.service';

@ApiTags('enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Enroll a student into a class for an academic year',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: EnrollmentResponseDto })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Student already enrolled this year, or roll number taken in this class',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async create(
    @Body() dto: CreateEnrollmentDto,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.create(dto);
    return new EnrollmentResponseDto(enrollment);
  }

  @Get()
  @ApiOperation({ summary: 'Query enrollment history' })
  @ApiResponse({ status: HttpStatus.OK, type: [EnrollmentResponseDto] })
  async findAll(
    @Query() query: QueryEnrollmentsDto,
  ): Promise<EnrollmentResponseDto[]> {
    const enrollments = await this.enrollmentsService.findAll(query);
    return enrollments.map(
      (enrollment) => new EnrollmentResponseDto(enrollment),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an enrollment by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: EnrollmentResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.findById(id);
    return new EnrollmentResponseDto(enrollment);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Correct a roll number or status (manual fixups only)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: EnrollmentResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnrollmentDto,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.update(id, dto);
    return new EnrollmentResponseDto(enrollment);
  }
}
