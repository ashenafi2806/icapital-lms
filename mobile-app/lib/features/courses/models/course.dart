enum CourseStatus {
  notStarted,
  inProgress,
  completed;

  static CourseStatus fromJson(Object? value) {
    switch (value) {
      case 'IN_PROGRESS':
        return CourseStatus.inProgress;
      case 'COMPLETED':
        return CourseStatus.completed;
      case 'NOT_STARTED':
      default:
        return CourseStatus.notStarted;
    }
  }
}

class Course {
  const Course({
    required this.id,
    required this.title,
    required this.description,
    required this.stepOrder,
    required this.status,
  });

  final String id;
  final String title;
  final String description;
  final int stepOrder;
  final CourseStatus status;

  factory Course.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final title = json['title'];
    final description = json['description'];
    final stepOrder = json['stepOrder'];
    if (id is! String ||
        title is! String ||
        description is! String ||
        stepOrder is! num) {
      throw const FormatException('Invalid course response');
    }
    return Course(
      id: id,
      title: title,
      description: description,
      stepOrder: stepOrder.toInt(),
      status: CourseStatus.fromJson(json['status']),
    );
  }
}
