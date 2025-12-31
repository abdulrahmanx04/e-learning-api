import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import bcrypt from 'bcrypt'
import { Enrollments } from "src/enrollment/entities/enrollment.entity";
import { Courses } from "src/courses/entities/course.entity";


export enum Role {
    STUDENT= 'student',
    TEACHER= 'teacher',
    ADMIN= 'admin'
}
@Entity('users')
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({length: 30})
    name: string

    @Column({unique: true})
    email: string

    @Column()
    password: string
    @BeforeInsert()
    async hashPass () {
        this.password= await bcrypt.hash(this.password, 10)
    }

    @Column({type: 'enum',enum: Role,default: Role.STUDENT})
    role: Role


    @Column({default: false})
    isActive: boolean

    @Column({type: 'varchar', nullable: true})
    avatar: string | null

    @Column({type: 'varchar', nullable: true})
    avatarPublicId: string

    @Column({type: 'varchar', nullable: true})
    resetPasswordToken: string | null

    @Column({type: 'timestamp', nullable: true})
    resetPasswordExpiry: Date | null


    @Column({type: 'varchar',nullable: true})
    verificationToken: string | null

    @Column({type: 'timestamp', nullable: true})
    verificationTokenExpiry: Date | null
    
    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToMany(() => Enrollments, enrollment => enrollment.user)
    enrollments: Enrollments[]

    @OneToMany(() => Courses, course => course.teacher)
    courses: Courses[]


}
