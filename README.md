# 서비스
- 서비스 링크 💁🏻‍♀️ [**https://m.site.naver.com/1och2**](https://m.site.naver.com/1och2)
<img src="/screenshot/main.png" width="100%" />

# 개요
- 기업의 재무와 주식 정보를 직관적이고 명료한 UI로 제공하는 서비스를 구축합니다.
- 추천을 위해 다양한 관심사 또는 테마 별로 필터링을 하여 정보를 제공합니다.
- AI를 활용하여 주식 시장 요약과 기업 별 성장성/안정성/수익성 등을 분석합니다.
- AI에게 채팅으로 주식에 관련된 모든 것을 질문합니다.

# 종목 정보 수집 방법
- 국내 상장 기업(코스피, 코스닥)은 한국거래소에서 제공하는 목록을 가져옵니다. (http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020506)
    
    | 항목 | key |
    | --- | --- |
    | 기업명 | name |
    | 상장코드 | code |
    | 주식시장 | market |
    | 산업분류 | industry |
- 기업의 재무 정보는 네이버페이 증권 서비스에서 적절한 쿼리를 사용해 가져옵니다. (https://m.stock.naver.com/api/stock/기업상장코드/finance/annual)
    
    | 항목 | key |
    | --- | --- |
    | 기업로고 | logo |
    | 매출액 | fullRevenue |
    | 영업이익 | operatingProfit |
    | 당기순이익 | netIncome |
    | 영업이익률 | operatingProfitMargin |
    | 순이익률 | netProfitMargin |
    | ROE | roe |
    | EPS | eps |
    | PER | per |
    | BPS | bps |
    | PBR | pbr |
    | 주당배당금 | dividendPerShare |
    | 부채비율 | debtToEquityRatio |
    | 당좌비율 | quickRatio |
    | 유보율 | reserveRatio |
- 기업의 연속성 재무 정보는 별도로 계산하여 입력합니다.
    
    | 항목 | key |
    | --- | --- |
    | 연평균 매출액 증감률 | revenuePerYearIncreaseRatio |
    | 연평균 순이익 증감률 | netProfitPerYearIncreaseRatio |
    | 영업이익 증감률 | operatingProfitIncreaseRatio |
    | 순이익 증감률 | netProfitIncreaseRatio |
    | 순이익 연속증가 | continuousIncreaseNetProfit |
    | 영업이익 연속증가 | continuousIncreaseOperatingProfit |
    | 배당 연속증가 | continuousincreaseDividends |

# AI 기능 구현
- Google Gemini API를 활용하여 Stock AI 기능을 구현합니다.
    - [https://ai.google.dev/gemini-api](https://ai.google.dev/gemini-api)
- 구현 모델은 ‘gemini-1.5-pro’을 사용하며 코드 및 텍스트 생성, 텍스트 편집, 문제 해결, 데이터 추출 및 생성과 같은 복잡한 추론 작업이 가능합니다.
- 프롬프트 엔지니어링을 통해 적절한 답변 응답

# 구현 기술
- 배포 및 호스팅: Docker, AWS ECS / Fargate / EC2 ubuntu 24.04
- 데이터베이스: AWS RDS, Mysql 10.11.6
- 백엔드: NestJS 7.5.1, Typescript 4.0.5
- 프론트엔드: Angular 18.0.2, Typescript 5.4.5, ngx-socket-io 4.7.0
- AI API: Gemini API gemini-1.5-pro
- 도커라이징 및 AWS 프로비저닝 내용 정리:  [**블로그 바로가기**](https://medium.com/frontend-developers/aws-%ED%94%84%EB%A1%9C%EB%B9%84%EC%A0%80%EB%8B%9D%EC%9D%84-%ED%86%B5%ED%95%9C-%EC%A6%9D%EA%B6%8C-%EC%84%9C%EB%B9%84%EC%8A%A4-%EA%B5%AC%EC%B6%95-01-c5160c4a5c55)


# 서비스 바로가기
- 서비스 링크 💁🏻‍♀️ [**https://m.site.naver.com/1och2**](https://m.site.naver.com/1och2)
