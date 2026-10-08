import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCourseInput } from './dto/create-course.input.js';
import { CourseType } from './dto/course.type.js';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateCourseInput): Promise<CourseType> {
    return this.prisma.course.create({
      data: input,
    });
  }

  findAll(): Promise<CourseType[]> {
    return this.prisma.course.findMany({
      orderBy: { stepOrder: 'asc' },
    });
  }
}
