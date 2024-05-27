import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Repository, getConnection } from 'typeorm';
import { parseStringPromise } from 'xml2js';
import { Corp } from './corp';
import { PaginationSearchDto } from './dto';
const JSZip = require('jszip')

@Injectable()
export class CorpService {
  OPENDART_CRTFC_KEY: string;

  constructor(
    config: ConfigService,
    @InjectRepository(Corp) private repo: Repository<Corp>,
  ) {
    this.OPENDART_CRTFC_KEY = config.get('OPENDART_CRTFC_KEY')
  }

  async addAllStockCorp(): Promise<any> {
    const qr = await getConnection().createQueryRunner()
    try {
      await qr.startTransaction();
      const manager = qr.manager;
      const response = await axios.get(`https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${this.OPENDART_CRTFC_KEY}`, {
        responseType: 'arraybuffer',
      });
      const zip = await JSZip.loadAsync(response.data);
      const fileNames = Object.keys(zip.files);
      if (fileNames.length === 0) {
        throw new Error('압축 파일에 내용이 없습니다.');
      }
      const xmlData = await zip.file(fileNames[0]).async('string');
      const jsonData = (await parseStringPromise(xmlData, { explicitArray: false, ignoreAttrs: true })).result.list;
      for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].stock_code != ' ') {
          const corp = new Corp();
          corp.corp_code = jsonData[i].corp_code;
          corp.corp_name = jsonData[i].corp_name;
          corp.stock_code = jsonData[i].stock_code;
          corp.modify_date = jsonData[i].modify_date;
          await manager.save(Corp, corp);
        }
      }
      await qr.commitTransaction();
    } catch (error) {
      await qr.rollbackTransaction();
      throw new Error('API 응답 처리 중 오류가 발생했습니다.');
    } finally {
      await qr.release();
    }
  }

  async search(dto: PaginationSearchDto): Promise<Pagination<Corp>> {
    const options = { page: dto.page, limit: dto.limit };
    const query = this.repo.createQueryBuilder('');
    return await paginate<Corp>(query, options);
  }
}