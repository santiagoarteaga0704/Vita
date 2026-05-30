import 'package:flutter/material.dart';

class SeverityBadge extends StatelessWidget {
  final String? severity;
  final int? pct;
  const SeverityBadge({super.key, this.severity, this.pct});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (severity) {
      case 'low':
        color = Colors.green;
        label = 'BAJA';
        break;
      case 'medium':
        color = Colors.orange;
        label = 'MEDIA';
        break;
      case 'high':
        color = Colors.red;
        label = 'ALTA';
        break;
      default:
        color = Colors.grey;
        label = 'N/A';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color),
      ),
      child: Text(
        pct != null ? '$label · $pct%' : label,
        style: TextStyle(color: color, fontWeight: FontWeight.bold),
      ),
    );
  }
}
