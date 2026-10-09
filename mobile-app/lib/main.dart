import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'features/auth/providers/auth_provider.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/courses/screens/course_list_screen.dart';

void main() {
  runApp(const ProviderScope(child: LmsStudentApp()));
}

class LmsStudentApp extends ConsumerWidget {
  const LmsStudentApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    return MaterialApp(
      title: 'LMS Student',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: auth.when(
        loading: () => const SplashScreen(),
        error: (error, _) => _PlaceholderScreen(text: error.toString()),
        data: (session) =>
            session == null ? const LoginScreen() : const CourseListScreen(),
      ),
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  const _PlaceholderScreen({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: Center(child: Text(text)));
  }
}
