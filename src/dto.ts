import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class PaginationSearchDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit: number;
}

export class CorpSearchDto extends PaginationSearchDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    revenuePerYearIncreaseRatio: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    netProfitPerYearIncreaseRatio: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    per: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    netProfitIncreaseRatio: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    continuousIncreaseNetProfit: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    roe: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    continuousIncreaseOperatingProfit: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    operatingProfitIncreaseRatio: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pbr: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    continuousincreaseDividends: number;
}