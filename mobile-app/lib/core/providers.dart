import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'graphql_client.dart';

final graphqlClientProvider = Provider<GraphQLClient>((ref) {
  // TODO: Connect this provider to the token stored by the auth feature.
  return GraphQLClient(tokenProvider: () => null);
});
