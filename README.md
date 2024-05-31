# 서비스 주소

https://m.site.naver.com/1och2
# 개요
- 기업의 재무와 주식 정보를 직관적이고 명료한 UI로 제공하는 서비스를 구축합니다.
- 추천을 위해 다양한 관심사 또는 테마 별로 필터링을 하여 정보를 제공합니다.

# 작업 순서

1. 매출액, 영업이익, 자본 등의 재무 정보는 최근 4분기를 기준으로 수집 및 저장한다.
2. 주가의 경우 최대 3일 이내의 종가 기준으로 수집 및 저장한다.
3. 행에는 기업정보를 열에는 재무정보 및 주요 KPI가 담긴 테이블을 생성한다.
4. 관심사 또는 테마를 정하고 각 기준을 세운다.
5. 페이지의 테이블과 카드 디자인을 하고 웹서비스를 구축한다.

# 수집 방법

- 기업의 재무정보는 OpenDart(전자공시 시스템)에서 제공하는 API를 이용한다.
    - [https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json?crtfc_key=API_KEY&corp_code=00126380&bsns_year=2023&reprt_code=11011&fs_div=CFS](https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json?crtfc_key=afb264eb0cf3b7d7272e06dfcbcf155664a8f947&corp_code=00126380&bsns_year=2023&reprt_code=11011&fs_div=CFS)
    - [https://opendart.fss.or.kr/api/stockTotqySttus.json?crtfc_key=API_KEY&corp_code=00126380&bsns_year=2023&reprt_code=11011](https://opendart.fss.or.kr/api/stockTotqySttus.json?crtfc_key=afb264eb0cf3b7d7272e06dfcbcf155664a8f947&corp_code=00126380&bsns_year=2023&reprt_code=11011)
- 주가의 경우 공공데이터포털의 금융위원회_주식시세정보 API를 이용한다.
    - [https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=API_KEY&numOfRows=1&pageNo=1&resultType=json&likeSrtnCd=005930](https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=xDicgDWBOlZ61l7JUYi5SJ1stuWXUolH7%2Fg3oe26l11RrxOHxT%2BR8%2F4Due2Pli67gIbg1w1pvCXG5qquuIj3Uw%3D%3D&numOfRows=1&pageNo=1&resultType=json&likeSrtnCd=005930)

| 번호 | 개발 가이드 | key | 이름 | 예시(삼성전자) |
| --- | --- | --- | --- | --- |
| 1 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_Revenue | 영업이익 | 6,566,976,000,000 |
| 2 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | dart_OtherGains | 기타이익 | 1,180,448,000,000 |
| 3 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | dart_OtherLosses | 기타손실 | 1,083,327,000,000 |
| 4 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | dart_TotalSellingGeneralAdministrativeExpenses | 판매비와관리비 | 71,979,938,000,000 |
| 5 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_CostOfSales | 매출원가 | 180,388,580,000,000 |
| 6 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_BasicEarningsLossPerShare | 기본주당이익(손실) | 2,131 |
| 7 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_FinanceCosts | 금융비용 | 12,645,530,000,000 |
| 8 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_FinanceIncome | 금융수익 | 16,100,148,000,000 |
| 9 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_GrossProfit | 매출총이익 | 78,546,914,000,000 |
| 10 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_IncomeTaxExpenseContinuingOperations | 법인세비용(수익) | -4,480,835,000,000 |
| 11 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_ProfitLoss | 당기순이익(손실) | 15,487,100,000,000 |
| 12 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_ProfitLossBeforeTax | 법인세비용차감전순이익(손실) | 11,006,265,000,000 |
| 13 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_ProfitLossFromContinuingOperations | 계속영업이익(손실) | 15,487,100,000,000 |
| 14 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_Revenue | 영업수익 | 258,935,494,000,000 |
| 15 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_ShareOfProfitLossOfAssociatesAndJointVenturesAccountedForUsingEquityMethod | 지분법이익 | 887,550,000,000 |
| 16 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020 | ifrs-full_Equity | 자본총계 | 363,677,865,000,000 |
| 17 | https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS002&apiId=2020002 | se | 보통주 | 5,969,782,550 |
| 18 | https://www.data.go.kr/data/15094808/openapi.do | clpr | 종가 | 78,300 |

| 구분 | 예시(삼성전자) | 계산법 | 기준 |
| --- | --- | --- | --- |
| 매출액 | 258,935,494,000,000 | 영업수익 | 최근 4개분기 기준 |
| 영업이익 | 6,566,976,000,000 | 영업이익 | 최근 4개분기 기준 |
| 당기순이익 | 15,487,100,000,000 | 당기순이익(손실) | 최근 4개분기 기준 |
| 영업이익률 | 2.536143616 | 영업이익/매출액*100 | 최근 4개분기 기준 |
| 순이익률 | 5.981064921 | 당기순이익/매출액*100 | 최근 4개분기 기준 |
| ROE | 4.258466487 | 당기순이익/자본총계*100 | 최근 4개분기 기준 |
| EPS | 2,131 | 기본주당이익(손실) | 최근 4개분기 기준 |
| PER | 37 | 주가/EPS, 시가총액(주가*보통주)/당기순이익 | 종가 기준 |
| PBR | 1.285296738 | 주가*보통주/자본총계 | 종가 기준 |

# 구현 기술

- 배포 및 호스팅: AWS EC2
- 데이터베이스: AWS RDS, Mysql
- 백엔드: NestJS, Typescript
- 프론트엔드: Angular, Typescript
