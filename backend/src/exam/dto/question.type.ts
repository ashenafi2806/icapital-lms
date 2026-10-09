import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QuestionType {
  @Field()
  text!: string;

  @Field(() => [String])
  options!: string[];

}
