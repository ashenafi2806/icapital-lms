import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../models/course.dart';
import '../providers/courses_provider.dart';
import 'course_detail_screen.dart';
import '../widgets/status_badge.dart';

class CourseListScreen extends ConsumerWidget {
  const CourseListScreen({super.key});

  Future<void> _refresh(WidgetRef ref) async {
    final refreshed = ref.refresh(coursesProvider.future);
    await refreshed;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courses = ref.watch(coursesProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('My courses'),
        actions: [
          IconButton(
            tooltip: 'Log out',
            onPressed: () => ref.read(authProvider.notifier).logout(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: courses.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorState(
          message: error.toString(),
          onRetry: () => ref.invalidate(coursesProvider),
        ),
        data: (items) => RefreshIndicator(
          onRefresh: () => _refresh(ref),
          child: items.isEmpty
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: const [
                    SizedBox(height: 160),
                    Center(child: Text('No courses available yet.')),
                  ],
                )
              : _CourseContent(courses: items),
        ),
      ),
    );
  }
}

class _CourseContent extends StatelessWidget {
  const _CourseContent({required this.courses});

  final List<Course> courses;

  @override
  Widget build(BuildContext context) {
    final completed = courses
        .where((course) => course.status == CourseStatus.completed)
        .length;
    return ListView(
      padding: const EdgeInsets.all(16),
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        Text(
          '$completed of ${courses.length} completed',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 16),
        ...courses.map(
          (course) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => CourseDetailScreen(courseId: course.id),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            'Step ${course.stepOrder}: ${course.title}',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                        ),
                        StatusBadge(status: course.status),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(course.description),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
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
