import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/user.dart';
import '../../core/services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((_) => AuthService());

final currentUserProvider =
    StateNotifierProvider<CurrentUserNotifier, AsyncValue<UserModel?>>((ref) {
  return CurrentUserNotifier(ref.read(authServiceProvider))..bootstrap();
});

class CurrentUserNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthService _service;
  CurrentUserNotifier(this._service) : super(const AsyncValue.loading());

  Future<void> bootstrap() async {
    state = const AsyncValue.loading();
    final user = await _service.me();
    state = AsyncValue.data(user);
  }

  Future<void> login(String email, String password) async {
    final r = await _service.login(email: email, password: password);
    state = AsyncValue.data(r.user);
  }

  Future<void> register({
    required String email,
    required String password,
    required String name,
    required String region,
    required String cropMain,
  }) async {
    final r = await _service.register(
      email: email,
      password: password,
      name: name,
      region: region,
      cropMain: cropMain,
    );
    state = AsyncValue.data(r.user);
  }

  Future<void> logout() async {
    await _service.logout();
    state = const AsyncValue.data(null);
  }
}
