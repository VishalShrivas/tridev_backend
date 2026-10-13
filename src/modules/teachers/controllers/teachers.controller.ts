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
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { TeacherResponseDto } from '../dto/teacher-response.dto';
import { UpdateTeacherDto } from '../dto/update-teacher.dto';
import { TeachersService } from '../services/teachers.service';

@ApiTags('teachers')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Register a new teacher (creates a login account)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TeacherResponseDto })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async create(@Body() dto: CreateTeacherDto): Promise<TeacherResponseDto> {
    const teacher = await this.teachersService.create(dto);
    return new TeacherResponseDto(teacher);
  }

  @Post('options')
  @ApiOperation({
    summary: 'Search teachers by keyword for dropdown/autocomplete pickers',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [OptionItemDto] })
  async findOptions(@Body() dto: OptionSearchDto): Promise<OptionItemDto[]> {
    return this.teachersService.findOptions(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all teachers' })
  @ApiResponse({ status: HttpStatus.OK, type: [TeacherResponseDto] })
  async findAll(): Promise<TeacherResponseDto[]> {
    const teachers = await this.teachersService.findAll();
    return teachers.map((teacher) => new TeacherResponseDto(teacher));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a teacher by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TeacherResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TeacherResponseDto> {
    const teacher = await this.teachersService.findById(id);
    return new TeacherResponseDto(teacher);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a teacher profile' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TeacherResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherDto,
  ): Promise<TeacherResponseDto> {
    const teacher = await this.teachersService.update(id, dto);
    return new TeacherResponseDto(teacher);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a teacher and their login account' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Teacher removed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.teachersService.remove(id);
  }
}
