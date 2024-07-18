import { Body, Controller, Get, InternalServerErrorException, Param, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pagination } from 'nestjs-typeorm-paginate';
import { AppService } from './app.service';
import { CorpSearchDto, PaginationSearchDto, StockPriceSearchDto } from './dto';
import { Corp, Finance, StockPrice } from './entity';
import { FinanceService } from './finance.service';

@Controller('/api')
export class AppController {
  constructor(
    private corpService: AppService,
    private financeSerivce: FinanceService,
    private config: ConfigService
  ) { }

  @Post('/corp')
  async addAllCorp(@Body() data: any) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.corpService.addAllCorp();
    } else {
      throw new UnauthorizedException('인증키가 올바르지 않습니다.')
    }
  }

  @Post('/finance')
  async addAllFinance(@Body() data: any) {
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

  @Post('/stock_price')
  async addAllStockPrice(@Body() data: any) {
    if (data.accessKey == this.config.get('ACCESS_KEY')) {
      await this.financeSerivce.addStockPrices();
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

  @Post('/search/stock_price')
  async searchStockPrice(@Body() dto: StockPriceSearchDto): Promise<Pagination<StockPrice>> {
    return await this.financeSerivce.searchStockPrice(dto);
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

  @Get('/chat/welcome')
  async getWelcomeQuestions() {
    try {
      const answer = await this.corpService.getWelcomeQuestions();
      return { answer }
    } catch (e) {
      throw new InternalServerErrorException('웰컴 질문 오류', e.message)
    }
  }

  @Post('/chat/relation_questions')
  async getRelationQuestions(@Body() data: any) {
    try {
      const answer = await this.corpService.getRealtionQuestions(data);
      return { answer }
    } catch (e) {
      throw new InternalServerErrorException('채팅 답변 오류', e.message)
    }
  }
}