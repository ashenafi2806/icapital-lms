import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../courses/models/exam.dart';

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
}
