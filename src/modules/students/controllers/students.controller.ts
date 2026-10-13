import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../../common/decorators/roles.decorator';
import { BlobStorageService } from '../../../common/services/blob-storage.service';
import { CreateStudentDto } from '../dto/create-student.dto';
import { DischargeStudentDto } from '../dto/discharge-student.dto';
import { QueryStudentsDto } from '../dto/query-students.dto';
import { StudentResponseDto } from '../dto/student-response.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentsService } from '../services/students.service';

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

function optionalPhotoValidator(): ParseFilePipe {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: PHOTO_MAX_BYTES }),
      new FileTypeValidator({ fileType: /^image\/(jpeg|png)$/ }),
    ],
    fileIsRequired: false,
  });
}

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly blobStorageService: BlobStorageService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Admission form fields plus an optional photo (JPEG/PNG, max 5MB)',
    type: CreateStudentDto,
  })
  @ApiOperation({ summary: 'Admit a new student (full admission form)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: StudentResponseDto })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Duplicate scholar number/Aadhar/Samagra ID',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async create(
    @Body() dto: CreateStudentDto,
    @UploadedFile(optionalPhotoValidator()) photo?: Express.Multer.File,
  ): Promise<StudentResponseDto> {
    const photoUrl = photo
      ? await this.blobStorageService.upload('students', photo)
      : undefined;
    const student = await this.studentsService.create(dto, photoUrl);
    return new StudentResponseDto(student);
  }

  @Get()
  @ApiOperation({ summary: 'List/search students' })
  @ApiResponse({ status: HttpStatus.OK, type: [StudentResponseDto] })
  async findAll(
    @Query() query: QueryStudentsDto,
  ): Promise<StudentResponseDto[]> {
    const students = await this.studentsService.findAll(query);
    return students.map((student) => new StudentResponseDto(student));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: StudentResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentResponseDto> {
    const student = await this.studentsService.findById(id);
    return new StudentResponseDto(student);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Fields to correct plus an optional replacement photo (JPEG/PNG, max 5MB)',
    type: UpdateStudentDto,
  })
  @ApiOperation({ summary: 'Correct a student record' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: StudentResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
    @UploadedFile(optionalPhotoValidator()) photo?: Express.Multer.File,
  ): Promise<StudentResponseDto> {
    const photoUrl = photo
      ? await this.blobStorageService.upload('students', photo)
      : undefined;
    const student = await this.studentsService.update(id, dto, photoUrl);
    return new StudentResponseDto(student);
  }

  @Patch(':id/discharge')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Discharge a student (Admission & Discharge register)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: StudentResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async discharge(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DischargeStudentDto,
  ): Promise<StudentResponseDto> {
    const student = await this.studentsService.discharge(id, dto);
    return new StudentResponseDto(student);
  }
}
