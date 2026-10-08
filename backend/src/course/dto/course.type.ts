import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ExamSummaryType } from '../../exam/dto/exam-summary.type.js';

@ObjectType()
export class CourseType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => Int)
  stepOrder!: number;

  @Field(() => Int)
  examsCount!: number;

  @Field(() => [ExamSummaryType])
  exams!: ExamSummaryType[];
}
