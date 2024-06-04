import { Body, Controller, Get, Param, Post, Put, Query, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CorpService } from './app.service';
import { CorpSearchDto, PaginationSearchDto } from './dto';
import { Corp, Finance } from './entity';

@Controller()
export class AppController {
  constructor(
    private corpService: CorpService,
    private config: ConfigService
  ) { }

  @Post('/api/corp')
  async addAllCorp(@Body() data: any, @Res() res) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.corpService.addAllCorp();
    } else {
      throw new UnauthorizedException('인증키가 올바르지 않습니다.')
    }
  }

  @Post('/api/finance')
  async addAllFinance(@Body() data: any, @Res() res) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.corpService.addAllFinance();
    } else {
      throw new UnauthorizedException('인증키가 올바르지 않습니다.')
    }
  }

  @Put('/api/finance')
  async updatAllFinance(@Body() data: any) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.corpService.updateAllFinance();
    } else {
      throw new UnauthorizedException('인증키가 올바르지 않습니다.')
    }
  }

  @Get('/api/search/finance')
  async searchFinance(@Query() dto: PaginationSearchDto): Promise<Pagination<Finance>> {
    return await this.corpService.searchFinance(dto);
  }

  @Get('/api/search/corp')
  async searchCorp(@Query() dto: CorpSearchDto): Promise<Pagination<Corp>> {
    return await this.corpService.searchCorp(dto);
  }

  @Get('/api/summary/corp')
  async summaryCorp(@Query() dto: { corpName: string }): Promise<{ response: string }> {
    return await this.corpService.summaryCorp(dto.corpName);
  }

  @Get('/api/summary/market')
  async summaryMarket(): Promise<{ response: string }> {
    return await this.corpService.summaryMarket();
  }

  @Get('/api/corp/:code')
  async getCorp(@Param('code') code: string): Promise<Corp> {
    return await this.corpService.getCorp(code);
  }
}
