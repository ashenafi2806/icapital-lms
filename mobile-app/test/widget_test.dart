import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_app/main.dart';

void main() {
  testWidgets('builds the LMS Student app', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: LmsStudentApp()));

    expect(find.byType(Scaffold), findsOneWidget);
  });
}
