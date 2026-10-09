import 'exam.dart';

class CourseDetail {
  const CourseDetail({
    required this.id,
    required this.title,
    required this.description,
    required this.stepOrder,
    required this.exams,
  });

  final String id;
  final String title;
  final String description;
  final int stepOrder;
  final List<Exam> exams;

  factory CourseDetail.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final title = json['title'];
    final description = json['description'];
    final stepOrder = json['stepOrder'];
    final exams = json['exams'];
    if (id is! String ||
        title is! String ||
        description is! String ||
        stepOrder is! num ||
        exams is! List<Object?>) {
      throw const FormatException('Invalid course detail response');
    }
    return CourseDetail(
      id: id,
      title: title,
      description: description,
      stepOrder: stepOrder.toInt(),
      exams: exams.map((exam) {
        if (exam is! Map<Object?, Object?>) {
          throw const FormatException('Invalid exam response');
        }
        return Exam.fromJson(_stringKeyedMap(exam));
      }).toList(),
    );
  }

  static Map<String, dynamic> _stringKeyedMap(Map<Object?, Object?> value) {
    return Map<String, dynamic>.fromEntries(
      value.entries
          .where((entry) => entry.key is String)
          .map((entry) => MapEntry(entry.key as String, entry.value)),
    );
  }
}
