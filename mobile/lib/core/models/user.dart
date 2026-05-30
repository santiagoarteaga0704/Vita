class UserModel {
  final String id;
  final String email;
  final String name;
  final String region;
  final String cropMain;
  final bool premium;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.region,
    required this.cropMain,
    this.premium = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> j) => UserModel(
        id: j['id'] as String,
        email: j['email'] as String,
        name: (j['name'] ?? '') as String,
        region: (j['region'] ?? '') as String,
        cropMain: (j['crop_main'] ?? '') as String,
        premium: (j['premium'] ?? false) as bool,
      );
}
