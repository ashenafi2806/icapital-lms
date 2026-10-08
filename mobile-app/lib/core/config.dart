class AppConfig {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: '<YOUR_RENDER_URL>/graphql',
  );
}
