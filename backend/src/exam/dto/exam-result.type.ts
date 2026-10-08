import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExamResultType {
  @Field(() => Float)
  score!: number;

  @Field()
  isPassed!: boolean;
}
