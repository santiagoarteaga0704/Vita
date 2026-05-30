import 'package:flutter/material.dart';

class TreatmentCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final Map<String, dynamic> data;
  const TreatmentCard({
    super.key,
    required this.title,
    required this.icon,
    required this.color,
    required this.data,
  });

  String _stringify(dynamic v) {
    if (v == null) return '—';
    if (v is List) return v.join(', ');
    return v.toString();
  }

  @override
  Widget build(BuildContext context) {
    final entries = <MapEntry<String, String>>[];
    if (data['method'] != null) entries.add(MapEntry('Método', _stringify(data['method'])));
    if (data['ingredients'] != null) entries.add(MapEntry('Ingredientes', _stringify(data['ingredients'])));
    if (data['actives'] != null) entries.add(MapEntry('Activos', _stringify(data['actives'])));
    if (data['dosage'] != null) entries.add(MapEntry('Dosis', _stringify(data['dosage'])));
    if (data['dosage_per_ha'] != null) entries.add(MapEntry('Dosis/ha', _stringify(data['dosage_per_ha'])));
    if (data['frequency'] != null) entries.add(MapEntry('Frecuencia', _stringify(data['frequency'])));
    if (data['timing'] != null) entries.add(MapEntry('Aplicar', _stringify(data['timing'])));
    if (data['brands'] != null) entries.add(MapEntry('Marcas', _stringify(data['brands'])));
    if (data['notes'] != null) entries.add(MapEntry('Notas', _stringify(data['notes'])));

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: color.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(icon, color: color),
              const SizedBox(width: 8),
              Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
            ]),
            const SizedBox(height: 12),
            ...entries.map((e) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(color: Colors.black87, fontSize: 14),
                      children: [
                        TextSpan(text: '${e.key}: ', style: const TextStyle(fontWeight: FontWeight.w600)),
                        TextSpan(text: e.value),
                      ],
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
