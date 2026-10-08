import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ExamService } from './exam.service.js';
import { CreateExamInput } from './dto/create-exam.input.js';
import { ExamResultType } from './dto/exam-result.type.js';
import { ExamType } from './dto/exam.type.js';
import { SubmitExamInput } from './dto/submit-exam.input.js';

@Resolver(() => ExamType)
export class ExamResolver {
  constructor(private readonly examService: ExamService) {}

  @Mutation(() => ExamType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createExam(@Args('input') input: CreateExamInput): Promise<ExamType> {
    return this.examService.create(input);
  }

  @Mutation(() => ExamResultType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  submitExam(
    @Args('input') input: SubmitExamInput,
    @CurrentUser() user: { sub: string },
  ): Promise<ExamResultType> {
    return this.examService.submit(input, user.sub);
  }
}
