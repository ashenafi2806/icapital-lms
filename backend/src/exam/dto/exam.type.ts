import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { QuestionType } from './question.type.js';

@ObjectType()
export class ExamType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  courseId!: string;

  @Field(() => Float)
  passingThreshold!: number;

  @Field(() => [QuestionType])
  questions!: QuestionType[];
}
