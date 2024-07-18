import { HttpService, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Pagination, paginate } from 'nestjs-typeorm-paginate'
import OpenAI from 'openai'
import { Repository } from 'typeorm'
import { CorpSearchDto, MessageDto, PaginationSearchDto } from './dto'
import { Corp, Finance } from './entity'
const { GoogleGenerativeAI } = require("@google/generative-ai");
const xlsx = require('xlsx');

@Injectable()
export class AppService {
  gemini: any;
  openai: any;

  constructor(
    private config: ConfigService,
    @InjectRepository(Corp) private corpRepo: Repository<Corp>,
    @InjectRepository(Finance) private financeRepo: Repository<Finance>,
    private http: HttpService
  ) {
    this.gemini = new GoogleGenerativeAI(this.config.get('GEMINI_API_KEY')).getGenerativeModel({ model: "gemini-1.5-flash" });
    this.openai = new OpenAI({ apiKey: this.config.get("OPENAI_API_KEY") });
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
      { title: '부채비율', key: 'debtToEquityRatio' },
      { title: '당좌비율', key: 'quickRatio' },
      { title: '유보율', key: 'reserveRatio' },
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
      return;
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

  async getCorpByCode(code: string): Promise<Corp> {
    return await this.corpRepo.createQueryBuilder('corp')
      .leftJoinAndSelect('corp.finances', 'finances')
      .where('corp.code = :code', { code })
      .getOne()
  }

  async getCorpByName(name: string): Promise<Corp> {
    return await this.corpRepo.createQueryBuilder('corp')
      .leftJoinAndSelect('corp.finances', 'finances')
      .where('corp.name = :name', { name })
      .getOne()
  }

  async summaryMarket() {
    try {
      console.count('summaryMarket fun call!')
      const prompt = `주식 초보에게 설명한다고 했을 때, 요즘 국내 주가 시장과 주요 업종 및 종목 이슈의 상황을 20줄 정도로 답변만 적어서 요약해주세요.
        '응'이라고 말하지 말아주세요. 답변 형식은 마크다운 문법 해주는데 '#', '##', '###', '####'과 같은 문법은 빼주세요.
        답변은 구어체 존댓말로 해주고, 답변에 이모지도 2개 미만으로 섞어주세요.`;
      const result = await this.gemini.generateContentStream([prompt]);
      return result;
      // const prompt = `주식 초보에게 설명한다고 했을 때, 요즘 국내 주가 시장과 주요 업종 및 종목 이슈의 상황을 10줄 내로 요약해서 알려주세요. 
      // '알겠습니다'와 같은 대답은 빼주고 답변 형식은 마크다운 형식으로 하이라이팅을 해주는데 '#', '##', '###', '####'과 같은 문법은 빼주세요. 답변은 구어체 존댓말로 해주고, 답변에 이모지도 2개 미만으로 섞어주세요.`
      // const resFromGpt = await this.openai.chat.completions.create({
      //   model: 'gpt-4o',
      //   stream: true,
      //   messages: [{ role: 'user', content: prompt }],
      // });
      // return resFromGpt;
    } catch (e) {
      console.log(e.message)
      throw new InternalServerErrorException('주식 시장 요약 오류', e.message)
    }
  }

  async summaryCorp(corpName: string) {
    console.count('summaryMarket fun call!')
    try {
      const corp = await this.getCorpByName(corpName);
      const prompt = `주식을 잘 모르는 초보에게 설명한다고 했을 때, 한국 상장 기업인 "${corpName}" 기업에 대해 짧게 소개해주고 재무 분석을 해서 답변만 적어서 요약해주세요.
      기업의 2021~2023년 재무재표는 다음과 같아요.
      ${JSON.stringify(corp.finances
        .filter(v => v.year != 202412).map(v => {
          delete v.id;
          delete v.createdAt;
          delete v.updatedAt;
          return v;
        }))}
      기업의 재무재표 숫자를 기반으로 성장성, 안정성, 수익성을 나눠서 분석하여 요약해주고, 앞으로 투자할만한지도 알려주세요.
      답변 형식은 마크다운 문법 해주는데 '#', '##', '###', '####'과 같은 문법은 빼주세요. 답변은 구어체 존댓말로 해주고, 답변에 이모지도 2개 미만으로 섞어주세요.`
      const result = await this.gemini.generateContentStream(prompt);
      return result;
    } catch (e) {
      console.log(e.message)
      throw new InternalServerErrorException('주식 종목 분석 오류', e.message)
    }
  }

  async getAnswerMessage(dto: MessageDto) {
    try {
      dto.messageList.unshift({
        role: 'user', parts: [{
          text: `앞으로 질문은 주식, 증권, 종목 등과 관련된 내용만 답변해야해요. 주식을 잘 모르는 초보에게 설명한다고 한다고 생각해주세요.
        답변 형식은 마크다운 문법 해주는데 '#', '##', '###', '####'과 같은 문법은 빼주세요. 답변은 구어체 존댓말로 해주고, 답변에 이모지도 2개 미만으로 섞어주세요.` }]
      })
      const lastMessage = dto.messageList[dto.messageList.length - 1];
      dto.messageList.pop();
      const chat = this.gemini.startChat({
        history: dto.messageList,
      });
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      const response = await result.response;
      return response.text();
    } catch (e) {
      throw new InternalServerErrorException('채팅 답변 오류', e.message)
    }
  }

  async getWelcomeQuestions() {
    try {
      const prompt = `주식 AI 채팅 기능이에요. 주식 초보를 대상으로 국내 주요 종목 이슈, 주식 시장 이슈와 관련된 1줄 이하 질문 3개를 알려주세요.
      답변 형태는 무조건 json array format으로 해주는데 배열 string만 답변해주세요. 답변은 구어체 존댓말로 해주세요.
      예를 들어 ["질문 1", "질문 2", "질문 3"] 이런 형태에요.`
      const result = await this.gemini.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (e) {
      throw new InternalServerErrorException('웰컴 질문 오류', e.message)
    }
  }

  async getRealtionQuestions(dto: MessageDto) {
    try {
      const chat = this.gemini.startChat({
        history: dto.messageList,
      });
      const result = await chat.sendMessage(`위 질문에서 주식, 증권, 종목 등과 관련된 추천할만한 관련된 질문 3개를 알려주세요. 답변 형태는 무조건 json array format으로 해주는데 배열 string만 답변해주세요.
        예를 들어 ["질문 1", "질문 2", "질문 3"] 이런 형태에요.`);
      const response = await result.response;
      return response.text();
      // const resFromGpt = await this.openai.chat.completions.create({
      //   model: 'gpt-3.5-turbo',
      //   messages: [
      //     ...dto.messageList.map(v => {
      //       return {
      //         role: v.role == 'model' ? 'system' : 'user',
      //         content: v.parts[0].text
      //       }
      //     }),
      //     {
      //       role: 'user',
      //       content: `위 질문에서 주식, 증권, 종목 등과 관련된 추천할만한 관련된 질문 3개를 알려주세요. 답변 형태는 무조건 json array format으로 해주는데 배열 string만 답변해주세요. 
      //       예를 들어 ["질문 1", "질문 2", "질문 3"] 이런 형태에요.`,
      //     }],
      // });
      // return resFromGpt.choices[0].message.content;
    } catch (e) {
      throw new InternalServerErrorException('채팅 답변 오류', e.message)
    }
  }
}