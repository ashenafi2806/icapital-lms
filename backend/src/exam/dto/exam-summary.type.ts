import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExamSummaryType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field(() => Float)
  passingThreshold!: number;

  @Field(() => Int)
  questionCount!: number;
}
