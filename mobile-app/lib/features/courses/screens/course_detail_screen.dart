import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/course_detail.dart';
import '../models/exam.dart';
import '../providers/course_detail_provider.dart';

class CourseDetailScreen extends ConsumerWidget {
  const CourseDetailScreen({required this.courseId, super.key});

  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final course = ref.watch(courseDetailProvider(courseId));
    return Scaffold(
      appBar: AppBar(title: const Text('Course details')),
      body: course.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorState(
          message: error.toString(),
          onRetry: () => ref.invalidate(courseDetailProvider(courseId)),
        ),
        data: (detail) => _CourseDetails(course: detail),
      ),
    );
  }
}

class _CourseDetails extends StatelessWidget {
  const _CourseDetails({required this.course});

  final CourseDetail course;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Step ${course.stepOrder}',
          style: Theme.of(context).textTheme.labelLarge
              ?.copyWith(color: Theme.of(context).colorScheme.primary),
        ),
        const SizedBox(height: 8),
        Text(course.title, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 8),
        Text(course.description),
        const SizedBox(height: 24),
        Text('Exams', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        if (course.exams.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 32),
            child: Center(child: Text('No exams available yet.')),
          )
        else
          ...course.exams.map(
            (exam) => Card(
              child: ListTile(
                title: Text(exam.title),
                subtitle: Text(
                  '${exam.questions.length} questions · '
                  'Pass at ${exam.passingThreshold.toStringAsFixed(0)}%',
                ),
                trailing: FilledButton(
                  onPressed: exam.questions.isEmpty
                      ? null
                      : () => _showQuizUnavailable(context, exam),
                  child: const Text('Start'),
                ),
              ),
            ),
          ),
      ],
    );
  }

  void _showQuizUnavailable(BuildContext context, Exam exam) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text('Starting ${exam.title}...')));
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}
