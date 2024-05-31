const xlsx = require('xlsx');
import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { PaginationSearchDto } from './dto';
import { Corp, Finance } from './entity';
const JSZip = require('jszip')

@Injectable()
export class CorpService {

  constructor(
    private config: ConfigService,
    @InjectRepository(Corp) private corpRepo: Repository<Corp>,
    @InjectRepository(Finance) private financeRepo: Repository<Finance>,
    private http: HttpService
  ) {
  }

  async addAllCorp() {
    // http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020506
    const kospi = xlsx.readFile(this.config.get('KOSPI_EXCEL_PATH'));
    const kosdaq = xlsx.readFile(this.config.get('KOSDAQ_EXCEL_PATH'));
    const kospiRows = xlsx.utils.sheet_to_json(kospi.Sheets[kospi.SheetNames[0]]);
    const kosdaqRows = xlsx.utils.sheet_to_json(kosdaq.Sheets[kosdaq.SheetNames[0]]);
    const rows = [...kospiRows, ...kosdaqRows]

    for (let i = 0; i < rows.length; i++) {
      const corp = new Corp();
      corp.code = rows[i]['종목코드'];
      corp.name = rows[i]['종목명'];
      corp.market = rows[i]['시장구분'];
      corp.industry = rows[i]['업종명'];
      await this.corpRepo.insert(corp);
    }
  }

  private waitforme(millisec) {
    return new Promise(resolve => {
      setTimeout(() => { resolve('') }, millisec);
    })
  }

  async addAllFinance() {
    const corps = await this.corpRepo.createQueryBuilder().getMany();
    for (let i = 384; i < corps.length; i++) {
      await this.waitforme(300);
      const res = await this.http.get(`https://m.stock.naver.com/api/stock/${corps[i].code}/finance/annual`).toPromise();
      const arr: Finance[] = [];
      if (res.status == 200) {
        if (!!res.data.financeInfo) {
          for (let j = 0; j < res.data.financeInfo.rowList.length; j++) {
            const data = res.data.financeInfo.rowList[j];
            const title = data.title;
            const cols = data.columns;
            const years = Object.keys(cols);
            for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
              const find = arr.filter(v => v.corp.id == corps[i].id && v.year == +years[yearIndex]);
              if (find.length > 0) {
                const value = cols[years[yearIndex]].value;
                find[0] = this.setFinance(title, find[0], value);
              } else {
                const finance = new Finance();
                finance.corp = corps[i];
                const value = cols[years[yearIndex]].value;
                finance.year = +years[yearIndex];
                const newFinance = this.setFinance(title, finance, value);
                arr.push(newFinance)
              }
            }
          }
        } else {
          console.log('there is no finance list')
        }
      } else {
        console.log('error api')
      }
      for (let i = 0; i < arr.length; i++) {
        await this.financeRepo.insert(arr[i]);
      }
    }
    return;
  }

  setFinance(title: any, find: Finance, value: string) {
    const obj = [
      { title: '매출액', key: 'fullRevenue' },
      { title: '영업이익', key: 'operatingProfit' },
      { title: '당기순이익', key: 'netIncome' },
      { title: '영업이익률', key: 'operatingProfitMargin' },
      { title: '순이익률', key: 'netProfitMargin' },
      { title: 'ROE', key: 'roe' },
      { title: 'EPS', key: 'eps' },
      { title: 'PER', key: 'per' },
      { title: 'BPS', key: 'bps' },
      { title: 'PBR', key: 'pbr' },
      { title: '주당배당금', key: 'dividendPerShare' },
    ];
    const key = obj.filter(v => v.title === title)[0];
    if (!!key && ['-', '_'].indexOf(value) == -1) {
      find[key.key] = +value.replace(/,/g, '');
    }
    return find;
  }

  async searchFinance(dto: PaginationSearchDto): Promise<Pagination<Finance>> {
    const options = { page: dto.page, limit: dto.limit };
    const query = this.financeRepo.createQueryBuilder('finance')
      .leftJoinAndSelect('finance.corp', 'corp');
    return await paginate<Finance>(query, options);
  }

  async searchCorp(dto: PaginationSearchDto): Promise<Pagination<Corp>> {
    const options = { page: dto.page, limit: dto.limit };
    const query = this.corpRepo.createQueryBuilder('corp')
      .leftJoinAndSelect('corp.finances', 'finances')
    return await paginate<Corp>(query, options);
  }
}