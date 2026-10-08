import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ExamType } from '../../exam/dto/exam.type.js';

@ObjectType()
export class CourseDetailType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => Int)
  stepOrder!: number;

  @Field(() => [ExamType])
  exams!: ExamType[];
}
