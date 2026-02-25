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

-- Growth measurements for Emma
INSERT INTO public.growth_measurements (id, child_id, measurement_date, weight_kg, height_cm, head_circumference_cm)
VALUES
  ('dddddddd-0001-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '2024-08-24', 3.4, 50.0, 35.0),
  ('dddddddd-0001-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '2024-09-25', 4.5, 54.0, 37.0),
  ('dddddddd-0001-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', '2024-11-22', 6.1, 60.0, 39.5),
  ('dddddddd-0001-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', '2025-02-20', 7.5, 65.0, 42.0),
  ('dddddddd-0001-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', '2025-06-18', 8.8, 72.0, 44.5),
  ('dddddddd-0001-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', '2026-01-15', 10.2, 79.0, 46.0)
ON CONFLICT (id) DO NOTHING;

-- Growth measurements for Liam
INSERT INTO public.growth_measurements (id, child_id, measurement_date, weight_kg, height_cm, head_circumference_cm)
VALUES
  ('dddddddd-0002-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', '2022-02-15', 3.6, 51.0, 35.5),
  ('dddddddd-0002-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', '2022-05-12', 6.5, 61.0, 40.0),
  ('dddddddd-0002-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '2023-02-15', 12.0, 86.0, 48.0),
  ('dddddddd-0002-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', '2024-02-15', 15.5, 100.0, 50.0),
  ('dddddddd-0002-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', '2025-02-15', 18.0, 107.0, 51.0)
ON CONFLICT (id) DO NOTHING;
