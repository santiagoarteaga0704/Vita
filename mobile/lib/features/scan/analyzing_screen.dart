import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/scan_service.dart';

class AnalyzingScreen extends ConsumerStatefulWidget {
  final File image;
  final String crop;
  const AnalyzingScreen({super.key, required this.image, required this.crop});

  @override
  ConsumerState<AnalyzingScreen> createState() => _AnalyzingScreenState();
}

class _AnalyzingScreenState extends ConsumerState<AnalyzingScreen> {
  String? _error;

  @override
  void initState() {
    super.initState();
    _run();
  }

  Future<void> _run() async {
    try {
      final svc = ScanService();
      final result = await svc.submitScan(
        imageFile: widget.image,
        crop: widget.crop,
      );
      if (mounted) Navigator.of(context).pop(result);
    } catch (_) {
      if (mounted) {
        setState(() => _error = 'No se pudo analizar. Intentá de nuevo.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: _error == null
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 200,
                      height: 200,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.file(widget.image, fit: BoxFit.cover),
                      ),
                    ),
                    const SizedBox(height: 32),
                    const CircularProgressIndicator(),
                    const SizedBox(height: 16),
                    const Text(
                      'Identificando plaga...',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Comparando con catálogo de plagas locales',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                )
              : Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, color: Colors.red, size: 64),
                      const SizedBox(height: 16),
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Volver'),
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
