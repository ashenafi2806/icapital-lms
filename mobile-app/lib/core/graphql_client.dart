import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import 'config.dart';

class GraphQLException implements Exception {
  const GraphQLException(this.message);

  final String message;

  @override
  String toString() => message;
}

class GraphQLClient {
  GraphQLClient({http.Client? client, this.tokenProvider})
    : _client = client ?? http.Client();

  final http.Client _client;
  final String? Function()? tokenProvider;

  Future<Map<String, dynamic>> query(
    String document, {
    Map<String, dynamic>? variables,
  }) {
    return _execute(document, variables: variables);
  }

  Future<Map<String, dynamic>> mutate(
    String document, {
    Map<String, dynamic>? variables,
  }) {
    return _execute(document, variables: variables);
  }

  Future<Map<String, dynamic>> _execute(
    String document, {
    Map<String, dynamic>? variables,
  }) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    final token = tokenProvider?.call();
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    late http.Response response;
    try {
      response = await _client
          .post(
            Uri.parse(AppConfig.apiUrl),
            headers: headers,
            body: jsonEncode(<String, dynamic>{
              'query': document,
              'variables': variables ?? <String, dynamic>{},
            }),
          )
          .timeout(const Duration(seconds: 60));
    } on TimeoutException {
      throw const GraphQLException(
        'The server is taking too long to respond. Please try again.',
      );
    } on SocketException {
      throw const GraphQLException(
        'Cannot reach the server. Check your connection.',
      );
    } on http.ClientException {
      throw const GraphQLException(
        'Cannot reach the server. Check your connection.',
      );
    }

    final decoded = _decodeResponse(response.body);
    final errors = decoded['errors'];
    if (errors is List<Object?> && errors.isNotEmpty) {
      final firstError = errors.first;
      if (firstError is Map<Object?, Object?>) {
        final errorMap = Map<String, Object?>.fromEntries(
          firstError.entries
              .where((entry) => entry.key is String)
              .map((entry) => MapEntry(entry.key as String, entry.value)),
        );
        final message = errorMap['message'];
        if (message is String && message.isNotEmpty) {
          throw GraphQLException(message);
        }
      }
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw GraphQLException(
        'Server error (${response.statusCode}). Please try again.',
      );
    }

    final data = decoded['data'];
    if (data is Map<Object?, Object?>) {
      return Map<String, dynamic>.fromEntries(
        data.entries
            .where((entry) => entry.key is String)
            .map((entry) => MapEntry(entry.key as String, entry.value)),
      );
    }

    throw const GraphQLException('Unexpected response from the server.');
  }

  Map<String, dynamic> _decodeResponse(String body) {
    try {
      final decoded = jsonDecode(body);
      if (decoded is! Map<Object?, Object?>) {
        throw const GraphQLException('Unexpected response from the server.');
      }
      return Map<String, dynamic>.fromEntries(
        decoded.entries
            .where((entry) => entry.key is String)
            .map((entry) => MapEntry(entry.key as String, entry.value)),
      );
    } on FormatException {
      throw const GraphQLException('Unexpected response from the server.');
    }
  }
}
