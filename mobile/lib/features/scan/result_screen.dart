import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/models/scan.dart';
import '../../shared/widgets/severity_badge.dart';
import '../../shared/widgets/treatment_card.dart';

class ResultScreen extends StatelessWidget {
  final ScanResult scan;
  const ResultScreen({super.key, required this.scan});

  @override
  Widget build(BuildContext context) {
    final identified = scan.pestCommonName != null;
    return Scaffold(
      appBar: AppBar(title: const Text('Resultado')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(scan.imageUrl, fit: BoxFit.cover),
              ),
            ),
            const SizedBox(height: 16),
            if (identified) ...[
              Text(
                scan.pestCommonName!,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              if (scan.pestScientificName != null)
                Text(
                  scan.pestScientificName!,
                  style: const TextStyle(
                    fontStyle: FontStyle.italic,
                    color: Colors.grey,
                  ),
                ),
              const SizedBox(height: 12),
              Row(
                children: [
                  SeverityBadge(severity: scan.severity, pct: scan.severityPct),
                  const SizedBox(width: 12),
                  Text(
                    'Confianza ${(scan.confidence * 100).round()}%',
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                ],
              ),
              if (scan.visualObservations != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    scan.visualObservations!,
                    style: TextStyle(color: Colors.grey.shade800),
                  ),
                ),
              const SizedBox(height: 24),
              if (scan.treatmentOrganic != null)
                TreatmentCard(
                  title: 'Tratamiento orgánico',
                  icon: Icons.eco,
                  color: Colors.green.shade700,
                  data: scan.treatmentOrganic!,
                ),
              const SizedBox(height: 12),
              if (scan.treatmentChemical != null)
                TreatmentCard(
                  title: 'Tratamiento químico',
                  icon: Icons.science,
                  color: Colors.blue.shade700,
                  data: scan.treatmentChemical!,
                ),
              const SizedBox(height: 12),
              if (scan.prevention != null)
                Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.grey.shade300),
                  ),
                  elevation: 0,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.shield_outlined),
                            SizedBox(width: 8),
                            Text(
                              'Prevención',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(scan.prevention!),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.amber.shade700, size: 18),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Esta es una orientación. Ante duda, consultá con un agrónomo.',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              const SizedBox(height: 32),
              const Icon(Icons.help_outline, size: 64, color: Colors.amber),
              const SizedBox(height: 12),
              const Text(
                'No pudimos identificar la plaga con certeza',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Probá con otra foto más cercana y con buena luz. O contactá a un ingeniero agrónomo.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ],
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Volver al inicio'),
            ),
          ],
        ),
      ),
    );
  }
}
