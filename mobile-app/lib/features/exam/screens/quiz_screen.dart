import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../courses/models/exam.dart';
import '../providers/quiz_provider.dart';

class QuizScreen extends ConsumerWidget {
  const QuizScreen({required this.exam, super.key});

  final Exam exam;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quiz = ref.watch(quizProvider(exam));
    final question = quiz.exam.questions[quiz.currentIndex];
    final questionCount = quiz.exam.questions.length;
    final progress = (quiz.currentIndex + 1) / questionCount;
    return Scaffold(
      appBar: AppBar(title: Text(quiz.exam.title)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              'Question ${quiz.currentIndex + 1} of $questionCount',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(value: progress),
            const SizedBox(height: 24),
            Text(question.text, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            RadioGroup<int>(
              groupValue: quiz.answers[quiz.currentIndex],
              onChanged: (value) {
                if (value != null) {
                  ref.read(quizProvider(exam).notifier).selectOption(value);
                }
              },
              child: Column(
                children: question.options
                    .asMap()
                    .entries
                    .map(
                      (entry) => RadioListTile<int>(
                        value: entry.key,
                        title: Text(entry.value),
                      ),
                    )
                    .toList(),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                OutlinedButton(
                  onPressed: quiz.currentIndex == 0
                      ? null
                      : () => ref.read(quizProvider(exam).notifier).previous(),
                  child: const Text('Back'),
                ),
                const Spacer(),
                if (quiz.currentIndex < questionCount - 1)
                  FilledButton(
                    onPressed: () =>
                        ref.read(quizProvider(exam).notifier).next(),
                    child: const Text('Next'),
                  )
                else
                  FilledButton(
                    onPressed: quiz.allAnswered
                        ? () => _showNotWiredMessage(context)
                        : null,
                    child: const Text('Submit'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showNotWiredMessage(BuildContext context) {
    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text('Submitting quiz...')));
  }
}
