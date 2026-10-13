import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../../common/decorators/roles.decorator';
import { BulkPromoteDto } from '../dto/bulk-promote.dto';
import { PromotionResultDto } from '../dto/promotion-result.dto';
import { PromotionsService } from '../services/promotions.service';

@ApiTags('promotions')
@ApiBearerAuth()
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('bulk')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'Bulk end-of-year promotion: move students to their next class/year',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: [PromotionResultDto],
    description:
      'Per-student result; a single failing entry does not fail the batch',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin role required',
  })
  async bulkPromote(
    @Body() dto: BulkPromoteDto,
  ): Promise<PromotionResultDto[]> {
    return this.promotionsService.bulkPromote(dto);
  }
}
