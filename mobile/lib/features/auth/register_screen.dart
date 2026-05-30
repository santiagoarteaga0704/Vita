import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _name = TextEditingController();
  String _region = 'Cuatro Cañadas';
  String _crop = 'soya';
  bool _loading = false;
  String? _error;

  static const _regions = [
    'Cuatro Cañadas',
    'San Julián',
    'Pailón',
    'Mineros',
    'Montero',
    'Warnes',
    'Santa Cruz capital',
    'Otro',
  ];
  static const _crops = [
    'soya',
    'maíz',
    'sorgo',
    'yuca',
    'cítricos',
    'tomate',
    'papa',
    'cebolla',
    'girasol',
    'arroz',
  ];

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _name.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.text.isEmpty || _password.text.length < 6 || _name.text.isEmpty) {
      setState(() => _error = 'Completá todos los campos (contraseña mínimo 6)');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(currentUserProvider.notifier).register(
            email: _email.text.trim(),
            password: _password.text,
            name: _name.text.trim(),
            region: _region,
            cropMain: _crop,
          );
    } catch (_) {
      setState(() => _error = 'No se pudo registrar (¿email ya usado?)');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crear cuenta')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(
                controller: _name,
                decoration: const InputDecoration(
                  labelText: 'Tu nombre',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _password,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Contraseña (mín 6 caracteres)',
                  prefixIcon: Icon(Icons.lock_outline),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _region,
                decoration: const InputDecoration(
                  labelText: 'Región',
                  prefixIcon: Icon(Icons.place_outlined),
                ),
                items: _regions
                    .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                    .toList(),
                onChanged: (v) => setState(() => _region = v!),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _crop,
                decoration: const InputDecoration(
                  labelText: 'Cultivo principal',
                  prefixIcon: Icon(Icons.grass),
                ),
                items: _crops
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (v) => setState(() => _crop = v!),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(_error!, style: const TextStyle(color: Colors.red)),
                ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Crear cuenta'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
