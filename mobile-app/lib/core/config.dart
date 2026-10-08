class AppConfig {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://icapital-lms.onrender.com/graphql',
  );
}
