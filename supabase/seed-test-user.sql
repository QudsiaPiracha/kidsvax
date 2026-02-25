-- Seed data for test user: qudsia+kv1@workhub.ai
-- User ID: 7da6914a-c924-4901-a746-3b80b3b35cff

-- User profile
INSERT INTO public.user_profiles (id, display_name, language, bundesland)
VALUES ('7da6914a-c924-4901-a746-3b80b3b35cff', 'Qudsia', 'en', 'Hessen')
ON CONFLICT (id) DO NOTHING;

-- Child 1: Emma (18 months old)
INSERT INTO public.children (id, user_id, name, date_of_birth, gender, is_premature, allergies)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '7da6914a-c924-4901-a746-3b80b3b35cff',
  'Emma',
  '2024-08-24',
  'female',
  false,
  'None known'
)
ON CONFLICT (id) DO NOTHING;

-- Child 2: Liam (4 years old)
INSERT INTO public.children (id, user_id, name, date_of_birth, gender, is_premature, notes)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000002',
  '7da6914a-c924-4901-a746-3b80b3b35cff',
  'Liam',
  '2022-02-15',
  'male',
  false,
  'Loves dinosaurs'
)
ON CONFLICT (id) DO NOTHING;

-- U-Exam records for Emma (18 months) -- U1-U6 completed, U7 upcoming
INSERT INTO public.u_exam_records (id, child_id, u_exam_id, status, scheduled_date, completed_date, physician_name)
VALUES
  ('bbbbbbbb-0001-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'completed', '2024-08-24', '2024-08-24', 'Dr. Schmidt'),
  ('bbbbbbbb-0001-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'completed', '2024-08-28', '2024-08-29', 'Dr. Schmidt'),
  ('bbbbbbbb-0001-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'completed', '2024-09-24', '2024-09-25', 'Dr. Schmidt'),
  ('bbbbbbbb-0001-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'completed', '2024-11-24', '2024-11-22', 'Dr. Schmidt'),
  ('bbbbbbbb-0001-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'completed', '2025-02-24', '2025-02-20', 'Dr. Schmidt'),
  ('bbbbbbbb-0001-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'completed', '2025-06-24', '2025-06-18', 'Dr. Schmidt'),
  ('bbbbbbbb-0001-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'upcoming', '2026-05-24', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- U-Exam records for Liam (4 years) -- U1-U8 completed, U9 upcoming
INSERT INTO public.u_exam_records (id, child_id, u_exam_id, status, scheduled_date, completed_date, physician_name)
VALUES
  ('bbbbbbbb-0002-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'completed', '2022-02-15', '2022-02-15', 'Dr. Mueller'),
  ('bbbbbbbb-0002-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'completed', '2022-02-20', '2022-02-22', 'Dr. Mueller'),
  ('bbbbbbbb-0002-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'completed', '2022-03-15', '2022-03-18', 'Dr. Mueller'),
  ('bbbbbbbb-0002-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'completed', '2022-05-15', '2022-05-12', 'Dr. Mueller'),
  ('bbbbbbbb-0002-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'completed', '2022-08-15', '2022-08-10', 'Dr. Mueller'),
  ('bbbbbbbb-0002-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'completed', '2022-12-15', '2022-12-20', 'Dr. Mueller'),
  ('bbbbbbbb-0002-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'completed', '2023-11-15', '2023-11-10', 'Dr. Mueller'),
  ('bbbbbbbb-0002-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'completed', '2024-12-15', '2024-12-18', 'Dr. Mueller'),
  ('bbbbbbbb-0002-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', 'upcoming', '2025-12-15', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Vaccination records for Emma -- some completed
INSERT INTO public.vaccination_records (id, child_id, vaccine_id, dose_number, status, scheduled_date, administered_date, physician_name, product_name)
VALUES
  -- Hexavalent dose 1 (2 months)
  ('cccccccc-0001-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 'administered', '2024-10-24', '2024-10-25', 'Dr. Schmidt', 'Infanrix hexa'),
  -- Hexavalent dose 2 (4 months)
  ('cccccccc-0001-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2, 'administered', '2024-12-24', '2024-12-20', 'Dr. Schmidt', 'Infanrix hexa'),
  -- Hexavalent dose 3 (11 months)
  ('cccccccc-0001-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 3, 'administered', '2025-07-24', '2025-07-22', 'Dr. Schmidt', 'Infanrix hexa'),
  -- Pneumokokken dose 1 (2 months)
  ('cccccccc-0001-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1, 'administered', '2024-10-24', '2024-10-25', 'Dr. Schmidt', 'Prevenar 13'),
  -- Pneumokokken dose 2 (4 months)
  ('cccccccc-0001-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 2, 'administered', '2024-12-24', '2024-12-20', 'Dr. Schmidt', 'Prevenar 13'),
  -- Pneumokokken dose 3 (11 months)
  ('cccccccc-0001-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 3, 'administered', '2025-07-24', '2025-07-22', 'Dr. Schmidt', 'Prevenar 13'),
  -- MMR dose 1 (11 months) - completed
  ('cccccccc-0001-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 1, 'administered', '2025-07-24', '2025-07-22', 'Dr. Schmidt', 'Priorix'),
  -- MMR dose 2 (15 months) - overdue!
  ('cccccccc-0001-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 2, 'overdue', '2025-11-24', NULL, NULL, NULL),
  -- Varizellen dose 1 (11 months) - completed
  ('cccccccc-0001-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 1, 'administered', '2025-07-24', '2025-07-22', 'Dr. Schmidt', 'Varivax'),
  -- Varizellen dose 2 (15 months) - overdue!
  ('cccccccc-0001-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 2, 'overdue', '2025-11-24', NULL, NULL, NULL),
  -- Meningokokken C (12 months) - completed
  ('cccccccc-0001-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 1, 'administered', '2025-08-24', '2025-08-20', 'Dr. Schmidt', 'Menjugate')
ON CONFLICT (id) DO NOTHING;

-- Child 3: Maha (13 years old)
INSERT INTO public.children (id, user_id, name, date_of_birth, gender, is_premature, notes)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000003',
  '7da6914a-c924-4901-a746-3b80b3b35cff',
  'Maha',
  '2013-03-15',
  'female',
  false,
  'Plays handball'
)
ON CONFLICT (id) DO NOTHING;

-- U-Exam records for Maha (13 years) -- U1-U11 completed, J1 upcoming, J2 scheduled
INSERT INTO public.u_exam_records (id, child_id, u_exam_id, status, scheduled_date, completed_date, physician_name)
VALUES
  -- U1: at birth
  ('bbbbbbbb-0003-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'completed', '2013-03-15', '2013-03-15', 'Dr. Weber'),
  -- U2: 5 days
  ('bbbbbbbb-0003-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'completed', '2013-03-20', '2013-03-21', 'Dr. Weber'),
  -- U3: 1 month
  ('bbbbbbbb-0003-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'completed', '2013-04-15', '2013-04-18', 'Dr. Weber'),
  -- U4: 3 months
  ('bbbbbbbb-0003-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'completed', '2013-06-15', '2013-06-12', 'Dr. Weber'),
  -- U5: 6 months
  ('bbbbbbbb-0003-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'completed', '2013-09-15', '2013-09-18', 'Dr. Weber'),
  -- U6: 10 months
  ('bbbbbbbb-0003-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'completed', '2014-01-15', '2014-01-20', 'Dr. Weber'),
  -- U7: 21 months
  ('bbbbbbbb-0003-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'completed', '2014-12-15', '2014-12-10', 'Dr. Weber'),
  -- U7a: 34 months
  ('bbbbbbbb-0003-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'completed', '2016-01-15', '2016-01-12', 'Dr. Weber'),
  -- U8: 46 months
  ('bbbbbbbb-0003-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 'completed', '2017-01-15', '2017-01-18', 'Dr. Weber'),
  -- U9: 60 months (5 years)
  ('bbbbbbbb-0003-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'completed', '2018-03-15', '2018-03-20', 'Dr. Weber'),
  -- U10: 84 months (7 years)
  ('bbbbbbbb-0003-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', 'completed', '2020-03-15', '2020-03-18', 'Dr. Weber'),
  -- U11: 108 months (9 years)
  ('bbbbbbbb-0003-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'completed', '2022-03-15', '2022-03-22', 'Dr. Weber'),
  -- J1: 144 months (12 years) - upcoming
  ('bbbbbbbb-0003-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013', 'upcoming', '2025-03-15', NULL, NULL),
  -- J2: 192 months (16 years) - scheduled
  ('bbbbbbbb-0003-0000-0000-000000000014', 'aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000014', 'scheduled', '2029-03-15', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Vaccination records for Maha -- full history for a 13-year-old
INSERT INTO public.vaccination_records (id, child_id, vaccine_id, dose_number, status, scheduled_date, administered_date, physician_name, product_name)
VALUES
  -- Rotavirus dose 1 (1.5 months)
  ('cccccccc-0003-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 1, 'administered', '2013-05-01', '2013-04-28', 'Dr. Weber', 'RotaTeq'),
  -- Rotavirus dose 2 (2 months)
  ('cccccccc-0003-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 2, 'administered', '2013-05-15', '2013-05-12', 'Dr. Weber', 'RotaTeq'),
  -- Hexavalent dose 1 (2 months)
  ('cccccccc-0003-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 1, 'administered', '2013-05-15', '2013-05-15', 'Dr. Weber', 'Infanrix hexa'),
  -- Hexavalent dose 2 (4 months)
  ('cccccccc-0003-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 2, 'administered', '2013-07-15', '2013-07-18', 'Dr. Weber', 'Infanrix hexa'),
  -- Hexavalent dose 3 (11 months)
  ('cccccccc-0003-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 3, 'administered', '2014-02-15', '2014-02-20', 'Dr. Weber', 'Infanrix hexa'),
  -- Pneumokokken dose 1 (2 months)
  ('cccccccc-0003-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 1, 'administered', '2013-05-15', '2013-05-15', 'Dr. Weber', 'Prevenar 13'),
  -- Pneumokokken dose 2 (4 months)
  ('cccccccc-0003-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 2, 'administered', '2013-07-15', '2013-07-18', 'Dr. Weber', 'Prevenar 13'),
  -- Pneumokokken dose 3 (11 months)
  ('cccccccc-0003-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 3, 'administered', '2014-02-15', '2014-02-20', 'Dr. Weber', 'Prevenar 13'),
  -- Meningokokken B dose 1 (2 months)
  ('cccccccc-0003-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 1, 'administered', '2013-05-15', '2013-05-15', 'Dr. Weber', 'Bexsero'),
  -- Meningokokken B dose 2 (4 months)
  ('cccccccc-0003-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 2, 'administered', '2013-07-15', '2013-07-18', 'Dr. Weber', 'Bexsero'),
  -- Meningokokken B dose 3 (12 months)
  ('cccccccc-0003-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 3, 'administered', '2014-03-15', '2014-03-12', 'Dr. Weber', 'Bexsero'),
  -- Meningokokken C (12 months)
  ('cccccccc-0003-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 1, 'administered', '2014-03-15', '2014-03-12', 'Dr. Weber', 'Menjugate'),
  -- MMR dose 1 (11 months)
  ('cccccccc-0003-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 1, 'administered', '2014-02-15', '2014-02-10', 'Dr. Weber', 'Priorix'),
  -- MMR dose 2 (15 months)
  ('cccccccc-0003-0000-0000-000000000014', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 2, 'administered', '2014-06-15', '2014-06-18', 'Dr. Weber', 'Priorix'),
  -- Varizellen dose 1 (11 months)
  ('cccccccc-0003-0000-0000-000000000015', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 1, 'administered', '2014-02-15', '2014-02-10', 'Dr. Weber', 'Varivax'),
  -- Varizellen dose 2 (15 months)
  ('cccccccc-0003-0000-0000-000000000016', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 2, 'administered', '2014-06-15', '2014-06-18', 'Dr. Weber', 'Varivax'),
  -- Tdap-IPV Booster (5-6 years / 60 months)
  ('cccccccc-0003-0000-0000-000000000017', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009', 1, 'administered', '2018-03-15', '2018-03-20', 'Dr. Weber', 'Boostrix Polio'),
  -- HPV dose 1 (9 years / 108 months)
  ('cccccccc-0003-0000-0000-000000000018', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000010', 1, 'administered', '2022-03-15', '2022-03-22', 'Dr. Weber', 'Gardasil 9'),
  -- HPV dose 2 (9.5 years / 114 months)
  ('cccccccc-0003-0000-0000-000000000019', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000010', 2, 'administered', '2022-09-15', '2022-09-20', 'Dr. Weber', 'Gardasil 9'),
  -- MenACWY (12 years / 144 months) - scheduled (due around J1 time)
  ('cccccccc-0003-0000-0000-000000000020', 'aaaaaaaa-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000011', 1, 'scheduled', '2025-03-15', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Growth measurements for Maha (13 years of data)
INSERT INTO public.growth_measurements (id, child_id, measured_date, weight_kg, height_cm, head_circumference_cm)
VALUES
  ('dddddddd-0003-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', '2013-03-15', 3.2, 49.0, 34.5),
  ('dddddddd-0003-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003', '2013-04-18', 4.3, 53.0, 36.5),
  ('dddddddd-0003-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', '2013-09-18', 7.8, 66.0, 42.0),
  ('dddddddd-0003-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000003', '2014-03-12', 9.5, 74.0, 45.5),
  ('dddddddd-0003-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000003', '2015-03-15', 12.0, 88.0, 48.0),
  ('dddddddd-0003-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000003', '2016-03-15', 14.5, 98.0, 49.5),
  ('dddddddd-0003-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000003', '2017-01-18', 17.0, 108.0, 50.5),
  ('dddddddd-0003-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000003', '2018-03-20', 20.5, 118.0, 51.5),
  ('dddddddd-0003-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000003', '2019-03-15', 24.0, 127.0, 52.0),
  ('dddddddd-0003-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000003', '2020-03-18', 28.0, 135.0, 52.5),
  ('dddddddd-0003-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000003', '2021-03-15', 33.0, 143.0, 53.0),
  ('dddddddd-0003-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000003', '2022-03-22', 38.0, 150.0, 53.5),
  ('dddddddd-0003-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000003', '2023-03-15', 43.0, 155.0, 54.0),
  ('dddddddd-0003-0000-0000-000000000014', 'aaaaaaaa-0000-0000-0000-000000000003', '2024-03-15', 47.0, 159.0, 54.5),
  ('dddddddd-0003-0000-0000-000000000015', 'aaaaaaaa-0000-0000-0000-000000000003', '2025-03-15', 50.0, 162.0, 55.0)
ON CONFLICT (id) DO NOTHING;

-- Growth measurements for Emma
INSERT INTO public.growth_measurements (id, child_id, measured_date, weight_kg, height_cm, head_circumference_cm)
VALUES
  ('dddddddd-0001-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '2024-08-24', 3.4, 50.0, 35.0),
  ('dddddddd-0001-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '2024-09-25', 4.5, 54.0, 37.0),
  ('dddddddd-0001-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', '2024-11-22', 6.1, 60.0, 39.5),
  ('dddddddd-0001-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', '2025-02-20', 7.5, 65.0, 42.0),
  ('dddddddd-0001-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', '2025-06-18', 8.8, 72.0, 44.5),
  ('dddddddd-0001-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', '2026-01-15', 10.2, 79.0, 46.0)
ON CONFLICT (id) DO NOTHING;

-- Growth measurements for Liam
INSERT INTO public.growth_measurements (id, child_id, measured_date, weight_kg, height_cm, head_circumference_cm)
VALUES
  ('dddddddd-0002-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', '2022-02-15', 3.6, 51.0, 35.5),
  ('dddddddd-0002-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', '2022-05-12', 6.5, 61.0, 40.0),
  ('dddddddd-0002-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '2023-02-15', 12.0, 86.0, 48.0),
  ('dddddddd-0002-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', '2024-02-15', 15.5, 100.0, 50.0),
  ('dddddddd-0002-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', '2025-02-15', 18.0, 107.0, 51.0)
ON CONFLICT (id) DO NOTHING;
