class ExamQuestion {
  const ExamQuestion({required this.text, required this.options});

  final String text;
  final List<String> options;

  factory ExamQuestion.fromJson(Map<String, dynamic> json) {
    final text = json['text'];
    final options = json['options'];
    if (text is! String || options is! List<Object?>) {
      throw const FormatException('Invalid exam question response');
    }
    final parsedOptions = options.whereType<String>().toList();
    if (parsedOptions.length != options.length) {
      throw const FormatException('Invalid exam question options');
    }
    return ExamQuestion(text: text, options: parsedOptions);
  }
}

class Exam {
  const Exam({
    required this.id,
    required this.courseId,
    required this.title,
    required this.passingThreshold,
    required this.questions,
  });

  final String id;
  final String courseId;
  final String title;
  final double passingThreshold;
  final List<ExamQuestion> questions;

  factory Exam.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final courseId = json['courseId'];
    final title = json['title'];
    final threshold = json['passingThreshold'];
    final questions = json['questions'];
    if (id is! String ||
        courseId is! String ||
        title is! String ||
        threshold is! num ||
        questions is! List<Object?>) {
      throw const FormatException('Invalid exam response');
    }
    return Exam(
      id: id,
      courseId: courseId,
      title: title,
      passingThreshold: threshold.toDouble(),
      questions: questions.map((question) {
        if (question is! Map<Object?, Object?>) {
          throw const FormatException('Invalid exam question response');
        }
        return ExamQuestion.fromJson(_stringKeyedMap(question));
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
