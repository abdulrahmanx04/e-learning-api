import { Courses } from "src/courses/entities/course.entity";
import { LessonProgress } from "src/progress/entities/progress.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export enum LessonType {
    VIDEO= 'video',
    TEXT= 'text',
    QUIZ= 'quiz',
    ASSIGNMENT= 'assignment'
}
@Entity('lessons')
@Index(['courseId','isPublished'])
export class Lessons {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column({type: 'text', nullable: true})
    description: string


    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({type: 'enum', enum: LessonType, default: LessonType.VIDEO })
    lessonType: LessonType


    @Column({type: 'int', default: 0})
    order: number

    @Column({type: 'int',default: 0})
    duration: number

    @Column({ type: 'int', default: 0 })
    completionCount: number


    @Column({ default: false })
    isPublished: boolean;

    @Column({ default: false })
    isFree: boolean;


    @Column({type: 'jsonb',nullable: true})
    videos: Array<{
        url: string
        fileName: string
        publicId: string;
        size: number;
    }>

    @Column({type: 'jsonb', nullable: true})
    materials: Array<{
        url: string,
        fileName: string,
        publicId: string,
        size: number
    }>

    @ManyToOne(() => Courses, courses => courses.lessons, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'courseId'})
    course: Courses

    @Column()
    courseId: string

    @OneToMany(() => LessonProgress, progress => progress.lesson)
    lessonProgress: LessonProgress[]
    
    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    
  


}
