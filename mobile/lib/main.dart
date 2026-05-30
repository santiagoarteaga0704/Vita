import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/api/api_client.dart';
import 'app/app.dart';

void main() {
  // Base URL del backend según plataforma:
  // - Web (Chrome/Edge): localhost:3000 (mismo host)
  // - Emulador Android: 10.0.2.2:3000 (alias del host)
  // - Dispositivo físico: IP local PC (ej: 192.168.1.10:3000)
  // - Producción: URL Railway
  const baseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://localhost:3000');
  ApiClient.init(baseUrl: baseUrl);
  runApp(const ProviderScope(child: AgroScanApp()));
}
