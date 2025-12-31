import { Users } from "src/auth/entities/auth.entity";
import { Courses } from "src/courses/entities/course.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('enrollments')
export class Enrollments {

    @PrimaryGeneratedColumn('uuid')
    id: string


   @ManyToOne(() => Users, user => user.enrollments)
   @JoinColumn({name: 'userId'})
   user: Users



   @ManyToOne(() => Courses, course => course.enrollments)
   @JoinColumn({name: 'courseId'})
   course: Courses



   @CreateDateColumn()
   createdAt: Date

   @UpdateDateColumn()
   updatedAt: Date




}
