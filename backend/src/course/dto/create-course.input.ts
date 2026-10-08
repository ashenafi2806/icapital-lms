import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class CreateCourseInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  stepOrder!: number;
}
