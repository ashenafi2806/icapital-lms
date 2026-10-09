import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../models/course.dart';

const _coursesDocument = '''
  query Courses {
    getCourses {
      id
      title
      description
      stepOrder
    }
  }
''';

final coursesProvider = FutureProvider<List<Course>>((ref) async {
  final response = await ref
      .read(graphqlClientProvider)
      .query(_coursesDocument);
  final courses = response['getCourses'];
  if (courses is! List<Object?>) {
    throw const FormatException('Invalid courses response');
  }

  return courses.map((course) {
    if (course is! Map<Object?, Object?>) {
      throw const FormatException('Invalid course response');
    }
    final json = Map<String, dynamic>.fromEntries(
      course.entries
          .where((entry) => entry.key is String)
          .map((entry) => MapEntry(entry.key as String, entry.value)),
    );
    return Course.fromJson(json);
  }).toList();
});
