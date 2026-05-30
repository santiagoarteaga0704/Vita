class ScanResult {
  final String scanId;
  final String? pestCommonName;
  final String? pestScientificName;
  final String? severity;
  final int? severityPct;
  final double confidence;
  final Map<String, dynamic>? treatmentOrganic;
  final Map<String, dynamic>? treatmentChemical;
  final String? prevention;
  final String imageUrl;
  final String? visualObservations;
  final DateTime? createdAt;
  final String? crop;

  ScanResult({
    required this.scanId,
    this.pestCommonName,
    this.pestScientificName,
    this.severity,
    this.severityPct,
    required this.confidence,
    this.treatmentOrganic,
    this.treatmentChemical,
    this.prevention,
    required this.imageUrl,
    this.visualObservations,
    this.createdAt,
    this.crop,
  });

  factory ScanResult.fromCreateResponse(Map<String, dynamic> data) {
    final pest = data['detected_pest'] as Map<String, dynamic>?;
    return ScanResult(
      scanId: data['scan_id'] as String,
      pestCommonName: pest?['common_name'] as String?,
      pestScientificName: pest?['scientific_name'] as String?,
      severity: pest?['severity'] as String?,
      severityPct: pest?['severity_pct'] as int?,
      confidence: ((pest?['confidence'] ?? 0) as num).toDouble(),
      treatmentOrganic: data['treatment_organic'] as Map<String, dynamic>?,
      treatmentChemical: data['treatment_chemical'] as Map<String, dynamic>?,
      prevention: data['prevention'] as String?,
      imageUrl: data['image_url'] as String,
      visualObservations: data['visual_observations'] as String?,
    );
  }

  factory ScanResult.fromHistoryItem(Map<String, dynamic> j) => ScanResult(
        scanId: j['id'] as String,
        pestCommonName: j['detected_pest_name'] as String?,
        severity: j['severity'] as String?,
        severityPct: j['severity_pct'] as int?,
        confidence: ((j['confidence'] ?? 0) as num).toDouble(),
        imageUrl: j['image_url'] as String,
        crop: j['crop'] as String?,
        createdAt: j['created_at'] != null ? DateTime.parse(j['created_at']) : null,
      );
}
