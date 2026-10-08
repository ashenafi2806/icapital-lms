import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@ObjectType()
export class StudentType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field(() => Role)
  role!: Role;

  @Field()
  createdAt!: Date;

  @Field(() => [StudentProgressType])
  progress!: StudentProgressType[];

  @Field(() => Int)
  passedCourseCount!: number;

  @Field(() => Int)
  totalCourseCount!: number;
}

@ObjectType()
export class StudentProgressType {
  @Field()
  courseTitle!: string;

  @Field()
  status!: string;

  @Field()
  isPassed!: boolean;

  @Field(() => Float, { nullable: true })
  bestScore!: number | null;

  @Field(() => Int)
  attempts!: number;
}
