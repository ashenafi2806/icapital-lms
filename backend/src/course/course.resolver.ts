import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CourseService } from './course.service.js';
import { CourseDetailType } from './dto/course-detail.type.js';
import { CourseType } from './dto/course.type.js';
import { CreateCourseInput } from './dto/create-course.input.js';

@Resolver(() => CourseType)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation(() => CourseType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createCourse(
    @Args('input') input: CreateCourseInput,
  ): Promise<CourseType> {
    return this.courseService.create(input);
  }

  @Query(() => [CourseType])
  @UseGuards(JwtAuthGuard)
  getCourses(@CurrentUser() _user: { sub: string }): Promise<CourseType[]> {
    return this.courseService.findAll();
  }

  @Query(() => CourseDetailType)
  @UseGuards(JwtAuthGuard)
  getCourse(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() _user: { sub: string },
  ): Promise<CourseDetailType> {
    return this.courseService.findById(id);
  }
}
