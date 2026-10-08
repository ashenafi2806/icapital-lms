import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/main.dart';

void main() {
  testWidgets('shows the LMS Student placeholder', (tester) async {
    await tester.pumpWidget(const LmsStudentApp());

    expect(find.text('LMS Student'), findsOneWidget);
  });
}
