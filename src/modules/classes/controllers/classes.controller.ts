import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OptionItemDto } from '../../../common/dto/option-item.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ClassOptionSearchDto } from '../dto/class-option-search.dto';
import { ClassResponseDto } from '../dto/class-response.dto';
import { ClassRosterEntryDto } from '../dto/class-roster-entry.dto';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { ClassesService } from '../services/classes.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a class within an academic year' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ClassResponseDto })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async create(@Body() dto: CreateClassDto): Promise<ClassResponseDto> {
    const klass = await this.classesService.create(dto);
    return new ClassResponseDto(klass);
  }

  @Post('options')
  @ApiOperation({
    summary: 'Search classes by keyword for dropdown/autocomplete pickers',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [OptionItemDto] })
  async findOptions(
    @Body() dto: ClassOptionSearchDto,
  ): Promise<OptionItemDto[]> {
    return this.classesService.findOptions(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List classes, optionally filtered by academic year',
  })
  @ApiQuery({ name: 'academicYearId', required: false, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: [ClassResponseDto] })
  async findAll(
    @Query('academicYearId') academicYearId?: string,
  ): Promise<ClassResponseDto[]> {
    const classes = await this.classesService.findAll(academicYearId);
    return classes.map((klass) => new ClassResponseDto(klass));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: ClassResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClassResponseDto> {
    const klass = await this.classesService.findById(id);
    return new ClassResponseDto(klass);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get the active roster for a class' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: [ClassRosterEntryDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found' })
  async findRoster(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClassRosterEntryDto[]> {
    const roster = await this.classesService.findRoster(id);
    return roster.map((entry) => new ClassRosterEntryDto(entry));
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a class' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: ClassResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassDto,
  ): Promise<ClassResponseDto> {
    const klass = await this.classesService.update(id, dto);
    return new ClassResponseDto(klass);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a class' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Class deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.classesService.remove(id);
  }
}
