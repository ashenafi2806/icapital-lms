import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mobile_app/core/graphql_client.dart';

void main() {
  test('success returns data', () async {
    final client = GraphQLClient(
      client: MockClient((_) async {
        return http.Response(
          jsonEncode(<String, dynamic>{
            'data': <String, dynamic>{'courses': <Object?>[]},
          }),
          200,
        );
      }),
    );

    final data = await client.query('{ courses { id } }');

    expect(data, <String, dynamic>{'courses': <Object?>[]});
  });

  test('GraphQL errors throw the first message', () async {
    final client = GraphQLClient(
      client: MockClient((_) async {
        return http.Response(
          jsonEncode(<String, dynamic>{
            'errors': <Object?>[
              <String, dynamic>{'message': 'Not authorized'},
              <String, dynamic>{'message': 'Another error'},
            ],
          }),
          200,
        );
      }),
    );

    expect(
      () => client.query('{ courses { id } }'),
      throwsA(
        isA<GraphQLException>().having(
          (error) => error.message,
          'message',
          'Not authorized',
        ),
      ),
    );
  });

  test('non-2xx response throws the status message', () async {
    final client = GraphQLClient(
      client: MockClient((_) async {
        return http.Response('{}', 503);
      }),
    );

    expect(
      () => client.query('{ courses { id } }'),
      throwsA(
        isA<GraphQLException>().having(
          (error) => error.message,
          'message',
          'Server error (503). Please try again.',
        ),
      ),
    );
  });
}
