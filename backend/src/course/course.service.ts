import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCourseInput } from './dto/create-course.input.js';
import { CourseType } from './dto/course.type.js';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateCourseInput): Promise<CourseType> {
    const existingCourse = await this.prisma.course.findFirst({
      where: { stepOrder: input.stepOrder },
    });

    if (existingCourse) {
      throw new ConflictException(
        `Step number ${input.stepOrder} is already assigned to another course.`,
      );
    }

    const course = await this.prisma.course.create({
      data: input,
    });

    return { ...course, examsCount: 0, exams: [] };
  }

  async findAll(): Promise<CourseType[]> {
    const courses = await this.prisma.course.findMany({
      orderBy: { stepOrder: 'asc' },
      include: {
        _count: { select: { exams: true } },
        exams: { select: { id: true, title: true, passingThreshold: true, questions: true } },
      },
    });

    return courses.map(({ _count, exams, ...course }) => ({
      ...course,
      examsCount: _count.exams,
      exams: exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        passingThreshold: exam.passingThreshold,
        questionCount: Array.isArray(exam.questions) ? exam.questions.length : 0,
      })),
    }));
  }
}
