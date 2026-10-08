import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProgressStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateExamInput } from './dto/create-exam.input.js';
import { ExamResultType } from './dto/exam-result.type.js';
import { ExamType } from './dto/exam.type.js';
import { SubmitExamInput } from './dto/submit-exam.input.js';

interface StoredQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateExamInput): Promise<ExamType> {
    const course = await this.prisma.course.findUnique({
      where: { id: input.courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const questions: Prisma.InputJsonArray = input.questions.map(
      (question): Prisma.InputJsonObject => ({
        text: question.text,
        options: question.options,
        correctIndex: question.correctIndex,
      }),
    );
    const exam = await this.prisma.exam.create({
      data: {
        courseId: input.courseId,
        title: input.title,
        passingThreshold: input.passingThreshold,
        questions,
      },
    });

    return {
      id: exam.id,
      courseId: exam.courseId,
      title: exam.title,
      passingThreshold: exam.passingThreshold,
      questions: this.parseQuestions(exam.questions),
    };
  }

  async submit(
    input: SubmitExamInput,
    userId: string,
  ): Promise<ExamResultType> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: input.examId },
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const questions = this.parseQuestions(exam.questions);
    if (input.answers.length !== questions.length) {
      throw new BadRequestException(
        'The number of answers must match the number of questions',
      );
    }

    const correctAnswers = questions.reduce(
      (total, question, index) =>
        total + Number(input.answers[index] === question.correctIndex),
      0,
    );
    const score = (correctAnswers / questions.length) * 100;
    const isPassed = score >= exam.passingThreshold;

    await this.prisma.$transaction(async (tx) => {
      const progress = await tx.studentProgress.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: exam.courseId,
          },
        },
        create: {
          userId,
          courseId: exam.courseId,
          score,
          isPassed,
          status: isPassed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
          completedAt: isPassed ? new Date() : null,
        },
        update: {
          score,
          isPassed,
          status: isPassed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
          completedAt: isPassed ? new Date() : null,
        },
      });

      await tx.examAttempt.create({
        data: {
          userId,
          examId: exam.id,
          progressId: progress.id,
          score,
          isPassed,
        },
      });
    });

    return { score, isPassed };
  }

  private parseQuestions(value: Prisma.JsonValue): StoredQuestion[] {
    if (!Array.isArray(value)) {
      throw new BadRequestException('Exam questions must be a JSON array');
    }

    return value.map((question) => {
      if (
        typeof question !== 'object' ||
        question === null ||
        Array.isArray(question) ||
        typeof question.text !== 'string' ||
        !Array.isArray(question.options) ||
        !question.options.every((option) => typeof option === 'string') ||
        typeof question.correctIndex !== 'number'
      ) {
        throw new BadRequestException('Exam contains an invalid question');
      }
      return {
        text: question.text,
        options: question.options,
        correctIndex: question.correctIndex,
      };
    });
  }
}
