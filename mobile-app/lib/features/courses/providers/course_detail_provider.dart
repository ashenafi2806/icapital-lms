import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../models/course_detail.dart';

const _courseDetailDocument = '''
  query GetCourse(\$id: String!) {
    getCourse(id: \$id) {
      id
      title
      description
      stepOrder
      exams {
        id
        courseId
        title
        passingThreshold
        questions {
          text
          options
        }
      }
    }
  }
''';

final courseDetailProvider = FutureProvider.family<CourseDetail, String>((
  ref,
  courseId,
) async {
  final response = await ref
      .read(graphqlClientProvider)
      .query(
        _courseDetailDocument,
        variables: <String, dynamic>{'id': courseId},
      );
  final course = response['getCourse'];
  if (course is! Map<Object?, Object?>) {
    throw const FormatException('Invalid course detail response');
  }
  return CourseDetail.fromJson(
    Map<String, dynamic>.fromEntries(
      course.entries
          .where((entry) => entry.key is String)
          .map((entry) => MapEntry(entry.key as String, entry.value)),
    ),
  );
});
