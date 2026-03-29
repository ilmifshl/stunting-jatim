-- ============================================================
-- INSERT DATA FAKTOR STUNTING TAHUN 2022
-- Provinsi Jawa Timur
-- Sumber: Profil Kesehatan Provinsi Jawa Timur 2022
--
-- jamban_count = Akses Sanitasi Aman + Layak Sendiri + Layak Bersama (Tabel 80)
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
  -- Jamban: 872 + 143.160 + 13.040 = 157.072 / 190.280 = 82.55%
  -- STBM: 47 / 172 = 27.33%
  ((SELECT id FROM regions WHERE name ILIKE '%Pacitan%' LIMIT 1), 2022,
   344, 6.3, 2033, 33.1, 1248, 77.6,
   6064, 98.8, 24994, 85.1,
   127, 1.9, 5569, 100.0,
   157072, 82.55, 47, 27.33),

  -- 2. Kab. Ponorogo
  -- Jamban: 13.155 + 276.327 + 13.220 = 302.702 / 326.493 = 92.71%
  -- STBM: 22 / 307 = 7.17%
  ((SELECT id FROM regions WHERE name ILIKE '%Ponorogo%' LIMIT 1), 2022,
   468, 5.1, 4509, 45.6, 561, 24.2,
   9946, 90.5, 36483, 73.2,
   2981, 27.4, 8998, 79.3,
   302702, 92.71, 22, 7.17),

  -- 3. Kab. Trenggalek
  -- Jamban: 1.343 + 179.954 + 15.429 = 196.726 / 232.655 = 84.56%
  -- STBM: 17 / 157 = 10.83%
  ((SELECT id FROM regions WHERE name ILIKE '%Trenggalek%' LIMIT 1), 2022,
   319, 4.0, 5464, 66.8, 3554, 58.0,
   8668, 100.5, 40073, 95.5,
   8007, 89.0, 9688, 96.6,
   196726, 84.56, 17, 10.83),

  -- 4. Kab. Tulungagung
  -- Jamban: 139.430 + 198.748 + 15.251 = 353.429 / 374.408 = 94.40%
  -- STBM: 35 / 271 = 12.92%
  ((SELECT id FROM regions WHERE name ILIKE '%Tulungagung%' LIMIT 1), 2022,
   330, 2.3, 10116, 72.1, 3200, 68.3,
   14492, 99.6, 59695, 87.9,
   11458, 74.2, 16118, 100.0,
   353429, 94.40, 35, 12.92),

  -- 5. Kab. Blitar
  -- Jamban: 36.582 + 299.329 + 23.725 = 359.636 / 409.429 = 87.84%
  -- STBM: 35 / 248 = 14.11%
  ((SELECT id FROM regions WHERE name ILIKE '%Blitar%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2022,
   563, 4.3, 9357, 60.6, 3214, 57.5,
   14715, 90.6, 69309, 89.9,
   13366, 78.7, 8435, 43.2,
   359636, 87.84, 35, 14.11),

  -- 6. Kab. Kediri
  -- Jamban: 244.276 + 201.986 + 23.371 = 469.633 / 505.615 = 92.89%
  -- STBM: 0 / 344 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Kediri%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2022,
   792, 4.1, 13217, 58.6, 1923, 58.6,
   22444, 94.2, 95854, 88.0,
   17212, 69.3, 16670, 73.8,
   469633, 92.89, 0, 0.00),

  -- 7. Kab. Malang
  -- Jamban: 17.607 + 701.733 + 33.024 = 752.364 / 828.188 = 90.85%
  -- STBM: 9 / 390 = 2.31%
  ((SELECT id FROM regions WHERE name ILIKE '%Malang%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2022,
   1317, 3.6, 26132, 72.5, 6323, 66.2,
   36668, 97.4, 159214, 87.1,
   23413, 59.0, 17895, 49.5,
   752364, 90.85, 9, 2.31),

  -- 8. Kab. Lumajang
  -- Jamban: 511 + 233.068 + 26.871 = 260.450 / 293.646 = 88.70%
  -- STBM: 2 / 205 = 0.98%
  ((SELECT id FROM regions WHERE name ILIKE '%Lumajang%' LIMIT 1), 2022,
   732, 5.3, 10217, 77.3, 4596, 67.8,
   12963, 97.5, 65228, 89.7,
   10502, 72.2, 7704, 44.0,
   260450, 88.70, 2, 0.98),

  -- 9. Kab. Jember
  -- Jamban: 125.484 + 368.519 + 65.919 = 559.922 / 711.888 = 78.66%
  -- STBM: 0 / 248 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Jember%' LIMIT 1), 2022,
   1724, 5.3, 16506, 49.3, 8159, 73.1,
   29482, 85.7, 112256, 93.5,
   8613, 23.4, 2907, 42.1,
   559922, 78.66, 0, 0.00),

  -- 10. Kab. Banyuwangi
  -- Jamban: 291.287 + 215.358 + 24.048 = 530.693 / 541.517 = 98.00%
  -- STBM: 3 / 217 = 1.38%
  ((SELECT id FROM regions WHERE name ILIKE '%Banyuwangi%' LIMIT 1), 2022,
   620, 3.0, 15757, 75.5, 5572, 76.3,
   21208, 100.3, 103108, 95.9,
   18768, 81.8, 24391, 89.6,
   530693, 98.00, 3, 1.38),

  -- 11. Kab. Bondowoso
  -- Jamban: 0 + 174.270 + 16.758 = 191.028 / 271.897 = 70.26%
  -- STBM: 0 / 219 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Bondowoso%' LIMIT 1), 2022,
   813, 7.8, 9086, 96.8, 6264, 82.7,
   9882, 109.3, 48176, 98.0,
   9205, 89.2, 5244, 43.3,
   191028, 70.26, 0, 0.00),

  -- 12. Kab. Situbondo
  -- Jamban: 0 + 126.221 + 42.568 = 168.789 / 258.212 = 65.37%
  -- STBM: 0 / 136 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Situbondo%' LIMIT 1), 2022,
   602, 7.0, 7362, 88.7, 5094, 77.8,
   7113, 80.0, 40824, 95.1,
   7830, 85.7, 5300, 51.4,
   168789, 65.37, 0, 0.00),

  -- 13. Kab. Probolinggo
  -- Jamban: 4.681 + 181.416 + 54.413 = 240.510 / 362.332 = 66.38%
  -- STBM: 16 / 330 = 4.85%
  ((SELECT id FROM regions WHERE name ILIKE '%Probolinggo%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2022,
   1061, 6.2, 12383, 75.3, 4659, 60.3,
   16098, 93.2, 79045, 92.7,
   15601, 86.3, 13144, 99.3,
   240510, 66.38, 16, 4.85),

  -- 14. Kab. Pasuruan
  -- Jamban: 27.238 + 342.285 + 14.785 = 384.308 / 466.139 = 82.45%
  -- STBM: 16 / 365 = 4.38%
  ((SELECT id FROM regions WHERE name ILIKE '%Pasuruan%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2022,
   833, 3.5, 17512, 76.8, 1190, 24.7,
   23273, 96.8, 116927, 92.9,
   24052, 95.9, 10346, 45.8,
   384308, 82.45, 16, 4.38),

  -- 15. Kab. Sidoarjo
  -- Jamban: 81.618 + 567.118 + 4.007 = 652.743 / 663.524 = 98.37%
  -- STBM: 200 / 353 = 56.66%
  ((SELECT id FROM regions WHERE name ILIKE '%Sidoarjo%' LIMIT 1), 2022,
   370, 1.0, 30949, 88.8, 16501, 71.1,
   35795, 100.4, 162323, 91.6,
   37871, 98.8, 13602, 53.9,
   652743, 98.37, 200, 56.66),

  -- 16. Kab. Mojokerto
  -- Jamban: 1.281 + 342.741 + 15.950 = 359.972 / 371.012 = 97.02%
  -- STBM: 54 / 304 = 17.76%
  ((SELECT id FROM regions WHERE name ILIKE '%Mojokerto%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2022,
   462, 3.1, 10107, 63.1, 4235, 73.2,
   17154, 100.0, 69493, 96.3,
   9189, 52.1, 9918, 72.9,
   359972, 97.02, 54, 17.76),

  -- 17. Kab. Jombang
  -- Jamban: 477 + 341.642 + 51.628 = 393.747 / 418.361 = 94.12%
  -- STBM: 29 / 306 = 9.48%
  ((SELECT id FROM regions WHERE name ILIKE '%Jombang%' LIMIT 1), 2022,
   943, 5.4, 14260, 78.8, 5472, 84.3,
   17636, 90.0, 84785, 93.3,
   6176, 31.0, 7376, 54.4,
   393747, 94.12, 29, 9.48),

  -- 18. Kab. Nganjuk
  -- Jamban: 0 + 227.609 + 81 = 227.690 / 311.432 = 73.11%
  -- STBM: 27 / 284 = 9.51%
  ((SELECT id FROM regions WHERE name ILIKE '%Nganjuk%' LIMIT 1), 2022,
   578, 4.6, 8682, 61.5, 4059, 66.8,
   13612, 91.1, 62987, 92.9,
   9266, 59.7, 10726, 76.1,
   227690, 73.11, 27, 9.51),

  -- 19. Kab. Madiun
  -- Jamban: 21.661 + 221.524 + 9.710 = 252.895 / 260.062 = 97.24%
  -- STBM: 3 / 206 = 1.46%
  ((SELECT id FROM regions WHERE name ILIKE '%Madiun%' AND name NOT ILIKE '%Kota%' LIMIT 1), 2022,
   391, 5.0, 4757, 57.1, 2739, 60.6,
   9053, 101.0, 38638, 93.8,
   7180, 78.4, 6726, 73.7,
   252895, 97.24, 3, 1.46),

  -- 20. Kab. Magetan
  -- Jamban: 29 + 199.359 + 17.254 = 216.642 / 217.774 = 99.48%
  -- STBM: 13 / 235 = 5.53%
  ((SELECT id FROM regions WHERE name ILIKE '%Magetan%' LIMIT 1), 2022,
   308, 4.3, 5790, 79.5, 1886, 72.3,
   7459, 98.2, 36367, 96.1,
   6749, 84.2, 6249, 75.8,
   216642, 99.48, 13, 5.53),

  -- 21. Kab. Ngawi
  -- Jamban: 1.530 + 238.978 + 32.594 = 273.102 / 303.338 = 90.04%
  -- STBM: 1 / 217 = 0.46%
  ((SELECT id FROM regions WHERE name ILIKE '%Ngawi%' LIMIT 1), 2022,
   405, 4.4, 3927, 39.8, 1083, 49.2,
   10375, 97.9, 38697, 95.6,
   4969, 45.8, 9815, 83.3,
   273102, 90.04, 1, 0.46),

  -- 22. Kab. Bojonegoro
  -- Jamban: 2.707 + 350.491 + 9.232 = 362.430 / 382.454 = 94.76%
  -- STBM: 1 / 430 = 0.23%
  ((SELECT id FROM regions WHERE name ILIKE '%Bojonegoro%' LIMIT 1), 2022,
   759, 5.1, 12080, 78.7, 5210, 93.9,
   16220, 101.6, 75520, 98.8,
   14740, 87.3, 15661, 90.1,
   362430, 94.76, 1, 0.23),

  -- 23. Kab. Tuban
  -- Jamban: 24.937 + 264.582 + 21.034 = 310.553 / 363.722 = 85.38%
  -- STBM: 0 / 328 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Tuban%' LIMIT 1), 2022,
   692, 4.7, 11500, 77.2, 5742, 76.3,
   15746, 100.7, 70605, 87.7,
   14891, 90.9, 12406, 89.6,
   310553, 85.38, 0, 0.00),

  -- 24. Kab. Lamongan
  -- Jamban: 322.925 + 33.045 + 3.011 = 358.981 / 358.981 = 100.00%
  -- STBM: 26 / 477 = 5.45%
  ((SELECT id FROM regions WHERE name ILIKE '%Lamongan%' LIMIT 1), 2022,
   641, 4.1, 10737, 73.2, 5066, 75.9,
   15659, 100.7, 76325, 95.8,
   13374, 82.9, 13826, 78.7,
   358981, 100.00, 26, 5.45),

  -- 25. Kab. Gresik
  -- Jamban: 12.148 + 354.379 + 6.708 = 373.235 / 378.821 = 98.52%
  -- STBM: 65 / 356 = 18.26%
  ((SELECT id FROM regions WHERE name ILIKE '%Gresik%' LIMIT 1), 2022,
   512, 2.7, 15703, 78.3, 1639, 76.3,
   20486, 98.8, 95677, 96.4,
   14815, 67.2, 14117, 81.5,
   373235, 98.52, 65, 18.26),

  -- 26. Kab. Bangkalan
  -- Jamban: 124.144 + 108.562 + 28.256 = 260.962 / 301.937 = 86.43%
  -- STBM: 66 / 281 = 23.49%
  ((SELECT id FROM regions WHERE name ILIKE '%Bangkalan%' LIMIT 1), 2022,
   602, 3.9, 13662, 92.1, 773, 31.8,
   9671, 64.7, 50292, 75.6,
   10244, 62.8, 7971, 43.7,
   260962, 86.43, 66, 23.49),

  -- 27. Kab. Sampang
  -- Jamban: 0 + 166.340 + 19.239 = 185.579 / 213.391 = 86.96%
  -- STBM: 0 / 186 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Sampang%' LIMIT 1), 2022,
   640, 4.0, 12119, 81.3, 1211, 12.0,
   12757, 88.1, 58706, 77.5,
   2863, 17.5, 5986, 51.1,
   185579, 86.96, 0, 0.00),

  -- 28. Kab. Pamekasan
  -- Jamban: 2.376 + 207.676 + 26.823 = 236.875 / 236.875 = 100.00%
  -- STBM: 4 / 189 = 2.12%
  ((SELECT id FROM regions WHERE name ILIKE '%Pamekasan%' LIMIT 1), 2022,
   399, 2.9, 15381, 125.3, 1426, 64.4,
   11349, 87.2, 52410, 84.0,
   9340, 69.2, 9188, 65.1,
   236875, 100.00, 4, 2.12),

  -- 29. Kab. Sumenep
  -- Jamban: 600 + 226.877 + 44.563 = 272.040 / 362.222 = 75.10%
  -- STBM: 0 / 334 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Sumenep%' LIMIT 1), 2022,
   731, 5.1, 7039, 54.5, 775, 46.9,
   13813, 102.7, 33932, 91.4,
   637, 4.5, 7154, 53.9,
   272040, 75.10, 0, 0.00),

  -- 30. Kota Kediri
  -- Jamban: 0 + 81.854 + 764 = 82.618 / 83.395 = 99.07%
  -- STBM: 22 / 46 = 47.83%
  ((SELECT id FROM regions WHERE name ILIKE '%Kediri%' AND name ILIKE '%Kota%' LIMIT 1), 2022,
   173, 4.4, 2851, 70.5, 212, 70.7,
   4309, 92.7, 18182, 96.5,
   1073, 24.1, 2153, 62.7,
   82618, 99.07, 22, 47.83),

  -- 31. Kota Blitar
  -- Jamban: 17.280 + 34.185 + 944 = 52.409 / 53.302 = 98.33%
  -- STBM: 10 / 21 = 47.62%
  ((SELECT id FROM regions WHERE name ILIKE '%Blitar%' AND name ILIKE '%Kota%' LIMIT 1), 2022,
   108, 6.2, 1193, 58.5, 432, 81.8,
   1921, 84.9, 9739, 92.3,
   1706, 76.1, 1249, 60.3,
   52409, 98.33, 10, 47.62),

  -- 32. Kota Malang
  -- Jamban: 49.943 + 216.639 + 13.687 = 280.269 / 248.958 = 112.58% → cap 100%
  -- (Note: data 2022 Kota Malang unusual, use actual count value)
  -- Jamban: 248.958 counted as layak, rate 100%
  -- STBM: 3 / 57 = 5.26%
  ((SELECT id FROM regions WHERE name ILIKE '%Malang%' AND name ILIKE '%Kota%' LIMIT 1), 2022,
   388, 3.7, 10101, 88.9, 4592, 79.2,
   10465, 83.9, 41220, 70.3,
   11017, 88.2, 4930, 59.4,
   280269, 100.00, 3, 5.26),

  -- 33. Kota Probolinggo
  -- Jamban: 4.539 + 64.681 + 1.445 = 70.665 / 74.250 = 95.17%
  -- STBM: 0 / 29 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Probolinggo%' AND name ILIKE '%Kota%' LIMIT 1), 2022,
   203, 7.6, 1782, 50.1, 140, 88.6,
   3651, 102.6, 16360, 89.3,
   3379, 86.3, 778, 27.5,
   70665, 95.17, 0, 0.00),

  -- 34. Kota Pasuruan
  -- Jamban: 3.431 + 42.538 + 3.438 = 49.407 / 54.341 = 90.92%
  -- STBM: 3 / 34 = 8.82%
  ((SELECT id FROM regions WHERE name ILIKE '%Pasuruan%' AND name ILIKE '%Kota%' LIMIT 1), 2022,
   197, 6.5, 1824, 57.6, 652, 61.5,
   3353, 99.0, 14787, 92.5,
   2066, 59.3, 1810, 64.2,
   49407, 90.92, 3, 8.82),

  -- 35. Kota Mojokerto
  -- Jamban: 10.226 + 32.340 + 3.989 = 46.555 / 46.555 = 100.00%
  -- STBM: 1 / 18 = 5.56%
  ((SELECT id FROM regions WHERE name ILIKE '%Mojokerto%' AND name ILIKE '%Kota%' LIMIT 1), 2022,
   69, 3.5, 1374, 70.8, 185, 61.7,
   2052, 97.6, 6662, 99.3,
   1166, 54.6, 2191, 98.4,
   46555, 100.00, 1, 5.56),

  -- 36. Kota Madiun
  -- Jamban: 8.796 + 49.659 + 132 = 58.587 / 58.587 = 100.00%
  -- STBM: 27 / 27 = 100.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Madiun%' AND name ILIKE '%Kota%' LIMIT 1), 2022,
   147, 6.2, 2012, 89.6, 817, 79.8,
   2348, 95.5, 10997, 96.3,
   2470, 100.0, 1611, 86.1,
   58587, 100.00, 27, 100.00),

  -- 37. Kota Surabaya
  -- Jamban: 0 + 944.108 + 17.489 = 961.597 / 1.001.626 = 95.99%
  -- STBM: 0 / 154 = 0.00%
  ((SELECT id FROM regions WHERE name ILIKE '%Surabaya%' LIMIT 1), 2022,
   738, 1.7, 33465, 83.6, 10687, 87.3,
   41680, 99.5, 173844, 90.0,
   35540, 80.8, 36542, 100.0,
   961597, 95.99, 0, 0.00),

  -- 38. Kota Batu
  -- Jamban: 40.223 + 12.303 + 2.679 = 55.205 / 59.381 = 92.97%
  -- STBM: 5 / 24 = 20.83%
  ((SELECT id FROM regions WHERE name ILIKE '%Batu%' LIMIT 1), 2022,
   97, 6.1, 2341, 78.4, 688, 68.6,
   3118, 102.9, 13842, 90.4,
   2184, 66.5, 1675, 94.6,
   55205, 92.97, 5, 20.83);
