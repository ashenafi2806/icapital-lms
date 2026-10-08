import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class QuestionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  text!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  options!: string[];

  @Field(() => Int)
  @IsInt()
  @Min(0)
  correctIndex!: number;
}
