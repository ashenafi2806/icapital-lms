import 'package:flutter/material.dart';

import '../models/course.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({required this.status, super.key});

  final CourseStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      CourseStatus.notStarted => ('Not Started', Colors.grey),
      CourseStatus.inProgress => ('In Progress', Colors.amber.shade800),
      CourseStatus.completed => ('Passed', Colors.green.shade700),
    };
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
