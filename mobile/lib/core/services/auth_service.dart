import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../models/user.dart';
import '../storage/secure.dart';

class AuthResult {
  final UserModel user;
  final String token;
  AuthResult(this.user, this.token);
}

class AuthService {
  Future<AuthResult> register({
    required String email,
    required String password,
    required String name,
    required String region,
    required String cropMain,
  }) async {
    final res = await ApiClient.dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      'name': name,
      'region': region,
      'crop_main': cropMain,
    });
    final data = res.data['data'] as Map<String, dynamic>;
    await SecureStore.setToken(data['token'] as String);
    return AuthResult(
      UserModel.fromJson(data['user'] as Map<String, dynamic>),
      data['token'] as String,
    );
  }

  Future<AuthResult> login({required String email, required String password}) async {
    final res = await ApiClient.dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final data = res.data['data'] as Map<String, dynamic>;
    await SecureStore.setToken(data['token'] as String);
    return AuthResult(
      UserModel.fromJson(data['user'] as Map<String, dynamic>),
      data['token'] as String,
    );
  }

  Future<UserModel?> me() async {
    try {
      final res = await ApiClient.dio.get('/auth/me');
      return UserModel.fromJson(res.data['data']['user'] as Map<String, dynamic>);
    } on DioException {
      return null;
    }
  }

  Future<void> logout() async {
    await SecureStore.clearToken();
  }
}
