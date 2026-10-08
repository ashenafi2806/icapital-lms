import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CourseDetailType } from './dto/course-detail.type.js';
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

  async findById(id: string): Promise<CourseDetailType> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { exams: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      stepOrder: course.stepOrder,
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
}
