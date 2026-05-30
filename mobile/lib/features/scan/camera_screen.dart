import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../auth/auth_provider.dart';
import 'analyzing_screen.dart';

class CameraScreen extends ConsumerStatefulWidget {
  const CameraScreen({super.key});
  @override
  ConsumerState<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends ConsumerState<CameraScreen> {
  final _picker = ImagePicker();
  File? _image;
  late String _crop;

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
  void initState() {
    super.initState();
    _crop = ref.read(currentUserProvider).valueOrNull?.cropMain ?? 'soya';
  }

  Future<void> _takePhoto() async {
    final x = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 2000,
      imageQuality: 85,
    );
    if (x != null) setState(() => _image = File(x.path));
  }

  Future<void> _pickFromGallery() async {
    final x = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 2000,
      imageQuality: 85,
    );
    if (x != null) setState(() => _image = File(x.path));
  }

  Future<void> _analyze() async {
    if (_image == null) return;
    final result = await Navigator.of(context).push<dynamic>(
      MaterialPageRoute(
        builder: (_) => AnalyzingScreen(image: _image!, crop: _crop),
      ),
    );
    if (result != null && mounted) {
      context.pushReplacement('/result', extra: result);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escanear planta')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: _image == null
                      ? const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.local_florist, size: 80, color: Colors.grey),
                              SizedBox(height: 12),
                              Padding(
                                padding: EdgeInsets.symmetric(horizontal: 24),
                                child: Text(
                                  'Acercá la hoja afectada al centro del cuadro',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 14),
                                ),
                              ),
                            ],
                          ),
                        )
                      : ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.file(_image!, fit: BoxFit.cover),
                        ),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _crop,
                decoration: const InputDecoration(
                  labelText: 'Cultivo',
                  border: OutlineInputBorder(),
                ),
                items: _crops
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (v) => setState(() => _crop = v!),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.photo_library),
                      label: const Text('Galería'),
                      onPressed: _pickFromGallery,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Cámara'),
                      onPressed: _takePhoto,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _image == null ? null : _analyze,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade700,
                  foregroundColor: Colors.white,
                ),
                child: const Text('ANALIZAR', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
