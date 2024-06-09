const { GoogleGenerativeAI } = require("@google/generative-ai");
const xlsx = require('xlsx');
import { HttpService, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { CorpSearchDto, PaginationSearchDto } from './dto';
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
    for (let i = 0; i < corps.length; i++) {
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

  async updateAllFinance() {
    try {
      const corps = await this.corpRepo.createQueryBuilder('corp')
        .leftJoinAndSelect('corp.finances', 'finances')
        .getMany();
      for (let i = 0; i < corps.length; i++) {
        const finances = corps[i].finances;
        const finance1 = finances.filter(v => v.year == 202112)[0];
        const finance2 = finances.filter(v => v.year == 202212)[0];
        const finance3 = finances.filter(v => v.year == 202312)[0];
        if (finance1 && finance2 && finance3) {
          const fullRevenue1 = finance1.fullRevenue;
          const fullRevenue2 = finance2.fullRevenue;
          const fullRevenue3 = finance3.fullRevenue;
          if (fullRevenue1 && fullRevenue2) {
            finance2.revenuePerYearIncreaseRatio = +((fullRevenue2 - Math.abs(fullRevenue1)) / Math.abs(fullRevenue1) * 100).toFixed(2);
            if (fullRevenue3) {
              finance3.revenuePerYearIncreaseRatio = +((finance2.revenuePerYearIncreaseRatio + +((fullRevenue3 - Math.abs(fullRevenue2)) / Math.abs(fullRevenue2) * 100).toFixed(2)) / 2).toFixed(2);
            }
          }

          const netProfit1 = finance1.netIncome;
          const netProfit2 = finance2.netIncome;
          const netProfit3 = finance3.netIncome;
          if (netProfit1 && netProfit2) {
            finance2.netProfitPerYearIncreaseRatio = +((netProfit2 - Math.abs(netProfit1)) / Math.abs(netProfit1) * 100).toFixed(2);
            finance2.netProfitIncreaseRatio = +((netProfit2 - Math.abs(netProfit1)) / Math.abs(netProfit1) * 100).toFixed(2);
            finance2.continuousIncreaseNetProfit = netProfit1 < netProfit2 ? 1 : 0;
            if (netProfit3) {
              finance3.netProfitPerYearIncreaseRatio = +((finance2.netProfitPerYearIncreaseRatio + +((netProfit3 - Math.abs(netProfit2)) / Math.abs(netProfit2) * 100).toFixed(2)) / 2).toFixed(2);
              finance3.netProfitIncreaseRatio = +((netProfit3 - Math.abs(netProfit2)) / Math.abs(netProfit2) * 100).toFixed(2);
              finance3.continuousIncreaseNetProfit = netProfit2 < netProfit3 ? finance2.continuousIncreaseNetProfit + 1 : finance2.continuousIncreaseNetProfit;
            }
          }

          const operatingProfit1 = finance1.operatingProfit;
          const operatingProfit2 = finance2.operatingProfit;
          const operatingProfit3 = finance3.operatingProfit;
          if (operatingProfit1 && operatingProfit2) {
            finance2.operatingProfitIncreaseRatio = +((operatingProfit2 - Math.abs(operatingProfit1)) / Math.abs(operatingProfit1) * 100).toFixed(2);
            finance2.continuousIncreaseOperatingProfit = operatingProfit1 < operatingProfit2 ? 1 : 0;
            if (operatingProfit3) {
              finance3.operatingProfitIncreaseRatio = +((operatingProfit3 - Math.abs(operatingProfit2)) / Math.abs(operatingProfit2) * 100).toFixed(2);
              finance3.continuousIncreaseOperatingProfit = operatingProfit2 < operatingProfit3 ? finance2.continuousIncreaseOperatingProfit + 1 : finance2.continuousIncreaseOperatingProfit;
            }
          }

          const dividendPerShare1 = finance1.dividendPerShare;
          const dividendPerShare2 = finance2.dividendPerShare;
          const dividendPerShare3 = finance3.dividendPerShare;
          if (dividendPerShare1 && dividendPerShare1) {
            finance2.continuousincreaseDividends = dividendPerShare1 < operatingProfit2 ? 1 : 0;
            if (dividendPerShare3) {
              finance3.continuousincreaseDividends = dividendPerShare2 < dividendPerShare3 ? finance2.continuousincreaseDividends + 1 : finance2.continuousincreaseDividends;
            }
          }
          await this.financeRepo.update(finance2.id, finance2);
          await this.financeRepo.update(finance3.id, finance3);
        }
      }
    } catch (e) {
      console.log(e)
    }
    return;
  }

  async searchFinance(dto: PaginationSearchDto): Promise<Pagination<Finance>> {
    const options = { page: dto.page, limit: dto.limit };
    const query = this.financeRepo.createQueryBuilder('finance')
      .leftJoinAndSelect('finance.corp', 'corp');
    return await paginate<Finance>(query, options);
  }

  async findCorp(term: string): Promise<Corp[]> {
    return await this.corpRepo.createQueryBuilder('corp')
      .where(`corp.name like "%${term}%"`)
      .orWhere(`corp.code like "%${term}%"`)
      .getMany();
  }

  async searchCorp(dto: CorpSearchDto): Promise<Corp[]> {
    const query = this.corpRepo.createQueryBuilder('corp')
      .leftJoinAndSelect('corp.finances', 'finances')
      .where('finances.year = :year', { year: 202312 })
    if (dto.revenuePerYearIncreaseRatio) {
      query.andWhere('finances.revenuePerYearIncreaseRatio >= :revenuePerYearIncreaseRatio', { revenuePerYearIncreaseRatio: dto.revenuePerYearIncreaseRatio })
    }
    if (dto.netProfitPerYearIncreaseRatio) {
      query.andWhere('finances.netProfitPerYearIncreaseRatio >= :netProfitPerYearIncreaseRatio', { netProfitPerYearIncreaseRatio: dto.netProfitPerYearIncreaseRatio })
    }
    if (dto.per) {
      query.andWhere('finances.per <= :per', { per: dto.per })
    }
    if (dto.netProfitIncreaseRatio) {
      query.andWhere('finances.netProfitIncreaseRatio >= :netProfitIncreaseRatio', { netProfitIncreaseRatio: dto.netProfitIncreaseRatio })
    }
    if (dto.continuousIncreaseNetProfit) {
      query.andWhere('finances.continuousIncreaseNetProfit >= :continuousIncreaseNetProfit', { continuousIncreaseNetProfit: dto.continuousIncreaseNetProfit })
    }
    if (dto.roe) {
      query.andWhere('finances.roe >= :roe', { roe: dto.roe })
    }
    if (dto.continuousIncreaseOperatingProfit) {
      query.andWhere('finances.continuousIncreaseOperatingProfit >= :continuousIncreaseOperatingProfit', { continuousIncreaseOperatingProfit: dto.continuousIncreaseOperatingProfit })
    }
    if (dto.operatingProfitIncreaseRatio) {
      query.andWhere('finances.operatingProfitIncreaseRatio >= :operatingProfitIncreaseRatio', { operatingProfitIncreaseRatio: dto.operatingProfitIncreaseRatio })
    }
    if (dto.pbr) {
      query.andWhere('finances.pbr <= :pbr', { pbr: dto.pbr })
    }
    if (dto.continuousincreaseDividends) {
      query.andWhere('finances.continuousincreaseDividends >= :continuousincreaseDividends', { continuousincreaseDividends: dto.continuousincreaseDividends })
    }
    return await query.getMany();
  }

  async summaryCorp(corpName: string): Promise<{ response: string }> {
    try {
      const genAI = new GoogleGenerativeAI(this.config.get('GEMINI_API_KEY'));
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `주식을 잘 모르는 초보에게 설명한다고 했을 때, 한국 상장 기업인 "${corpName}" 기업 분석을 답변만 적어서 요약해줘. 답변 형식은 마크다운 문법이나 문자 없이 일반 글자로만 답변 해주고 구어체 존댓말로 답변 해줘.`
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return { response: text };
    } catch (e) {
      throw new InternalServerErrorException('주식 시장 요약 오류', e.message)
    }
  }

  async summaryMarket(): Promise<{ response: string }> {
    try {
      const genAI = new GoogleGenerativeAI(this.config.get('GEMINI_API_KEY'));
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompts = [
        `주식 초보에게 설명한다고 했을 때, 요즘 코스닥과 코스피 시장의 전반적인 상황을 10줄 이내로 짧게 답변만 적어서 요약. 답변 형태는 서술식 구어체 존댓말이고 특수문자를 사용하지 않고 일반 글자로만. '응'이라고 말하지 말아줘.`,
        `주식 초보에게 설명한다고 했을 때, 요즘 코스닥과 코스피 시장의 주요 업종 및 종목 이슈의 전반적인 상황을 10줄 이내로 짧게 답변만 적어서 요약. 답변 형태는 서술식 구어체 존댓말이고 특수문자를 사용하지 않고 일반 글자로만. '응'이라고 말하지 말아줘.`
      ]
      const prompt = prompts[Math.floor(Math.random() * (2 - 1 + 1))]
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return { response: text };
    } catch (e) {
      throw new InternalServerErrorException('주식 시장 요약 오류', e.message)
    }
  }

  async getCorp(code: string): Promise<Corp> {
    return await this.corpRepo.createQueryBuilder('corp')
      .leftJoinAndSelect('corp.finances', 'finances')
      .where('corp.code = :code', { code })
      .getOne()
  }
}