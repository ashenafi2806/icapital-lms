class User {
  const User({
    required this.id,
    required this.email,
    required this.role,
    this.name,
  });

  final String id;
  final String email;
  final String? name;
  final String role;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: _requiredString(json, 'id'),
      email: _requiredString(json, 'email'),
      name: json['name'] is String ? json['name'] as String : null,
      role: _requiredString(json, 'role'),
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'email': email,
      'name': name,
      'role': role,
    };
  }

  static String _requiredString(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value is! String || value.isEmpty) {
      throw FormatException('Invalid user $key');
    }
    return value;
  }
}
