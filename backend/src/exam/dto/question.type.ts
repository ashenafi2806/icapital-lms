import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QuestionType {
  @Field()
  text!: string;

  @Field(() => [String])
  options!: string[];

  @Field(() => Int)
  correctIndex!: number;
}
