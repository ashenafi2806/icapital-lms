import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/graphql_client.dart';
import '../../../core/providers.dart';
import '../models/user.dart';

class AuthState {
  const AuthState({required this.token, required this.user});

  final String token;
  final User user;

  factory AuthState.fromJson(Map<String, dynamic> json) {
    final token = json['token'];
    final user = json['user'];
    if (token is! String || token.isEmpty || user is! Map<Object?, Object?>) {
      throw const FormatException('Invalid saved session');
    }
    return AuthState(token: token, user: User.fromJson(_stringKeyedMap(user)));
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{'token': token, 'user': user.toJson()};
  }

  static Map<String, dynamic> _stringKeyedMap(Map<Object?, Object?> value) {
    return Map<String, dynamic>.fromEntries(
      value.entries
          .where((entry) => entry.key is String)
          .map((entry) => MapEntry(entry.key as String, entry.value)),
    );
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, AuthState?>(
  AuthNotifier.new,
);

class AuthNotifier extends AsyncNotifier<AuthState?> {
  static const _storageKey = 'lms_auth';

  GraphQLClient get _client => ref.read(graphqlClientProvider);

  @override
  Future<AuthState?> build() async {
    final preferences = await SharedPreferences.getInstance();
    final saved = preferences.getString(_storageKey);
    if (saved == null) {
      return null;
    }

    try {
      final decoded = jsonDecode(saved);
      if (decoded is! Map<Object?, Object?>) {
        return null;
      }
      return AuthState.fromJson(_stringKeyedMap(decoded));
    } on FormatException {
      await preferences.remove(_storageKey);
      return null;
    } on JsonUnsupportedObjectError {
      await preferences.remove(_storageKey);
      return null;
    }
  }

  Future<void> login(String email, String password) async {
    await _authenticate(
      responseKey: 'login',
      document: '''
        mutation Login(\$input: LoginInput!) {
          login(input: \$input) {
            accessToken
            user { id email role }
          }
        }
      ''',
      variables: <String, dynamic>{
        'input': <String, dynamic>{'email': email, 'password': password},
      },
    );
  }

  Future<void> register(String email, String password) async {
    await _authenticate(
      responseKey: 'register',
      document: '''
        mutation Register(\$input: RegisterInput!) {
          register(input: \$input) {
            accessToken
            user { id email role }
          }
        }
      ''',
      variables: <String, dynamic>{
        'input': <String, dynamic>{'email': email, 'password': password},
      },
    );
  }

  Future<void> logout() async {
    state = const AsyncData<AuthState?>(null);
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_storageKey);
  }

  Future<void> _authenticate({
    required String responseKey,
    required String document,
    required Map<String, dynamic> variables,
  }) async {
    state = const AsyncLoading<AuthState?>();
    try {
      final response = await _client.mutate(document, variables: variables);
      final payload = response[responseKey];
      if (payload is! Map<Object?, Object?>) {
        throw const GraphQLException('Unexpected authentication response.');
      }
      final responseMap = _stringKeyedMap(payload);
      final accessToken = responseMap['accessToken'];
      final userValue = responseMap['user'];
      if (accessToken is! String ||
          accessToken.isEmpty ||
          userValue is! Map<Object?, Object?>) {
        throw const GraphQLException('Unexpected authentication response.');
      }

      final user = User.fromJson(_stringKeyedMap(userValue));
      if (user.role == 'ADMIN') {
        throw const GraphQLException('Use the admin web portal');
      }

      final authenticated = AuthState(token: accessToken, user: user);
      state = AsyncData<AuthState?>(authenticated);
      final preferences = await SharedPreferences.getInstance();
      await preferences.setString(
        _storageKey,
        jsonEncode(authenticated.toJson()),
      );
    } on GraphQLException catch (error) {
      state = AsyncError<AuthState?>(error, StackTrace.current);
      rethrow;
    } on FormatException catch (error, stackTrace) {
      final exception = GraphQLException(error.message);
      state = AsyncError<AuthState?>(exception, stackTrace);
      throw exception;
    } catch (error, stackTrace) {
      state = AsyncError<AuthState?>(error, stackTrace);
      rethrow;
    }
  }

  static Map<String, dynamic> _stringKeyedMap(Map<Object?, Object?> value) {
    return Map<String, dynamic>.fromEntries(
      value.entries
          .where((entry) => entry.key is String)
          .map((entry) => MapEntry(entry.key as String, entry.value)),
    );
  }
}
