import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ProgressStatus as PrismaProgressStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CourseDetailType } from './dto/course-detail.type.js';
import { CreateCourseInput } from './dto/create-course.input.js';
import { CourseType } from './dto/course.type.js';
import { CourseProgressStatus } from './dto/progress-status.enum.js';

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

    return {
      ...course,
      examsCount: 0,
      exams: [],
      status: CourseProgressStatus.NOT_STARTED,
    };
  }

  async findAll(userId: string): Promise<CourseType[]> {
    const courses = await this.prisma.course.findMany({
      orderBy: { stepOrder: 'asc' },
      include: {
        _count: { select: { exams: true } },
        exams: { select: { id: true, title: true, passingThreshold: true, questions: true } },
        progress: {
          where: { userId },
          select: { status: true },
          take: 1,
        },
      },
    });

    return courses.map(({ _count, exams, progress, ...course }) => ({
      ...course,
      examsCount: _count.exams,
      status: this.toGraphqlStatus(progress[0]?.status),
      exams: exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        passingThreshold: exam.passingThreshold,
        questionCount: Array.isArray(exam.questions) ? exam.questions.length : 0,
      })),
    }));
  }

  async findById(id: string, userId: string): Promise<CourseDetailType> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        exams: true,
        progress: {
          where: { userId },
          select: { status: true },
          take: 1,
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      stepOrder: course.stepOrder,
      status: this.toGraphqlStatus(course.progress[0]?.status),
      exams: course.exams.map((exam) => ({
        id: exam.id,
        courseId: exam.courseId,
        title: exam.title,
        passingThreshold: exam.passingThreshold,
        questions: this.parseQuestions(exam.questions),
      })),
    };
  }

  private parseQuestions(value: unknown): Array<{
    text: string;
    options: string[];
    correctIndex: number;
  }> {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (question): question is {
        text: string;
        options: string[];
        correctIndex: number;
      } =>
        typeof question === 'object' &&
        question !== null &&
        'text' in question &&
        typeof question.text === 'string' &&
        'options' in question &&
        Array.isArray(question.options) &&
        question.options.every((option: unknown) => typeof option === 'string') &&
        'correctIndex' in question &&
        typeof question.correctIndex === 'number',
    );
  }

  private toGraphqlStatus(
    status?: PrismaProgressStatus,
  ): CourseProgressStatus {
    switch (status) {
      case PrismaProgressStatus.IN_PROGRESS:
        return CourseProgressStatus.IN_PROGRESS;
      case PrismaProgressStatus.COMPLETED:
        return CourseProgressStatus.COMPLETED;
      case PrismaProgressStatus.NOT_STARTED:
      case undefined:
        return CourseProgressStatus.NOT_STARTED;
    }
  }
}
