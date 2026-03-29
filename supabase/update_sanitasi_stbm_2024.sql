-- ============================================================
-- UPDATE DATA SANITASI & STBM TAHUN 2024
-- Mengoreksi nilai jamban_count, jamban_rate, stbm_count, stbm_rate
--
-- Metodologi Baru (berdasarkan panduan):
--
-- SANITASI (Tabel 81):
--   jamban_count = KK Akses Sanitasi Aman + KK Layak Sendiri + KK Layak Bersama
--   jamban_rate  = (jamban_count / Total KK) * 100%
--
-- STBM (Tabel 82 & file stbm 2024.md):
--   stbm_count = Jumlah Desa/Kelurahan Lulus 5 Pilar STBM
--   stbm_rate  = (stbm_count / Total Desa) * 100%
-- ============================================================

-- 1. Kab. Pacitan
-- Sanitasi: Aman=4.070 + Layak Sendiri=159.752 + Layak Bersama=9.290 = 173.112 / 194.892 = 88.83%
-- STBM: 82 desa lulus / 172 total desa = 47.67%
UPDATE stunting_factors
SET jamban_count=173112, jamban_rate=88.83, stbm_count=82, stbm_rate=47.67
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Pacitan%' LIMIT 1);

-- 2. Kab. Ponorogo
-- Sanitasi: 23.792 + 288.961 + 12.709 = 325.462 / 335.313 = 97.07%
-- STBM: 57 / 307 = 18.57%
UPDATE stunting_factors
SET jamban_count=325462, jamban_rate=97.07, stbm_count=57, stbm_rate=18.57
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Ponorogo%' LIMIT 1);

-- 3. Kab. Trenggalek
-- Sanitasi: 0 + 202.262 + 12.887 = 215.149 / 241.359 = 89.14%
-- STBM: 52 / 157 = 33.12%
UPDATE stunting_factors
SET jamban_count=215149, jamban_rate=89.14, stbm_count=52, stbm_rate=33.12
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Trenggalek%' LIMIT 1);

-- 4. Kab. Tulungagung
-- Sanitasi: 24.316 + 310.714 + 17.252 = 352.282 / 375.351 = 93.86%
-- STBM: 40 / 271 = 14.76%
UPDATE stunting_factors
SET jamban_count=352282, jamban_rate=93.86, stbm_count=40, stbm_rate=14.76
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Tulungagung%' LIMIT 1);

-- 5. Kab. Blitar
-- Sanitasi: 8.919 + 381.191 + 19.863 = 409.973 / 459.648 = 89.19%
-- STBM: 52 / 248 = 20.97%
UPDATE stunting_factors
SET jamban_count=409973, jamban_rate=89.19, stbm_count=52, stbm_rate=20.97
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Blitar%' AND name NOT ILIKE '%Kota%' LIMIT 1);

-- 6. Kab. Kediri
-- Sanitasi: 6.623 + 434.331 + 23.712 = 464.666 / 527.153 = 88.15%
-- STBM: 18 / 344 = 5.23%
UPDATE stunting_factors
SET jamban_count=464666, jamban_rate=88.15, stbm_count=18, stbm_rate=5.23
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Kediri%' AND name NOT ILIKE '%Kota%' LIMIT 1);

-- 7. Kab. Malang
-- Sanitasi: 36.564 + 725.142 + 29.353 = 791.059 / 853.974 = 92.63%
-- STBM: 78 / 390 = 20.00%
UPDATE stunting_factors
SET jamban_count=791059, jamban_rate=92.63, stbm_count=78, stbm_rate=20.00
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Malang%' AND name NOT ILIKE '%Kota%' LIMIT 1);

-- 8. Kab. Lumajang
-- Sanitasi: 4.134 + 256.419 + 23.533 = 284.086 / 323.677 = 87.77%
-- STBM: 4 / 205 = 1.95%
UPDATE stunting_factors
SET jamban_count=284086, jamban_rate=87.77, stbm_count=4, stbm_rate=1.95
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Lumajang%' LIMIT 1);

-- 9. Kab. Jember
-- Sanitasi: 25.100 + 524.309 + 102.772 = 652.181 / 766.666 = 85.07%
-- STBM: 0 / 248 = 0.00%
UPDATE stunting_factors
SET jamban_count=652181, jamban_rate=85.07, stbm_count=0, stbm_rate=0.00
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Jember%' LIMIT 1);

-- 10. Kab. Banyuwangi
-- Sanitasi: 17.336 + 514.128 + 30.266 = 561.730 / 571.939 = 98.22%
-- STBM: 4 / 217 = 1.84%
UPDATE stunting_factors
SET jamban_count=561730, jamban_rate=98.22, stbm_count=4, stbm_rate=1.84
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Banyuwangi%' LIMIT 1);

-- 11. Kab. Bondowoso
-- Sanitasi: 7.419 + 208.713 + 34.418 = 250.550 / 274.788 = 91.18%
-- STBM: 2 / 219 = 0.91%
UPDATE stunting_factors
SET jamban_count=250550, jamban_rate=91.18, stbm_count=2, stbm_rate=0.91
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Bondowoso%' LIMIT 1);

-- 12. Kab. Situbondo
-- Sanitasi: 0 + 476.444 + 224.275 = 700.719 / 700.719 = 100.00%
-- STBM: 0 / 136 = 0.00%
UPDATE stunting_factors
SET jamban_count=700719, jamban_rate=100.00, stbm_count=0, stbm_rate=0.00
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Situbondo%' LIMIT 1);

-- 13. Kab. Probolinggo
-- Sanitasi: 0 + 235.946 + 65.437 = 301.383 / 369.893 = 81.48%
-- STBM: 117 / 330 = 35.45%
UPDATE stunting_factors
SET jamban_count=301383, jamban_rate=81.48, stbm_count=117, stbm_rate=35.45
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Probolinggo%' AND name NOT ILIKE '%Kota%' LIMIT 1);

-- 14. Kab. Pasuruan
-- Sanitasi: 36.968 + 364.933 + 30.129 = 432.030 / 464.616 = 92.99%
-- STBM: 81 / 365 = 22.19%
UPDATE stunting_factors
SET jamban_count=432030, jamban_rate=92.99, stbm_count=81, stbm_rate=22.19
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Pasuruan%' AND name NOT ILIKE '%Kota%' LIMIT 1);

-- 15. Kab. Sidoarjo
-- Sanitasi: 87.256 + 452.099 + 1.982 = 541.337 / 544.104 = 99.49%
-- STBM: 243 / 346 = 70.23%
UPDATE stunting_factors
SET jamban_count=541337, jamban_rate=99.49, stbm_count=243, stbm_rate=70.23
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Sidoarjo%' LIMIT 1);

-- 16. Kab. Mojokerto
-- Sanitasi: 2.430 + 341.901 + 7.142 = 351.473 / 351.860 = 99.89%
-- STBM: 67 / 304 = 22.04%
UPDATE stunting_factors
SET jamban_count=351473, jamban_rate=99.89, stbm_count=67, stbm_rate=22.04
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Mojokerto%' AND name NOT ILIKE '%Kota%' LIMIT 1);

-- 17. Kab. Jombang
-- Sanitasi: 19.940 + 406.987 + 6.687 = 433.614 / 433.909 = 99.93%
-- STBM: 29 / 306 = 9.48%
UPDATE stunting_factors
SET jamban_count=433614, jamban_rate=99.93, stbm_count=29, stbm_rate=9.48
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Jombang%' LIMIT 1);

-- 18. Kab. Nganjuk
-- Sanitasi: 5.663 + 280.336 + 2.041 = 288.040 / 330.752 = 87.09%
-- STBM: 52 / 284 = 18.31%
UPDATE stunting_factors
SET jamban_count=288040, jamban_rate=87.09, stbm_count=52, stbm_rate=18.31
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Nganjuk%' LIMIT 1);

-- 19. Kab. Madiun
-- Sanitasi: 30.276 + 229.341 + 7.549 = 267.166 / 269.469 = 99.14%
-- STBM: 16 / 206 = 7.77%
UPDATE stunting_factors
SET jamban_count=267166, jamban_rate=99.14, stbm_count=16, stbm_rate=7.77
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Madiun%' AND name NOT ILIKE '%Kota%' LIMIT 1);

-- 20. Kab. Magetan
-- Sanitasi: 415 + 224.936 + 6.220 = 231.571 / 232.956 = 99.41%
-- STBM: 40 / 235 = 17.02%
UPDATE stunting_factors
SET jamban_count=231571, jamban_rate=99.41, stbm_count=40, stbm_rate=17.02
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Magetan%' LIMIT 1);

-- 21. Kab. Ngawi
-- Sanitasi: 9.937 + 285.796 + 16.230 = 311.963 / 328.605 = 94.94%
-- STBM: 27 / 217 = 12.44%
UPDATE stunting_factors
SET jamban_count=311963, jamban_rate=94.94, stbm_count=27, stbm_rate=12.44
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Ngawi%' LIMIT 1);

-- 22. Kab. Bojonegoro
-- Sanitasi: 3.616 + 378.485 + 6.348 = 388.449 / 388.449 = 100.00%
-- STBM: 1 / 430 = 0.23%
UPDATE stunting_factors
SET jamban_count=388449, jamban_rate=100.00, stbm_count=1, stbm_rate=0.23
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Bojonegoro%' LIMIT 1);

-- 23. Kab. Tuban
-- Sanitasi: 6.006 + 316.742 + 21.083 = 343.831 / 365.717 = 94.01%
-- STBM: 11 / 328 = 3.35%
UPDATE stunting_factors
SET jamban_count=343831, jamban_rate=94.01, stbm_count=11, stbm_rate=3.35
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Tuban%' LIMIT 1);

-- 24. Kab. Lamongan
-- Sanitasi: 31.742 + 325.116 + 11.492 = 368.350 / 368.350 = 100.00%
-- STBM: 49 / 474 = 10.34%
UPDATE stunting_factors
SET jamban_count=368350, jamban_rate=100.00, stbm_count=49, stbm_rate=10.34
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Lamongan%' LIMIT 1);

-- 25. Kab. Gresik
-- Sanitasi: 27.132 + 361.241 + 5.066 = 393.439 / 398.532 = 98.72%
-- STBM: 78 / 356 = 21.91%
UPDATE stunting_factors
SET jamban_count=393439, jamban_rate=98.72, stbm_count=78, stbm_rate=21.91
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Gresik%' LIMIT 1);

-- 26. Kab. Bangkalan
-- Sanitasi: 10.636 + 242.230 + 27.414 = 280.280 / 306.744 = 91.37%
-- STBM: 109 / 281 = 38.79%
UPDATE stunting_factors
SET jamban_count=280280, jamban_rate=91.37, stbm_count=109, stbm_rate=38.79
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Bangkalan%' LIMIT 1);

-- 27. Kab. Sampang
-- Sanitasi: 0 + 190.906 + 22.406 = 213.312 / 213.312 = 100.00%
-- STBM: 0 / 186 = 0.00%
UPDATE stunting_factors
SET jamban_count=213312, jamban_rate=100.00, stbm_count=0, stbm_rate=0.00
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Sampang%' LIMIT 1);

-- 28. Kab. Pamekasan
-- Sanitasi: 3.424 + 225.758 + 19.743 = 248.925 / 248.925 = 100.00%
-- STBM: 49 / 189 = 25.93%
UPDATE stunting_factors
SET jamban_count=248925, jamban_rate=100.00, stbm_count=49, stbm_rate=25.93
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Pamekasan%' LIMIT 1);

-- 29. Kab. Sumenep
-- Sanitasi: 3.473 + 252.900 + 61.975 = 318.348 / 363.052 = 87.69%
-- STBM: 5 / 334 = 1.50%
UPDATE stunting_factors
SET jamban_count=318348, jamban_rate=87.69, stbm_count=5, stbm_rate=1.50
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Sumenep%' LIMIT 1);

-- 30. Kota Kediri
-- Sanitasi: 10.801 + 65.607 + 1.516 = 77.924 / 78.293 = 99.53%
-- STBM: 19 / 46 = 41.30%
UPDATE stunting_factors
SET jamban_count=77924, jamban_rate=99.53, stbm_count=19, stbm_rate=41.30
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Kediri%' AND name ILIKE '%Kota%' LIMIT 1);

-- 31. Kota Blitar
-- Sanitasi: 6.255 + 47.016 + 934 = 54.205 / 55.085 = 98.40%
-- STBM: 10 / 21 = 47.62%
UPDATE stunting_factors
SET jamban_count=54205, jamban_rate=98.40, stbm_count=10, stbm_rate=47.62
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Blitar%' AND name ILIKE '%Kota%' LIMIT 1);

-- 32. Kota Malang
-- Sanitasi: 47.967 + 187.492 + 0 = 235.459 / 254.843 = 92.39%
-- STBM: 8 / 57 = 14.04%
UPDATE stunting_factors
SET jamban_count=235459, jamban_rate=92.39, stbm_count=8, stbm_rate=14.04
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Malang%' AND name ILIKE '%Kota%' LIMIT 1);

-- 33. Kota Probolinggo
-- Sanitasi: 6.051 + 73.293 + 894 = 80.238 / 81.299 = 98.70%
-- STBM: 0 / 29 = 0.00%
UPDATE stunting_factors
SET jamban_count=80238, jamban_rate=98.70, stbm_count=0, stbm_rate=0.00
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Probolinggo%' AND name ILIKE '%Kota%' LIMIT 1);

-- 34. Kota Pasuruan
-- Sanitasi: 6.212 + 47.318 + 3.071 = 56.601 / 56.601 = 100.00%
-- STBM: 18 / 34 = 52.94%
UPDATE stunting_factors
SET jamban_count=56601, jamban_rate=100.00, stbm_count=18, stbm_rate=52.94
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Pasuruan%' AND name ILIKE '%Kota%' LIMIT 1);

-- 35. Kota Mojokerto
-- Sanitasi: 13.786 + 30.971 + 3.123 = 47.880 / 47.880 = 100.00%
-- STBM: 14 / 18 = 77.78%
UPDATE stunting_factors
SET jamban_count=47880, jamban_rate=100.00, stbm_count=14, stbm_rate=77.78
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Mojokerto%' AND name ILIKE '%Kota%' LIMIT 1);

-- 36. Kota Madiun
-- Sanitasi: 4.843 + 52.546 + 685 = 58.074 / 58.074 = 100.00%
-- STBM: 27 / 27 = 100.00%
UPDATE stunting_factors
SET jamban_count=58074, jamban_rate=100.00, stbm_count=27, stbm_rate=100.00
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Madiun%' AND name ILIKE '%Kota%' LIMIT 1);

-- 37. Kota Surabaya
-- Sanitasi: 138.903 + 847.567 + 17.574 = 1.004.044 / 1.004.044 = 100.00%
-- STBM: 128 / 153 = 83.66%
UPDATE stunting_factors
SET jamban_count=1004044, jamban_rate=100.00, stbm_count=128, stbm_rate=83.66
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Surabaya%' LIMIT 1);

-- 38. Kota Batu
-- Sanitasi: 21.200 + 41.385 + 1.134 = 63.719 / 72.675 = 87.68%
-- STBM: 0 / 24 = 0.00%
UPDATE stunting_factors
SET jamban_count=63719, jamban_rate=87.68, stbm_count=0, stbm_rate=0.00
WHERE year=2024 AND region_id=(SELECT id FROM regions WHERE name ILIKE '%Batu%' LIMIT 1);
