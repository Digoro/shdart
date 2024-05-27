import { Body, Controller, Get, HttpStatus, Post, Query, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CorpService } from './app.service';
import { Corp } from './corp';
import { PaginationSearchDto } from './dto';

@Controller()
export class AppController {
  constructor(
    private corpService: CorpService,
    private config: ConfigService
  ) { }

  @Post('/api/all_stock_corp')
  async addAllStockCorp(@Body() data: any, @Res() res) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.corpService.addAllStockCorp();
      res.status(HttpStatus.OK).json({
        message: 'all stock corp added'
      });
    } else {
      throw new UnauthorizedException('인증키가 올바르지 않습니다.')
    }
  }

  @Get('/api/search')
  async search(@Query() dto: PaginationSearchDto): Promise<Pagination<Corp>> {
    return await this.corpService.search(dto);
  }
}
