import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/api/api_client.dart';
import 'app/app.dart';

void main() {
  // Emulador Android: 10.0.2.2 mapea a localhost de la PC host.
  // Para dispositivo físico, reemplazar por IP local de la PC (ej: http://192.168.1.10:3000)
  // Para producción, usar URL de Railway (ej: https://agroscan-backend.up.railway.app)
  ApiClient.init(baseUrl: 'http://10.0.2.2:3000');
  runApp(const ProviderScope(child: AgroScanApp()));
}
