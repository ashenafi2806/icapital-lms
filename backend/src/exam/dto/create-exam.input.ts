import { Field, InputType, ID, Float } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { QuestionInput } from './question.input.js';

@InputType()
export class CreateExamInput {
  @Field()
  @IsNotEmpty()
  title!: string;

  @Field(() => ID)
  @IsUUID()
  courseId!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  passingThreshold!: number;

  @Field(() => [QuestionInput])
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  questions!: QuestionInput[];
}
