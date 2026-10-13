import { ApiProperty } from '@nestjs/swagger';

/**
 * Minimal {id, name} shape returned by every module's option-search
 * endpoint, for populating frontend dropdown/autocomplete pickers.
 */
export class OptionItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
