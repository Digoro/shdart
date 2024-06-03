import { BaseEntity, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class BasicEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp', })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', })
    updatedAt: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date;
    }
}

@Entity({ name: 'corp' })
export class Corp extends BasicEntity {
    @PrimaryColumn()
    code: string;

    @Column()
    name: string;

    @Column()
    market: string;

    @Column()
    industry: string;

    @OneToMany(() => Finance, entity => entity.corp)
    finances: Finance[];
}

@Entity({ name: 'finance' })
export class Finance extends BasicEntity {
    @ManyToOne(() => Corp, entity => entity.finances)
    @JoinColumn()
    corp: Corp;

    @Column()
    year: number;

    @Column({ nullable: true, type: 'double', comment: '매출액' })
    fullRevenue: number;

    @Column({ nullable: true, type: 'double', comment: '영업이익' })
    operatingProfit: number;

    @Column({ nullable: true, type: 'double', comment: '당기순이익' })
    netIncome: number;

    @Column({ nullable: true, type: 'double', comment: '영업이익률' })
    operatingProfitMargin: number;

    @Column({ nullable: true, type: 'double', comment: '순이익률' })
    netProfitMargin: number;

    @Column({ nullable: true, type: 'double', comment: 'ROE' })
    roe: number;

    @Column({ nullable: true, type: 'double', comment: 'EPS' })
    eps: number;

    @Column({ nullable: true, type: 'double', comment: 'PER' })
    per: number;

    @Column({ nullable: true, type: 'double', comment: 'BPS' })
    bps: number;

    @Column({ nullable: true, type: 'double', comment: 'PBR' })
    pbr: number;

    @Column({ nullable: true, type: 'double', comment: '주당배당금' })
    dividendPerShare: number;

    @Column({ nullable: true, type: 'double', comment: '연평균 매출액 증감률' })
    revenuePerYearIncreaseRatio: number;

    @Column({ nullable: true, type: 'double', comment: '연평균 순이익 증감률' })
    netProfitPerYearIncreaseRatio: number;

    @Column({ nullable: true, type: 'double', comment: '영업이익 증감률' })
    operatingProfitIncreaseRatio: number;

    @Column({ nullable: true, type: 'double', comment: '순이익 증감률' })
    netProfitIncreaseRatio: number;

    @Column({ nullable: true, type: 'double', comment: '순이익 연속증가' })
    continuousIncreaseNetProfit: number;

    @Column({ nullable: true, type: 'double', comment: '영업이익 연속증가' })
    continuousIncreaseOperatingProfit: number;

    @Column({ nullable: true, type: 'double', comment: '배당 연속증가' })
    continuousincreaseDividends: number;
}