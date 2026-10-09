import 'package:flutter/material.dart';

import '../../courses/models/exam.dart';
import 'quiz_screen.dart';
import '../models/exam_result.dart';

class ResultScreen extends StatelessWidget {
  const ResultScreen({required this.exam, required this.result, super.key});

  final Exam exam;
  final ExamResult result;

  @override
  Widget build(BuildContext context) {
    final color = result.isPassed ? Colors.green : Colors.red;
    return Scaffold(
      appBar: AppBar(title: const Text('Exam result')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                result.isPassed ? Icons.check_circle : Icons.cancel,
                color: color,
                size: 72,
              ),
              const SizedBox(height: 16),
              Text(
                result.isPassed ? 'Passed' : 'Not passed',
                style: Theme.of(context).textTheme.headlineMedium
                    ?.copyWith(color: color, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                'Score: ${result.score.toStringAsFixed(1)}%',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Passing threshold: '
                '${exam.passingThreshold.toStringAsFixed(1)}%',
              ),
              const SizedBox(height: 32),
              if (!result.isPassed)
                FilledButton(
                  onPressed: () => Navigator.of(context).pushReplacement(
                    MaterialPageRoute<void>(
                      builder: (_) => QuizScreen(exam: exam),
                    ),
                  ),
                  child: const Text('Retake exam'),
                )
              else
                FilledButton(
                  onPressed: () =>
                      Navigator.of(context).popUntil((route) => route.isFirst),
                  child: const Text('Back to courses'),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
