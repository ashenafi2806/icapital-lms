import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../courses/models/exam.dart';
import '../models/exam_result.dart';

class QuizState {
  const QuizState({
    required this.exam,
    required this.currentIndex,
    required this.answers,
  });

  final Exam exam;
  final int currentIndex;
  final List<int?> answers;

  bool get allAnswered => answers.every((answer) => answer != null);

  QuizState copyWith({int? currentIndex, List<int?>? answers}) {
    return QuizState(
      exam: exam,
      currentIndex: currentIndex ?? this.currentIndex,
      answers: answers ?? this.answers,
    );
  }
}

final quizProvider = NotifierProvider.autoDispose
    .family<QuizNotifier, QuizState, Exam>((exam) => QuizNotifier(exam));

class QuizNotifier extends Notifier<QuizState> {
  QuizNotifier(this.exam);

  final Exam exam;

  @override
  QuizState build() {
    return QuizState(
      exam: exam,
      currentIndex: 0,
      answers: List<int?>.filled(exam.questions.length, null),
    );
  }

  void selectOption(int optionIndex) {
    final answers = [...state.answers];
    answers[state.currentIndex] = optionIndex;
    state = state.copyWith(answers: answers);
  }

  void previous() {
    if (state.currentIndex > 0) {
      state = state.copyWith(currentIndex: state.currentIndex - 1);
    }
  }

  void next() {
    if (state.currentIndex < state.exam.questions.length - 1) {
      state = state.copyWith(currentIndex: state.currentIndex + 1);
    }
  }

  Future<ExamResult> submit() async {
    if (!state.allAnswered) {
      throw const FormatException('Answer every question before submitting.');
    }
    final response = await ref
        .read(graphqlClientProvider)
        .mutate(
          '''
          mutation SubmitExam(\$input: SubmitExamInput!) {
            submitExam(input: \$input) {
              score
              isPassed
            }
          }
        ''',
          variables: <String, dynamic>{
            'input': <String, dynamic>{
              'examId': state.exam.id,
              'answers': state.answers.map((answer) => answer ?? 0).toList(),
            },
          },
        );
    final result = response['submitExam'];
    if (result is! Map<Object?, Object?>) {
      throw const FormatException('Invalid exam result response');
    }
    return ExamResult.fromJson(
      Map<String, dynamic>.fromEntries(
        result.entries
            .where((entry) => entry.key is String)
            .map((entry) => MapEntry(entry.key as String, entry.value)),
      ),
    );
  }
}
