import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OptionItemDto } from '../../../common/dto/option-item.dto';
import { OptionSearchDto } from '../../../common/dto/option-search.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AcademicYearResponseDto } from '../dto/academic-year-response.dto';
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from '../dto/update-academic-year.dto';
import { AcademicYearsService } from '../services/academic-years.service';

@ApiTags('academic-years')
@ApiBearerAuth()
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new academic year' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AcademicYearResponseDto })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async create(
    @Body() dto: CreateAcademicYearDto,
  ): Promise<AcademicYearResponseDto> {
    const year = await this.academicYearsService.create(dto);
    return new AcademicYearResponseDto(year);
  }

  @Post('options')
  @ApiOperation({
    summary:
      'Search academic years by keyword for dropdown/autocomplete pickers',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [OptionItemDto] })
  async findOptions(@Body() dto: OptionSearchDto): Promise<OptionItemDto[]> {
    return this.academicYearsService.findOptions(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all academic years' })
  @ApiResponse({ status: HttpStatus.OK, type: [AcademicYearResponseDto] })
  async findAll(): Promise<AcademicYearResponseDto[]> {
    const years = await this.academicYearsService.findAll();
    return years.map((year) => new AcademicYearResponseDto(year));
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the currently active academic year' })
  @ApiResponse({ status: HttpStatus.OK, type: AcademicYearResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No current year set',
  })
  async findCurrent(): Promise<AcademicYearResponseDto> {
    const year = await this.academicYearsService.findCurrent();
    return new AcademicYearResponseDto(year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an academic year by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: AcademicYearResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Academic year not found',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicYearResponseDto> {
    const year = await this.academicYearsService.findById(id);
    return new AcademicYearResponseDto(year);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an academic year' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: AcademicYearResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Academic year not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcademicYearDto,
  ): Promise<AcademicYearResponseDto> {
    const year = await this.academicYearsService.update(id, dto);
    return new AcademicYearResponseDto(year);
  }

  @Patch(':id/set-current')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mark this academic year as the current one' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: AcademicYearResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Academic year not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async setCurrent(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicYearResponseDto> {
    const year = await this.academicYearsService.setCurrent(id);
    return new AcademicYearResponseDto(year);
  }
}
