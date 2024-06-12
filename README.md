# 서비스

서비스 바로가기 👉👉 [**https://m.site.naver.com/1och2**](https://m.site.naver.com/1och2)

- 국내 시장 현황에 대해 Stock AI가 요약해줍니다.
    
    ![스크린샷 2024-06-12 오후 1.54.36.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/eb69efbc-204e-4fc7-8098-b5d75cbb9a16/37a22ff3-71dc-474c-ad15-cc8c05d7fc2a/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2024-06-12_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_1.54.36.png)
    
- 주식 모아보기를 통해 관심사 별 종목을 필터링 합니다
    
    ![스크린샷 2024-06-12 오후 1.54.40.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/eb69efbc-204e-4fc7-8098-b5d75cbb9a16/7aa8f712-06eb-470e-89b0-5c2f6e72dad2/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2024-06-12_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_1.54.40.png)
    
- 각 종목 별 개요와 재무정보(성장성, 안정성, 수익성) 요약을 제공합니다.
    
    ![스크린샷 2024-06-12 오후 1.56.07.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/eb69efbc-204e-4fc7-8098-b5d75cbb9a16/700b0de9-26b3-4f12-86ae-4303d41275ba/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2024-06-12_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_1.56.07.png)
    

# 개요

- 기업의 재무와 주식 정보를 직관적이고 명료한 UI로 제공하는 서비스를 구축합니다.
- 추천을 위해 다양한 관심사 또는 테마 별로 필터링을 하여 정보를 제공합니다.
- AI를 활용하여 주식 시장 요약과 기업 별 성장성/안정성/수익성 등을 분석합니다.

# 수집 방법

- 국내 상장 기업(코스피, 코스닥)은 한국거래소에서 제공하는 목록을 가져옵니다.
    - 링크: http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020506
    - 항목: 기업명 / 상장 코드 / 주식 시장 / 산업분류
- 기업의 재무 정보는 네이버페이 증권 서비스에서 적절한 쿼리를 사용해 가져옵니다.
    - 링크: [https://m.stock.naver.com/api/stock/기업상장코드/finance/annual](https://m.stock.naver.com/api/stock/005930/finance/annual)
    - 항목: 기업 로고 / 매출액 / 영업이익 / 당기순이익 / 영업이익률 / 순이익률 / ROE / EPS / BPS / PER / 주당 배당금 / 부채비율 / 당좌비율 / 유보율
- 기업의 연속성 재무 정보는 별도로 계산하여 입력합니다.
    - 항목: 연평균 매출액 증감률 / 연평균 순이익 증감률 / 영업이익 증감률 / 순이익 증감률 / 순이익 연속증가 / 영업이익 연속증가 / 배당 연속증가

# AI 활용

- Google Gemini API를 활용하여 Stock AI 기능을 구현합니다.
    - [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs?hl=ko)
- 구현 모델은 ‘gemini-1.5-pro’을 사용하며 코드 및 텍스트 생성, 텍스트 편집, 문제 해결, 데이터 추출 및 생성과 같은 복잡한 추론 작업이 가능합니다.

# 구현 기술

- 배포 및 호스팅: AWS EC2
- 데이터베이스: AWS RDS, Mysql
- 백엔드: NestJS, Typescript
- 프론트엔드: Angular, Typescript
- AI API: Gemini API, gemini-1.5-pro

서비스 바로가기 👉👉 [**https://m.site.naver.com/1och2**](https://m.site.naver.com/1och2)
