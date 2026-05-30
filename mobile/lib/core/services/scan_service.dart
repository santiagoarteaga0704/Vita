import 'dart:io';
import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../models/scan.dart';

class ScanService {
  Future<ScanResult> submitScan({
    required File imageFile,
    required String crop,
    double? gpsLat,
    double? gpsLng,
    String? clientId,
  }) async {
    final form = FormData.fromMap({
      'image': await MultipartFile.fromFile(imageFile.path, filename: 'scan.jpg'),
      'crop': crop,
      if (gpsLat != null) 'gps_lat': gpsLat,
      if (gpsLng != null) 'gps_lng': gpsLng,
      if (clientId != null) 'client_id': clientId,
    });
    final res = await ApiClient.dio.post('/scans', data: form);
    return ScanResult.fromCreateResponse(res.data['data'] as Map<String, dynamic>);
  }

  Future<List<ScanResult>> myScans({int page = 1, int limit = 20}) async {
    final res = await ApiClient.dio.get(
      '/scans/me',
      queryParameters: {'page': page, 'limit': limit},
    );
    final list = res.data['data']['scans'] as List;
    return list
        .map((j) => ScanResult.fromHistoryItem(j as Map<String, dynamic>))
        .toList();
  }
}
