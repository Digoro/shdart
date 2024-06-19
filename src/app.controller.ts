import { Body, Controller, Get, InternalServerErrorException, Param, Post, Put, Query, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CorpService } from './app.service';
import { CorpSearchDto, PaginationSearchDto } from './dto';
import { Corp, Finance } from './entity';

@Controller('/api')
export class AppController {
  constructor(
    private corpService: CorpService,
    private config: ConfigService
  ) { }

  @Post('/corp')
  async addAllCorp(@Body() data: any, @Res() res) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.corpService.addAllCorp();
    } else {
      throw new UnauthorizedException('인증키가 올바르지 않습니다.')
    }
  }

  @Post('/finance')
  async addAllFinance(@Body() data: any, @Res() res) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.corpService.addAllFinance();
    } else {
      throw new UnauthorizedException('인증키가 올바르지 않습니다.')
    }
  }

  @Put('/finance')
  async updatAllFinance(@Body() data: any) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.corpService.updateAllFinance();
    } else {
      throw new UnauthorizedException('인증키가 올바르지 않습니다.')
    }
  }

  @Get('/search/finance')
  async searchFinance(@Query() dto: PaginationSearchDto): Promise<Pagination<Finance>> {
    return await this.corpService.searchFinance(dto);
  }

  @Get('/search/corp')
  async searchCorp(@Query() dto: CorpSearchDto): Promise<Corp[]> {
    return await this.corpService.searchCorp(dto);
  }

  @Get('/find/corp')
  async findCorp(@Query() dto: { term: string }): Promise<Corp[]> {
    return await this.corpService.findCorp(dto.term);
  }

  @Get('/corp/:code')
  async getCorp(@Param('code') code: string): Promise<Corp> {
    return await this.corpService.getCorpByCode(code);
  }

  @Post('/chat')
  async getAnswerMessage(@Body() data: any) {
    try {
      const answer = await this.corpService.getAnswerMessage(data);
      return { answer }
    } catch (e) {
      throw new InternalServerErrorException('채팅 답변 오류', e.message)
    }
  }
}
