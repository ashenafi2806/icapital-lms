import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type.js';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  @Field(() => UserType)
  user!: UserType;
}
