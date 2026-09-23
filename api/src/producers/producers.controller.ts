import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AwardIntervalsResponseDto } from './dto/award-intervals-response.dto';
import { ProducersService } from './producers.service';

@ApiTags('producers')
@Controller('producers')
export class ProducersController {
  constructor(private readonly producersService: ProducersService) {}

  @Get('award-intervals')
  @ApiOperation({
    summary:
      'Produtores com o menor e o maior intervalo entre dois prêmios consecutivos',
  })
  @ApiOkResponse({ type: AwardIntervalsResponseDto })
  getAwardIntervals(): Promise<AwardIntervalsResponseDto> {
    return this.producersService.getAwardIntervals();
  }
}
