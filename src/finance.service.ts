import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import yahooFinance from 'yahoo-finance2';
import { StockPriceSearchDto } from './dto';
import { Corp, StockPrice } from './entity';

@Injectable()
export class FinanceService {
    constructor(
        @InjectRepository(Corp) private corpRepo: Repository<Corp>,
        @InjectRepository(StockPrice) private stockPriceRepo: Repository<StockPrice>,
    ) { }

    async getFinancials(code: string) {
        // return await yahooFinance.historical(code, { period1: '2021-01-01' })
        // const queryOptions = { modules: ['financialData', 'incomeStatementHistory', 'balanceSheetHistory', 'cashflowStatementHistory'] };
        const result = await yahooFinance.quoteSummary(code, {
            modules: [
                "summaryDetail",
                "price",
                "financialData",
                "earningsHistory",
                "balanceSheetHistory",
                "cashflowStatementHistory",
                "incomeStatementHistory",
            ]
        })
        return result;
    }

    async addStockPrices() {
        const corps = await this.corpRepo.createQueryBuilder()
            .getMany();
        for (const corp of corps) {
            const list = [];
            try {
                const queryOptions = { period1: '2021-01-01' };
                const prices = await yahooFinance.historical(`${corp.code}.KS`, queryOptions);
                const data = prices.map(price => {
                    const newStockPrice = new StockPrice();
                    newStockPrice.corp = corp;
                    newStockPrice.date = price.date;
                    newStockPrice.open = price.open;
                    newStockPrice.high = price.high;
                    newStockPrice.low = price.low;
                    newStockPrice.close = price.close;
                    newStockPrice.volume = price.volume;
                    return newStockPrice;
                });
                list.push(...data);
                await this.corpRepo.createQueryBuilder()
                    .insert()
                    .into(StockPrice)
                    .values(list)
                    .execute();
            } catch (e) {
                console.log(e)
            }
        }
        return { message: 'done!' }
    }

    async searchStockPrice(dto: StockPriceSearchDto) {
        const options = { page: dto.page, limit: dto.limit };
        const query = this.stockPriceRepo.createQueryBuilder('stock')
            .where('corpCode = :code', { code: dto.code })
            .orderBy('date', 'DESC')
        return await paginate<StockPrice>(query, options);
    }
}