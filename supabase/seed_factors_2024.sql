-- ============================================================
-- INSERT DATA FAKTOR STUNTING TAHUN 2024
-- Provinsi Jawa Timur
-- Sumber: Profil Kesehatan Provinsi Jawa Timur 2024
--
-- Kolom yang diisi per wilayah:
--   bblr_count  = Jumlah bayi BBLR + Prematur (L+P)
--   bblr_rate   = % BBLR dari total ditimbang (L+P)
--   imd_count   = Jumlah bayi dapat IMD
--   imd_rate    = % IMD dari total bayi baru lahir
--   asi_count   = Jumlah bayi diberi ASI eksklusif < 6 bulan
--   asi_rate    = % ASI eksklusif
--   idl_count   = Jumlah bayi IDL (L+P)
--   idl_rate    = % IDL dari sasaran bayi
--   vita_count  = Jumlah balita 6-59 bulan dapat Vit A
--   vita_rate   = % cakupan Vit A (6-59 bln)
--   ttd_count   = Jumlah ibu hamil mendapat TTD (90 tablet)
--   ttd_rate    = % mendapat TTD dari total ibu hamil
--   catin_count = Jumlah catin dapat layanan kesehatan (L+P)
--   catin_rate  = % catin laykes dari total terdaftar
--   jamban_count= Jumlah KK dengan akses jamban sehat (layak sendiri + bersama)
--   jamban_rate = % akses jamban sehat dari total KK
--   stbm_count  = Jumlah KK SBS (Stop BABS) — pilar 1 STBM
--   stbm_rate   = % KK SBS dari total KK
-- ============================================================

INSERT INTO stunting_factors (
  region_id, year,
  bblr_count, bblr_rate, imd_count, imd_rate, asi_count, asi_rate,
  idl_count, idl_rate, vita_count, vita_rate,
  ttd_count, ttd_rate, catin_count, catin_rate,
  jamban_count, jamban_rate, stbm_count, stbm_rate
)
VALUES
  -- 1. Kab. Pacitan
  ((SELECT id FROM regions WHERE name ILIKE '%Pacitan%' LIMIT 1), 2024,
   317, 6.4, 3343, 48.7, 5056, 81.3,
   5221, 77.2, 27369, 82.0,
   4602, 63.3, 4683, 100.0,
   163822, 84.06, 194892, 100.0),

  -- 2. Kab. Ponorogo
  ((SELECT id FROM regions WHERE name ILIKE '%Ponorogo%' LIMIT 1), 2024,
   450, 5.7, 6519, 54.8, 4792, 81.6,
   8947, 76.2, 43263, 76.3,
   8274, 66.0, 9635, 84.3,
   312753, 93.28, 335313, 100.0),

  -- 3. Kab. Trenggalek
  ((SELECT id FROM regions WHERE name ILIKE '%Trenggalek%' LIMIT 1), 2024,
   384, 5.6, 4468, 47.4, 3628, 69.3,
   7820, 83.9, 38044, 83.6,
   6642, 66.1, 9031, 95.7,
   202262, 83.80, 241359, 100.0),

  -- 4. Kab. Tulungagung
  ((SELECT id FROM regions WHERE name ILIKE '%Tulungagung%' LIMIT 1), 2024,
   390, 3.1, 12461, 84.2, 2622, 75.8,
   13480, 92.3, 57214, 82.0,
   12394, 79.3, 14326, 96.7,
   335030, 89.26, 375351, 100.0),

  -- 5. Kab. Blitar
  ((SELECT id FROM regions WHERE name ILIKE '%Blitar%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2024,
   577, 3.4, 9292, 54.0, 5572, 85.7,
   12848, 75.6, 64857, 82.1,
   10765, 57.8, 13019, 86.1,
   390110, 84.87, 459648, 100.0),

  -- 6. Kab. Kediri
  ((SELECT id FROM regions WHERE name ILIKE '%Kediri%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2024,
   754, 4.7, 11693, 46.7, 12070, 70.9,
   20539, 83.2, 91426, 78.5,
   17468, 64.8, 17650, 89.5,
   440954, 83.65, 527153, 100.0),

  -- 7. Kab. Malang
  ((SELECT id FROM regions WHERE name ILIKE '%Malang%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2024,
   1513, 4.4, 30065, 75.2, 9412, 78.9,
   33748, 85.5, 162930, 88.0,
   40134, 94.7, 28385, 74.0,
   761706, 89.19, 853974, 100.0),

  -- 8. Kab. Lumajang
  ((SELECT id FROM regions WHERE name ILIKE '%Lumajang%' LIMIT 1), 2024,
   662, 5.4, 10297, 64.3, 7000, 85.3,
   12534, 79.4, 63358, 83.8,
   11923, 70.5, 9790, 62.7,
   260553, 80.50, 323677, 100.0),

  -- 9. Kab. Jember
  ((SELECT id FROM regions WHERE name ILIKE '%Jember%' LIMIT 1), 2024,
   2114, 7.0, 30902, 80.0, 21053, 94.2,
   28580, 75.3, 143226, 83.1,
   25450, 62.3, 20595, 71.1,
   549409, 71.66, 766666, 100.0),

  -- 10. Kab. Banyuwangi
  ((SELECT id FROM regions WHERE name ILIKE '%Banyuwangi%' LIMIT 1), 2024,
   656, 3.8, 14694, 59.1, 8714, 85.5,
   19661, 80.4, 95959, 82.7,
   19110, 72.4, 26786, 95.2,
   531464, 92.92, 571939, 100.0),

  -- 11. Kab. Bondowoso
  ((SELECT id FROM regions WHERE name ILIKE '%Bondowoso%' LIMIT 1), 2024,
   874, 9.2, 8336, 72.1, 6523, 91.1,
   9129, 80.6, 48331, 88.4,
   8950, 72.6, 8050, 80.6,
   216132, 78.65, 274788, 100.0),

  -- 12. Kab. Situbondo
  ((SELECT id FROM regions WHERE name ILIKE '%Situbondo%' LIMIT 1), 2024,
   502, 6.3, 6517, 65.1, 6597, 81.8,
   8743, 89.0, 39897, 87.1,
   7838, 75.9, 8057, 86.7,
   476444, 68.0, 700719, 100.0),

  -- 13. Kab. Probolinggo
  ((SELECT id FROM regions WHERE name ILIKE '%Probolinggo%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2024,
   1159, 7.4, 10564, 60.5, 11253, 71.1,
   16539, 96.5, 75093, 88.8,
   14835, 81.2, 10745, 80.4,
   235946, 63.79, 369893, 100.0),

  -- 14. Kab. Pasuruan
  ((SELECT id FROM regions WHERE name ILIKE '%Pasuruan%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2024,
   970, 4.2, 16888, 72.6, 8232, 80.1,
   22249, 97.1, 109044, 94.7,
   23067, 93.5, 23614, 72.5,
   401901, 86.51, 464616, 100.0),

  -- 15. Kab. Sidoarjo
  ((SELECT id FROM regions WHERE name ILIKE '%Sidoarjo%' LIMIT 1), 2024,
   634, 2.0, 26281, 89.5, 13090, 86.9,
   29711, 102.3, 142341, 97.6,
   31464, 100.5, 19745, 83.2,
   539355, 99.13, 544104, 100.0),

  -- 16. Kab. Mojokerto
  ((SELECT id FROM regions WHERE name ILIKE '%Mojokerto%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2024,
   524, 3.3, 12244, 76.6, 3815, 93.3,
   14876, 94.4, 68787, 86.5,
   14453, 86.5, 22616, 90.6,
   344331, 97.86, 351860, 100.0),

  -- 17. Kab. Jombang
  ((SELECT id FROM regions WHERE name ILIKE '%Jombang%' LIMIT 1), 2024,
   886, 5.8, 11970, 59.2, 6147, 89.4,
   16831, 84.4, 74551, 79.0,
   15588, 72.4, 11546, 73.2,
   426927, 98.40, 433909, 100.0),

  -- 18. Kab. Nganjuk
  ((SELECT id FROM regions WHERE name ILIKE '%Nganjuk%' LIMIT 1), 2024,
   571, 5.2, 10200, 65.2, 813, 78.9,
   12534, 81.4, 60042, 81.5,
   9937, 60.1, 10930, 77.0,
   285999, 86.47, 330752, 100.0),

  -- 19. Kab. Madiun
  ((SELECT id FROM regions WHERE name ILIKE '%Madiun%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2024,
   470, 6.9, 5593, 57.8, 3586, 71.7,
   8068, 84.6, 35485, 77.6,
   6707, 65.0, 7129, 80.4,
   259617, 96.35, 269469, 100.0),

  -- 20. Kab. Magetan
  ((SELECT id FROM regions WHERE name ILIKE '%Magetan%' LIMIT 1), 2024,
   371, 6.3, 4154, 47.5, 3084, 82.8,
   6515, 75.4, 32561, 77.3,
   5040, 53.0, 6064, 84.1,
   225351, 96.74, 232956, 100.0),

  -- 21. Kab. Ngawi
  ((SELECT id FROM regions WHERE name ILIKE '%Ngawi%' LIMIT 1), 2024,
   443, 5.5, 4566, 40.7, 4237, 63.8,
   9653, 87.2, 42804, 79.7,
   8211, 69.7, 10468, 100.0,
   295733, 90.0, 328605, 100.0),

  -- 22. Kab. Bojonegoro
  ((SELECT id FROM regions WHERE name ILIKE '%Bojonegoro%' LIMIT 1), 2024,
   823, 6.2, 12204, 74.4, 4658, 95.2,
   15378, 95.0, 68753, 85.4,
   12772, 74.6, 16946, 100.0,
   382101, 98.36, 388449, 100.0),

  -- 23. Kab. Tuban
  ((SELECT id FROM regions WHERE name ILIKE '%Tuban%' LIMIT 1), 2024,
   908, 6.7, 11597, 73.5, 6096, 89.8,
   14999, 96.4, 66942, 88.8,
   13594, 81.4, 13213, 91.6,
   322748, 88.25, 365717, 100.0),

  -- 24. Kab. Lamongan
  ((SELECT id FROM regions WHERE name ILIKE '%Lamongan%' LIMIT 1), 2024,
   778, 5.8, 9652, 52.1, 5998, 83.2,
   14482, 79.2, 70804, 81.3,
   14360, 73.8, 14344, 89.8,
   356858, 96.88, 368350, 100.0),

  -- 25. Kab. Gresik
  ((SELECT id FROM regions WHERE name ILIKE '%Gresik%' LIMIT 1), 2024,
   561, 3.4, 14200, 73.4, 8016, 81.2,
   18808, 98.8, 89040, 94.1,
   16764, 83.3, 15849, 96.1,
   388373, 97.45, 398532, 100.0),

  -- 26. Kab. Bangkalan
  ((SELECT id FROM regions WHERE name ILIKE '%Bangkalan%' LIMIT 1), 2024,
   328, 2.1, 11575, 61.4, 1862, 70.8,
   14685, 79.5, 50750, 67.4,
   13739, 71.2, 9965, 61.3,
   252866, 82.44, 306744, 100.0),

  -- 27. Kab. Sampang
  ((SELECT id FROM regions WHERE name ILIKE '%Sampang%' LIMIT 1), 2024,
   593, 3.8, 12542, 65.1, 15386, 67.4,
   12640, 66.9, 68643, 79.3,
   17515, 88.4, 3334, 24.4,
   190906, 89.50, 213312, 100.0),

  -- 28. Kab. Pamekasan
  ((SELECT id FROM regions WHERE name ILIKE '%Pamekasan%' LIMIT 1), 2024,
   364, 2.7, 11233, 77.4, 3658, 80.1,
   11928, 83.7, 60090, 87.9,
   13704, 89.8, 10404, 89.5,
   229182, 92.07, 248925, 100.0),

  -- 29. Kab. Sumenep
  ((SELECT id FROM regions WHERE name ILIKE '%Sumenep%' LIMIT 1), 2024,
   849, 6.0, 11681, 69.1, 12368, 74.8,
   14042, 84.5, 60230, 78.9,
   13199, 73.4, 10111, 69.8,
   256373, 70.62, 363052, 100.0),

  -- 30. Kota Kediri
  ((SELECT id FROM regions WHERE name ILIKE '%Kediri%' AND name ILIKE '%Kota%' LIMIT 1), 2024,
   178, 4.9, 2195, 49.7, 1777, 74.6,
   4004, 91.7, 15643, 79.5,
   3792, 81.0, 2830, 95.7,
   76408, 97.60, 78293, 100.0),

  -- 31. Kota Blitar
  ((SELECT id FROM regions WHERE name ILIKE '%Blitar%' AND name ILIKE '%Kota%' LIMIT 1), 2024,
   74, 3.1, 1810, 83.4, 549, 95.6,
   2198, 102.7, 8973, 86.9,
   2356, 100.7, 1518, 86.4,
   53271, 96.71, 55085, 100.0),

  -- 32. Kota Malang
  ((SELECT id FROM regions WHERE name ILIKE '%Malang%' AND name ILIKE '%Kota%' LIMIT 1), 2024,
   440, 3.9, 9128, 78.3, 4788, 91.5,
   10847, 94.1, 37755, 67.2,
   10990, 89.8, 7711, 86.6,
   235459, 92.39, 254843, 100.0),

  -- 33. Kota Probolinggo
  ((SELECT id FROM regions WHERE name ILIKE '%Probolinggo%' AND name ILIKE '%Kota%' LIMIT 1), 2024,
   235, 8.2, 2260, 58.9, 814, 90.4,
   3895, 103.3, 13485, 73.0,
   3784, 92.4, 1670, 60.5,
   79344, 97.59, 81299, 100.0),

  -- 34. Kota Pasuruan
  ((SELECT id FROM regions WHERE name ILIKE '%Pasuruan%' AND name ILIKE '%Kota%' LIMIT 1), 2024,
   255, 7.3, 2922, 83.7, 1477, 67.3,
   3416, 99.3, 13569, 80.7,
   3764, 99.0, 2100, 85.8,
   53530, 94.58, 56601, 100.0),

  -- 35. Kota Mojokerto
  ((SELECT id FROM regions WHERE name ILIKE '%Mojokerto%' AND name ILIKE '%Kota%' LIMIT 1), 2024,
   95, 4.9, 1968, 106.0, 362, 85.2,
   1930, 105.1, 6135, 68.9,
   1986, 100.1, 2264, 99.9,
   44757, 93.47, 47880, 100.0),

  -- 36. Kota Madiun
  ((SELECT id FROM regions WHERE name ILIKE '%Madiun%' AND name ILIKE '%Kota%' LIMIT 1), 2024,
   137, 4.8, 2284, 84.9, 773, 84.5,
   2649, 99.6, 8165, 67.9,
   2861, 100.0, 1803, 90.8,
   57389, 98.82, 58074, 100.0),

  -- 37. Kota Surabaya
  ((SELECT id FROM regions WHERE name ILIKE '%Surabaya%' LIMIT 1), 2024,
   1157, 3.1, 34308, 94.8, 35370, 86.5,
   36919, 103.0, 175166, 93.9,
   37390, 100.0, 43065, 100.0,
   986470, 98.25, 1004044, 100.0),

  -- 38. Kota Batu
  ((SELECT id FROM regions WHERE name ILIKE '%Batu%' LIMIT 1), 2024,
   234, 8.7, 2231, 70.8, 675, 88.6,
   2657, 85.4, 13056, 84.0,
   2692, 77.8, 1879, 83.9,
   62585, 86.12, 72675, 100.0);
