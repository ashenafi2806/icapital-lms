import { Field, InputType, ID, Int } from '@nestjs/graphql';
import { IsArray, IsInt, IsUUID, Min } from 'class-validator';

@InputType()
export class SubmitExamInput {
  @Field(() => ID)
  @IsUUID()
  examId!: string;

  @Field(() => [Int])
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  answers!: number[];
}
