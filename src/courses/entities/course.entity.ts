import { Users } from "src/auth/entities/auth.entity";
import { Enrollments } from "src/enrollment/entities/enrollment.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum CourseLevels {
    BEGINNER= 'beginner',
    INTERMEDIATE= 'intermediate',
    ADVANCED= 'advanced'
}


export enum CourseCategory {
  PROGRAMMING = 'programming',
  DESIGN = 'design',
  MARKETING = 'marketing',
  BUSINESS = 'business',
  OTHER = 'other',
}

@Entity('courses')
@Index(['isPublished','createdAt'])
@Index(['isPublished','price'])
@Index(['isPublished','category'])
@Index(['isPublished','level'])
export class Courses {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column()
    description: string

    @Column({type: 'enum', enum: CourseCategory, default: CourseCategory.OTHER})
    category: CourseCategory
    
    @Column({type: 'enum',enum: CourseLevels, default: CourseLevels.BEGINNER})
    level: CourseLevels
    
    @Column({type: 'int', nullable: true})
    duration: number; 

    @Column({type: 'decimal', precision: 3, scale: 2, default: 0})
    rating: number;

    @Column({default: false})
    isPublished: boolean

    @Column('decimal',{precision: 10, scale: 2})
    price: number
    
    @Column({type: 'int', default: 0})
    enrollmentCount: number;

    @ManyToOne(() => Users, user => user.courses)
    @JoinColumn({name: 'userId'})
    teacher: Users


    @OneToMany(() => Enrollments, enrollment => enrollment.course)
    enrollments: Enrollments[]


    @Column({type: 'varchar', nullable: true})
    thumbnailUrl: string

    @Column({type: 'varchar', nullable: true})
    thumbnailPublicId: string

    @Column({type: 'jsonb', nullable: true})
    materials: Array<{
        url: string,
        fileName: string,
        publicId: string,
        size: number
    }>

    @CreateDateColumn()
    createdAt: Date
    

    @UpdateDateColumn()
    updatedAt: Date
}

