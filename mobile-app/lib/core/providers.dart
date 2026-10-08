import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/auth/providers/auth_provider.dart';
import 'graphql_client.dart';

final graphqlClientProvider = Provider<GraphQLClient>((ref) {
  return GraphQLClient(
    tokenProvider: () => ref.read(authProvider).asData?.value?.token,
  );
});
