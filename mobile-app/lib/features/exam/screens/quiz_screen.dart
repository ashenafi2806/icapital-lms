import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../courses/models/exam.dart';
import '../../courses/providers/course_detail_provider.dart';
import '../../courses/providers/courses_provider.dart';
import '../providers/quiz_provider.dart';
import 'result_screen.dart';

class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({required this.exam, super.key});

  final Exam exam;

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  bool _submitting = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final result = await ref
          .read(quizProvider(widget.exam).notifier)
          .submit();
      if (!mounted) {
        return;
      }
      ref.invalidate(coursesProvider);
      ref.invalidate(courseDetailProvider(widget.exam.courseId));
      await Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => ResultScreen(exam: widget.exam, result: result),
        ),
      );
    } catch (error) {
      if (mounted) {
        setState(() => _error = error.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final quiz = ref.watch(quizProvider(widget.exam));
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
                  ref
                      .read(quizProvider(widget.exam).notifier)
                      .selectOption(value);
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
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
            const SizedBox(height: 24),
            Row(
              children: [
                OutlinedButton(
                  onPressed: _submitting || quiz.currentIndex == 0
                      ? null
                      : () => ref
                            .read(quizProvider(widget.exam).notifier)
                            .previous(),
                  child: const Text('Back'),
                ),
                const Spacer(),
                if (quiz.currentIndex < questionCount - 1)
                  FilledButton(
                    onPressed: _submitting
                        ? null
                        : () => ref
                              .read(quizProvider(widget.exam).notifier)
                              .next(),
                    child: const Text('Next'),
                  )
                else
                  FilledButton(
                    onPressed: _submitting || !quiz.allAnswered
                        ? null
                        : _submit,
                    child: _submitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Submit'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
