class ExamResult {
  const ExamResult({required this.score, required this.isPassed});

  final double score;
  final bool isPassed;

  factory ExamResult.fromJson(Map<String, dynamic> json) {
    final score = json['score'];
    final isPassed = json['isPassed'];
    if (score is! num || isPassed is! bool) {
      throw const FormatException('Invalid exam result response');
    }
    return ExamResult(score: score.toDouble(), isPassed: isPassed);
  }
}
