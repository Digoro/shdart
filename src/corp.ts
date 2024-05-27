import { BaseEntity, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class BasicEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date;
    }
}

@Entity({ name: 'corp' })
export class Corp extends BasicEntity {
    @Column()
    corp_code: string;

    @Column()
    corp_name: string;

    @Column()
    stock_code: string;

    @Column()
    modify_date: string;
}

export class Pagination {
    page: number;
    limit: number;
}