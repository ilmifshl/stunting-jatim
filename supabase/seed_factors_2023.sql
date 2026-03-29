-- ============================================================
-- INSERT DATA FAKTOR STUNTING TAHUN 2023
-- Provinsi Jawa Timur
-- Sumber: Profil Kesehatan Provinsi Jawa Timur 2023
--
-- jamban_count = Aman + Layak Sendiri + Layak Bersama
-- jamban_rate  = (jamban_count / Total KK) * 100%
-- stbm_count   = Jumlah Desa Lulus 5 Pilar STBM (Tabel 81)
-- stbm_rate    = (stbm_count / Total Desa) * 100%
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
  -- Jamban: 3.965 + 142.377 + 13.049 = 159.391 / 194.733 = 81.85%
  -- STBM: 55 desa / 172 = 31.98%
  ((SELECT id FROM regions WHERE name ILIKE '%Pacitan%' LIMIT 1), 2023,
   349, 15.6, 2066, 90.5, 2503, 56.5,
   5568, 89.6, 23976, 81.9,
   2750, 41.2, 4388, 100.0,
   159391, 81.85, 55, 31.98),

  -- 2. Kab. Ponorogo
  -- Jamban: 18.548 + 282.753 + 13.310 = 314.611 / 328.238 = 95.85%
  -- STBM: 29 / 307 = 9.45%
  ((SELECT id FROM regions WHERE name ILIKE '%Ponorogo%' LIMIT 1), 2023,
   491, 5.6, 2879, 29.4, 4514, 84.2,
   9586, 89.4, 31066, 68.9,
   9637, 89.6, 9762, 83.3,
   314611, 95.85, 29, 9.45),

  -- 3. Kab. Trenggalek
  -- Jamban: 0 + 194.853 + 12.561 = 207.414 / 234.004 = 88.64%
  -- STBM: 36 / 157 = 22.93%
  ((SELECT id FROM regions WHERE name ILIKE '%Trenggalek%' LIMIT 1), 2023,
   376, 4.9, 5164, 63.7, 3147, 60.9,
   8062, 95.8, 38329, 91.8,
   7627, 85.6, 9213, 93.8,
   207414, 88.64, 36, 22.93),

  -- 4. Kab. Tulungagung
  -- Jamban: 212.151 + 142.672 + 21.283 = 376.106 / 383.073 = 98.18%
  -- STBM: 86 / 271 = 31.73%
  ((SELECT id FROM regions WHERE name ILIKE '%Tulungagung%' LIMIT 1), 2023,
   420, 3.1, 782, 5.6, 4418, 62.0,
   13646, 95.8, 61370, 94.8,
   11152, 72.7, 15120, 96.6,
   376106, 98.18, 86, 31.73),

  -- 5. Kab. Blitar
  -- Jamban: 2.775 + 345.632 + 19.846 = 368.253 / 459.648 = 80.12%
  -- STBM: 35 / 248 = 14.11%
  ((SELECT id FROM regions WHERE name ILIKE '%Blitar%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2023,
   634, 5.9, 9587, 62.6, 3534, 57.3,
   14932, 94.1, 70473, 92.0,
   11775, 69.9, 11135, 73.7,
   368253, 80.12, 35, 14.11),

  -- 6. Kab. Kediri
  -- Jamban: 23.224 + 398.980 + 42.990 = 465.194 / 512.329 = 90.80%
  -- STBM: 16 / 344 = 4.65%
  ((SELECT id FROM regions WHERE name ILIKE '%Kediri%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2023,
   734, 4.1, 13911, 75.5, 6546, 71.4,
   21735, 93.1, 100230, 88.5,
   18480, 74.9, 18405, 85.5,
   465194, 90.80, 16, 4.65),

  -- 7. Kab. Malang
  -- Jamban: 16.911 + 800.616 + 29.955 = 847.482 / 926.452 = 91.48%
  -- STBM: 8 / 390 = 2.05%
  ((SELECT id FROM regions WHERE name ILIKE '%Malang%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2023,
   1402, 4.0, 27909, 84.2, 22729, 68.6,
   35140, 95.1, 173815, 93.0,
   31398, 79.5, 24735, 63.3,
   847482, 91.48, 8, 2.05),

  -- 8. Kab. Lumajang
  -- Jamban: 907 + 249.520 + 21.118 = 271.545 / 311.816 = 87.09%
  -- STBM: 0 / 205 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Lumajang%' LIMIT 1), 2023,
   729, 6.0, 10832, 82.6, 4973, 59.1,
   12366, 95.2, 62689, 92.7,
   11489, 79.6, 8636, 48.6,
   271545, 87.09, 0, 0.00),

  -- 9. Kab. Jember
  -- Jamban: 0 + 460.404 + 94.712 = 555.116 / 730.663 = 75.97%
  -- STBM: 0 / 248 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Jember%' LIMIT 1), 2023,
   2035, 6.4, 22369, 70.0, 10862, 67.0,
   30125, 89.4, 143189, 83.6,
   29052, 79.3, 17021, 56.6,
   555116, 75.97, 0, 0.00),

  -- 10. Kab. Banyuwangi
  -- Jamban: 291.332 + 215.358 + 24.018 = 530.708 / 541.517 = 98.00%
  -- STBM: 3 / 217 = 1.38%
  ((SELECT id FROM regions WHERE name ILIKE '%Banyuwangi%' LIMIT 1), 2023,
   614, 3.1, 16149, 78.0, 6218, 82.0,
   20154, 97.6, 101919, 95.5,
   19495, 85.6, 24332, 91.8,
   530708, 98.00, 3, 1.38),

  -- 11. Kab. Bondowoso
  -- Jamban: 25.463 + 165.351 + 62.309 = 253.123 / 272.970 = 92.73%
  -- STBM: 0 / 219 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Bondowoso%' LIMIT 1), 2023,
   825, 8.5, 8802, 90.5, 6784, 82.6,
   9365, 106.0, 49434, 102.8,
   9121, 88.9, 6460, 60.8,
   253123, 92.73, 0, 0.00),

  -- 12. Kab. Situbondo
  -- Jamban: 0 + 136.704 + 56.241 = 192.945 / 207.989 = 92.77%
  -- STBM: 0 / 136 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Situbondo%' LIMIT 1), 2023,
   584, 7.0, 6693, 81.1, 5987, 137.2,
   8231, 94.4, 41916, 98.4,
   7676, 84.5, 7561, 75.1,
   192945, 92.77, 0, 0.00),

  -- 13. Kab. Probolinggo
  -- Jamban: 0 + 194.457 + 58.561 = 253.018 / 362.814 = 69.74%
  -- STBM: 29 / 330 = 8.79%
  ((SELECT id FROM regions WHERE name ILIKE '%Probolinggo%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2023,
   1058, 6.3, 11379, 69.4, 10685, 65.9,
   15606, 91.9, 79328, 93.9,
   14721, 81.7, 12310, 86.3,
   253018, 69.74, 29, 8.79),

  -- 14. Kab. Pasuruan
  -- Jamban: 32.673 + 356.494 + 22.160 = 411.327 / 464.669 = 88.52%
  -- STBM: 12 / 365 = 3.29%
  ((SELECT id FROM regions WHERE name ILIKE '%Pasuruan%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2023,
   1025, 4.7, 18038, 79.1, 21783, 77.8,
   22340, 94.3, 114665, 97.5,
   23413, 93.4, 13961, 71.6,
   411327, 88.52, 12, 3.29),

  -- 15. Kab. Sidoarjo
  -- Jamban: 100.919 + 563.283 + 2.214 = 666.416 / 673.026 = 99.02%
  -- STBM: 240 / 346 = 69.36%
  ((SELECT id FROM regions WHERE name ILIKE '%Sidoarjo%' LIMIT 1), 2023,
   595, 1.6, 31547, 87.9, 12707, 77.0,
   35902, 101.4, 172859, 95.4,
   38307, 99.1, 17156, 72.2,
   666416, 99.02, 240, 69.36),

  -- 16. Kab. Mojokerto
  -- Jamban: 1.568 + 345.219 + 11.272 = 358.059 / 363.543 = 98.49%
  -- STBM: 67 / 304 = 22.04%
  ((SELECT id FROM regions WHERE name ILIKE '%Mojokerto%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2023,
   548, 4.7, 10779, 90.4, 3608, 81.8,
   16073, 95.1, 65060, 84.1,
   15028, 85.3, 11424, 83.1,
   358059, 98.49, 67, 22.04),

  -- 17. Kab. Jombang
  -- Jamban: 2.639 + 377.262 + 32.388 = 412.289 / 416.456 = 99.00%
  -- STBM: 44 / 306 = 14.38%
  ((SELECT id FROM regions WHERE name ILIKE '%Jombang%' LIMIT 1), 2023,
   1045, 6.2, 12803, 91.5, 6422, 98.3,
   17055, 88.7, 79311, 89.2,
   12693, 64.1, 9553, 60.2,
   412289, 99.00, 44, 14.38),

  -- 18. Kab. Nganjuk
  -- Jamban: 0 + 259.182 + 721 = 259.903 / 323.955 = 80.23%
  -- STBM: 41 / 284 = 14.44%
  ((SELECT id FROM regions WHERE name ILIKE '%Nganjuk%' LIMIT 1), 2023,
   637, 5.1, 9472, 76.6, 2362, 41.1,
   13057, 89.3, 62079, 86.0,
   7797, 50.6, 10640, 75.2,
   259903, 80.23, 41, 14.44),

  -- 19. Kab. Madiun
  -- Jamban: 22.495 + 233.388 + 7.904 = 263.787 / 267.014 = 98.79%
  -- STBM: 12 / 206 = 5.83%
  ((SELECT id FROM regions WHERE name ILIKE '%Madiun%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2023,
   417, 5.5, 4836, 58.7, 3083, 73.4,
   8563, 97.8, 35412, 83.3,
   7180, 79.2, 7315, 77.6,
   263787, 98.79, 12, 5.83),

  -- 20. Kab. Magetan
  -- Jamban: 9.238 + 210.075 + 5.040 = 224.353 / 227.095 = 98.79%
  -- STBM: 21 / 235 = 8.94%
  ((SELECT id FROM regions WHERE name ILIKE '%Magetan%' LIMIT 1), 2023,
   386, 7.9, 4823, 86.5, 2263, 57.2,
   6910, 87.7, 35485, 97.1,
   6202, 78.3, 6488, 81.2,
   224353, 98.79, 21, 8.94),

  -- 21. Kab. Ngawi
  -- Jamban: 4.859 + 265.339 + 17.333 = 287.531 / 303.716 = 94.67%
  -- STBM: 12 / 217 = 5.53%
  ((SELECT id FROM regions WHERE name ILIKE '%Ngawi%' LIMIT 1), 2023,
   450, 7.2, 4324, 44.3, 1314, 59.6,
   9977, 96.4, 43546, 86.5,
   8667, 80.7, 9830, 87.5,
   287531, 94.67, 12, 5.53),

  -- 22. Kab. Bojonegoro
  -- Jamban: 3.914 + 368.611 + 7.266 = 379.791 / 385.688 = 98.47%
  -- STBM: 1 / 430 = 0.23%
  ((SELECT id FROM regions WHERE name ILIKE '%Bojonegoro%' LIMIT 1), 2023,
   833, 5.7, 12782, 91.2, 5623, 95.5,
   15610, 100.0, 74433, 97.7,
   13943, 83.3, 15910, 99.5,
   379791, 98.47, 1, 0.23),

  -- 23. Kab. Tuban
  -- Jamban: 0 + 306.013 + 24.502 = 330.515 / 361.929 = 91.32%
  -- STBM: 0 / 328 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Tuban%' LIMIT 1), 2023,
   742, 5.1, 10767, 82.2, 7746, 82.3,
   15352, 100.2, 71927, 95.7,
   14606, 89.6, 13654, 86.3,
   330515, 91.32, 0, 0.00),

  -- 24. Kab. Lamongan
  -- Jamban: 259.812 + 39.372 + 0 = 299.184 / 341.004 = 87.74%
  -- STBM: 39 / 474 = 8.23%
  ((SELECT id FROM regions WHERE name ILIKE '%Lamongan%' LIMIT 1), 2023,
   737, 6.5, 10262, 86.4, 6006, 75.9,
   14938, 98.3, 70841, 95.7,
   14224, 88.9, 13161, 81.2,
   299184, 87.74, 39, 8.23),

  -- 25. Kab. Gresik
  -- Jamban: 15.296 + 365.507 + 5.483 = 386.286 / 391.183 = 98.75%
  -- STBM: 71 / 356 = 19.94%
  ((SELECT id FROM regions WHERE name ILIKE '%Gresik%' LIMIT 1), 2023,
   562, 2.9, 15268, 75.9, 17713, 78.9,
   19693, 96.1, 92377, 90.5,
   16225, 73.3, 15020, 88.4,
   386286, 98.75, 71, 19.94),

  -- 26. Kab. Bangkalan
  -- Jamban: 124.535 + 121.608 + 27.001 = 273.144 / 303.807 = 89.91%
  -- STBM: 82 / 281 = 29.18%
  ((SELECT id FROM regions WHERE name ILIKE '%Bangkalan%' LIMIT 1), 2023,
   471, 4.1, 11491, 77.6, 1333, 49.4,
   9303, 63.3, 42748, 56.0,
   12441, 76.3, 7845, 47.7,
   273144, 89.91, 82, 29.18),

  -- 27. Kab. Sampang
  -- Jamban: 0 + 164.048 + 23.223 = 187.271 / 215.138 = 87.05%
  -- STBM: 0 / 186 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Sampang%' LIMIT 1), 2023,
   713, 5.2, 13788, 92.8, 2228, 40.5,
   11923, 83.5, 64805, 84.0,
   13889, 84.4, 7522, 69.4,
   187271, 87.05, 0, 0.00),

  -- 28. Kab. Pamekasan
  -- Jamban: 1.946 + 226.846 + 25.599 = 254.391 / 254.391 = 100.00%
  -- STBM: 19 / 189 = 10.05%
  ((SELECT id FROM regions WHERE name ILIKE '%Pamekasan%' LIMIT 1), 2023,
   400, 3.0, 14193, 115.4, 2272, 73.2,
   11485, 89.4, 53709, 84.7,
   12092, 89.4, 7931, 66.0,
   254391, 100.00, 19, 10.05),

  -- 29. Kab. Sumenep
  -- Jamban: 600 + 226.877 + 44.446 = 271.923 / 362.222 = 75.07%
  -- STBM: 0 / 334 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Sumenep%' LIMIT 1), 2023,
   695, 4.9, 8684, 90.3, 3069, 80.8,
   13275, 100.8, 54747, 92.0,
   4597, 32.6, 9128, 65.3,
   271923, 75.07, 0, 0.00),

  -- 30. Kota Kediri
  -- Jamban: 0 + 80.252 + 1.464 = 81.716 / 81.732 = 99.98%
  -- STBM: 19 / 46 = 41.30%
  ((SELECT id FROM regions WHERE name ILIKE '%Kediri%' AND name ILIKE '%Kota%' LIMIT 1), 2023,
   216, 5.4, 4037, 100.0, 1731, 65.4,
   4209, 93.5, 16025, 81.1,
   3963, 89.2, 2640, 85.3,
   81716, 99.98, 19, 41.30),

  -- 31. Kota Blitar
  -- Jamban: 16.603 + 36.229 + 934 = 53.766 / 54.646 = 98.39%
  -- STBM: 10 / 21 = 47.62%
  ((SELECT id FROM regions WHERE name ILIKE '%Blitar%' AND name ILIKE '%Kota%' LIMIT 1), 2023,
   91, 4.4, 1553, 74.0, 438, 84.7,
   2164, 97.3, 9163, 91.3,
   2217, 99.2, 1506, 79.9,
   53766, 98.39, 10, 47.62),

  -- 32. Kota Malang
  -- Jamban: 75.846 + 157.656 + 0 = 233.502 / 254.811 = 91.64%
  -- STBM: 6 / 57 = 10.53%
  ((SELECT id FROM regions WHERE name ILIKE '%Malang%' AND name ILIKE '%Kota%' LIMIT 1), 2023,
   501, 4.3, 10834, 95.6, 4522, 81.3,
   10946, 89.2, 41296, 70.7,
   11606, 93.1, 8002, 82.1,
   233502, 91.64, 6, 10.53),

  -- 33. Kota Probolinggo
  -- Jamban: 5.691 + 72.490 + 1.506 = 79.687 / 81.299 = 98.02%
  -- STBM: 0 / 29 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Probolinggo%' AND name ILIKE '%Kota%' LIMIT 1), 2023,
   108, 3.2, 1946, 69.0, 290, 34.7,
   3353, 90.8, 14026, 76.4,
   3426, 87.4, 2024, 60.2,
   79687, 98.02, 0, 0.00),

  -- 34. Kota Pasuruan
  -- Jamban: 5.926 + 43.375 + 3.204 = 52.505 / 54.341 = 96.62%
  -- STBM: 8 / 34 = 23.53%
  ((SELECT id FROM regions WHERE name ILIKE '%Pasuruan%' AND name ILIKE '%Kota%' LIMIT 1), 2023,
   204, 6.5, 2475, 78.2, 1129, 73.1,
   3232, 96.9, 14232, 87.2,
   3290, 94.5, 2047, 82.3,
   52505, 96.62, 8, 23.53),

  -- 35. Kota Mojokerto
  -- Jamban: 12.739 + 30.429 + 4.530 = 47.698 / 47.697 = 100.00%
  -- STBM: 18 / 18 = 100.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Mojokerto%' AND name ILIKE '%Kota%' LIMIT 1), 2023,
   88, 4.7, 1825, 94.1, 280, 90.0,
   2038, 98.3, 6336, 70.4,
   2033, 95.3, 2248, 93.4,
   47698, 100.00, 18, 100.00),

  -- 36. Kota Madiun
  -- Jamban: 19.017 + 39.866 + 0 = 58.883 / 58.883 = 100.00%
  -- STBM: 27 / 27 = 100.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Madiun%' AND name ILIKE '%Kota%' LIMIT 1), 2023,
   126, 5.5, 2132, 95.7, 670, 72.1,
   2363, 98.3, 10354, 90.2,
   2449, 100.0, 1483, 80.4,
   58883, 100.00, 27, 100.00),

  -- 37. Kota Surabaya
  -- Jamban: 134.524 + 859.170 + 17.489 = 1.011.183 / 1.011.183 = 100.00%
  -- STBM: 0 / 153 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Surabaya%' LIMIT 1), 2023,
   1418, 3.4, 36484, 91.5, 16845, 81.9,
   41683, 101.2, 195332, 95.0,
   44057, 100.4, 43753, 100.0,
   1011183, 100.00, 0, 0.00),

  -- 38. Kota Batu
  -- Jamban: 43.937 + 5.692 + 190 = 49.819 / 52.012 = 95.78%
  -- STBM: 15 / 24 = 62.50%
  ((SELECT id FROM regions WHERE name ILIKE '%Batu%' LIMIT 1), 2023,
   219, 7.9, 2210, 74.1, 1203, 73.3,
   2620, 85.6, 12780, 83.1,
   2709, 82.5, 1750, 72.7,
   49819, 95.78, 15, 62.50);