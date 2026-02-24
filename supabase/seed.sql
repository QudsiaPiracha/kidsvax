-- =============================================================================
-- KidsVax Seed Data
-- =============================================================================
-- Idempotent seed script: INSERT ... ON CONFLICT DO NOTHING
-- All reference data for U-exams, vaccines, schedule rules, and milestones
-- Bilingual: English (EN) and German (DE)
-- Deterministic UUIDs for reproducibility
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. U-Exams (20 entries: U1-U11, J1-J2, Z1-Z6)
-- ---------------------------------------------------------------------------
-- UUID pattern: 00000000-0000-0000-0000-0000000000XX
-- recommended_age_months is integer (schema constraint)
-- tolerance_from_months and tolerance_to_months are numeric
-- ---------------------------------------------------------------------------

INSERT INTO public.u_exams (id, name, category, recommended_age_months, tolerance_from_months, tolerance_to_months, description_en, description_de)
VALUES
  -- U-Exams (category: u_exam)
  ('00000000-0000-0000-0000-000000000001', 'U1', 'u_exam', 0, 0, 0.25,
   'Newborn examination at birth - initial health screening',
   'Neugeborenen-Erstuntersuchung bei Geburt - erste Gesundheitsvorsorge'),

  ('00000000-0000-0000-0000-000000000002', 'U2', 'u_exam', 0, 0.1, 0.33,
   'Newborn examination at 3-10 days - metabolic screening and organ check',
   'Neugeborenen-Basisuntersuchung am 3.-10. Lebenstag - Stoffwechselscreening und Organuntersuchung'),

  ('00000000-0000-0000-0000-000000000003', 'U3', 'u_exam', 1, 0.75, 2,
   'Examination at 4-5 weeks - hip ultrasound, reflexes, development check',
   'Untersuchung in der 4.-5. Lebenswoche - Hueftultraschall, Reflexe, Entwicklungskontrolle'),

  ('00000000-0000-0000-0000-000000000004', 'U4', 'u_exam', 3, 2, 4.5,
   'Examination at 3-4 months - motor development, social behavior, nutrition',
   'Untersuchung im 3.-4. Lebensmonat - Motorische Entwicklung, Sozialverhalten, Ernaehrung'),

  ('00000000-0000-0000-0000-000000000005', 'U5', 'u_exam', 6, 5, 8,
   'Examination at 6-7 months - motor skills, grasping, sensory development',
   'Untersuchung im 6.-7. Lebensmonat - Motorik, Greifentwicklung, Sinnesentwicklung'),

  ('00000000-0000-0000-0000-000000000006', 'U6', 'u_exam', 10, 9, 14,
   'Examination at 10-12 months - standing, first words, stranger anxiety',
   'Untersuchung im 10.-12. Lebensmonat - Stehen, erste Worte, Fremdeln'),

  ('00000000-0000-0000-0000-000000000007', 'U7', 'u_exam', 21, 20, 27,
   'Examination at 21-24 months - walking, language development, social play',
   'Untersuchung im 21.-24. Lebensmonat - Laufen, Sprachentwicklung, Soziales Spiel'),

  ('00000000-0000-0000-0000-000000000008', 'U7a', 'u_exam', 34, 33, 38,
   'Examination at 34-36 months - speech, fine motor skills, social behavior',
   'Untersuchung im 34.-36. Lebensmonat - Sprache, Feinmotorik, Sozialverhalten'),

  ('00000000-0000-0000-0000-000000000009', 'U8', 'u_exam', 46, 43, 50,
   'Examination at 46-48 months - coordination, language comprehension, independence',
   'Untersuchung im 46.-48. Lebensmonat - Koordination, Sprachverstaendnis, Selbststaendigkeit'),

  ('00000000-0000-0000-0000-000000000010', 'U9', 'u_exam', 60, 58, 66,
   'Examination at 60-64 months - school readiness, complex motor and language skills',
   'Untersuchung im 60.-64. Lebensmonat - Schulfaehigkeit, komplexe Motorik und Sprache'),

  ('00000000-0000-0000-0000-000000000011', 'U10', 'u_exam', 84, 82, 98,
   'Examination at 7-8 years - school performance, social integration, posture',
   'Untersuchung im 7.-8. Lebensjahr - Schulleistung, soziale Integration, Haltung'),

  ('00000000-0000-0000-0000-000000000012', 'U11', 'u_exam', 108, 106, 122,
   'Examination at 9-10 years - puberty onset, school issues, media use',
   'Untersuchung im 9.-10. Lebensjahr - Pubertaetsbeginn, Schulprobleme, Mediennutzung'),

  -- J-Exams (category: j_exam)
  ('00000000-0000-0000-0000-000000000013', 'J1', 'j_exam', 144, 142, 170,
   'Youth examination at 12-14 years - puberty, mental health, risk behavior',
   'Jugendgesundheitsuntersuchung im 12.-14. Lebensjahr - Pubertaet, psychische Gesundheit, Risikoverhalten'),

  ('00000000-0000-0000-0000-000000000014', 'J2', 'j_exam', 192, 190, 206,
   'Youth examination at 16-17 years - vocational readiness, chronic conditions, sexuality',
   'Jugendgesundheitsuntersuchung im 16.-17. Lebensjahr - Berufsfaehigkeit, chronische Erkrankungen, Sexualitaet'),

  -- Z-Exams / Dental (category: z_exam)
  ('00000000-0000-0000-0000-000000000015', 'Z1', 'z_exam', 6, 5, 7,
   'First dental examination at 6 months - oral health assessment',
   'Erste zahnaerztliche Frueherkennungsuntersuchung mit 6 Monaten - Mundgesundheit'),

  ('00000000-0000-0000-0000-000000000016', 'Z2', 'z_exam', 9, 8, 10,
   'Dental examination at 9 months - tooth eruption check',
   'Zahnaerztliche Frueherkennungsuntersuchung mit 9 Monaten - Zahndurchbruchkontrolle'),

  ('00000000-0000-0000-0000-000000000017', 'Z3', 'z_exam', 12, 11, 13,
   'Dental examination at 12 months - caries risk assessment',
   'Zahnaerztliche Frueherkennungsuntersuchung mit 12 Monaten - Kariesrisikobewertung'),

  ('00000000-0000-0000-0000-000000000018', 'Z4', 'z_exam', 24, 21, 27,
   'Dental examination at 24 months - fluoride varnish application',
   'Zahnaerztliche Frueherkennungsuntersuchung mit 24 Monaten - Fluoridlackierung'),

  ('00000000-0000-0000-0000-000000000019', 'Z5', 'z_exam', 36, 33, 39,
   'Dental examination at 36 months - dental development check',
   'Zahnaerztliche Frueherkennungsuntersuchung mit 36 Monaten - Zahnentwicklungskontrolle'),

  ('00000000-0000-0000-0000-000000000020', 'Z6', 'z_exam', 60, 57, 63,
   'Dental examination at 60 months - school readiness dental check',
   'Zahnaerztliche Frueherkennungsuntersuchung mit 60 Monaten - Schuleingangsuntersuchung Zaehne')

ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 2. Vaccines (11 STIKO-recommended vaccines)
-- ---------------------------------------------------------------------------
-- UUID pattern: 10000000-0000-0000-0000-0000000000XX
-- is_mandatory: only MMR is mandatory (Masernschutzgesetz)
-- ---------------------------------------------------------------------------

INSERT INTO public.vaccines (id, name_en, name_de, abbreviation, protects_against_en, protects_against_de, total_doses, is_mandatory)
VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Rotavirus Vaccine', 'Rotavirus-Impfstoff', 'RV',
   'Rotavirus gastroenteritis', 'Rotavirus-Gastroenteritis',
   2, false),

  ('10000000-0000-0000-0000-000000000002',
   'Hexavalent Vaccine (6-in-1)', 'Sechsfachimpfstoff (6fach)', 'DTaP-IPV-Hib-HepB',
   'Diphtheria, Tetanus, Pertussis, Polio, Haemophilus influenzae type b, Hepatitis B',
   'Diphtherie, Tetanus, Keuchhusten, Polio, Haemophilus influenzae Typ b, Hepatitis B',
   3, false),

  ('10000000-0000-0000-0000-000000000003',
   'Pneumococcal Vaccine', 'Pneumokokken-Impfstoff', 'PCV',
   'Pneumococcal infections (meningitis, pneumonia)', 'Pneumokokken-Infektionen (Meningitis, Lungenentzuendung)',
   3, false),

  ('10000000-0000-0000-0000-000000000004',
   'Meningococcal B Vaccine', 'Meningokokken-B-Impfstoff', 'MenB',
   'Meningococcal disease (serogroup B)', 'Meningokokken-Erkrankung (Serogruppe B)',
   3, false),

  ('10000000-0000-0000-0000-000000000005',
   'Meningococcal C Vaccine', 'Meningokokken-C-Impfstoff', 'MenC',
   'Meningococcal disease (serogroup C)', 'Meningokokken-Erkrankung (Serogruppe C)',
   1, false),

  ('10000000-0000-0000-0000-000000000006',
   'MMR Vaccine (Measles, Mumps, Rubella)', 'MMR-Impfstoff (Masern, Mumps, Roeteln)', 'MMR',
   'Measles, Mumps, Rubella', 'Masern, Mumps, Roeteln',
   2, true),

  ('10000000-0000-0000-0000-000000000007',
   'Varicella Vaccine', 'Varizellen-Impfstoff (Windpocken)', 'VZV',
   'Varicella (chickenpox)', 'Varizellen (Windpocken)',
   2, false),

  ('10000000-0000-0000-0000-000000000008',
   'Influenza Vaccine', 'Influenza-Impfstoff (Grippe)', 'Influenza',
   'Seasonal influenza', 'Saisonale Grippe',
   1, false),

  ('10000000-0000-0000-0000-000000000009',
   'Tdap-IPV Booster Vaccine', 'Tdap-IPV Auffrischimpfung', 'Tdap-IPV',
   'Tetanus, Diphtheria, Pertussis, Polio (booster)', 'Tetanus, Diphtherie, Keuchhusten, Polio (Auffrischung)',
   1, false),

  ('10000000-0000-0000-0000-000000000010',
   'HPV Vaccine', 'HPV-Impfstoff', 'HPV',
   'Human papillomavirus (cervical cancer, genital warts)', 'Humane Papillomviren (Gebaermutterhalskrebs, Genitalwarzen)',
   2, false),

  ('10000000-0000-0000-0000-000000000011',
   'Meningococcal ACWY Vaccine', 'Meningokokken-ACWY-Impfstoff', 'MenACWY',
   'Meningococcal disease (serogroups A, C, W, Y)', 'Meningokokken-Erkrankung (Serogruppen A, C, W, Y)',
   1, false)

ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 3. Vaccine Schedule Rules (~30 rules)
-- ---------------------------------------------------------------------------
-- UUID pattern: 20000000-0000-0000-0000-0000000000XX
-- Fields: vaccine_id, dose_number, recommended_age_months, min_age_months,
--         min_interval_days, premature_age_months
-- ---------------------------------------------------------------------------

INSERT INTO public.vaccine_schedule_rules (id, vaccine_id, dose_number, recommended_age_months, min_age_months, min_interval_days, premature_age_months)
VALUES
  -- Rotavirus (RV): 2 doses at 1.5m, 2m; min interval 28 days
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 1.5, 1.5, NULL, NULL),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2, 2, 2, 28, NULL),

  -- Hexavalent / DTaP-IPV-Hib-HepB: standard 2+1 at 2m, 4m, 11m
  -- premature 3+1 at 2m, 3m, 4m, 11m
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 1, 2, 2, NULL, 2),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 2, 4, 4, 28, 3),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 3, 11, 11, 180, 4),
  -- Premature dose 4 (only for premature infants - 3+1 schedule)
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 4, 11, 11, 180, 11),

  -- Pneumococcal (PCV): 3 doses at 2m, 4m, 11-14m
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 1, 2, 2, NULL, NULL),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 2, 4, 4, 56, NULL),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 3, 11, 11, 180, NULL),

  -- Meningococcal B (MenB): 3 doses at 2m, 4m, 12m
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 1, 2, 2, NULL, NULL),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 2, 4, 4, 56, NULL),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', 3, 12, 12, 180, NULL),

  -- Meningococcal C (MenC): 1 dose at 12m
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', 1, 12, 12, NULL, NULL),

  -- MMR: 2 doses at 11m, 15m
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000006', 1, 11, 11, NULL, NULL),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000006', 2, 15, 15, 28, NULL),

  -- Varicella (VZV): 2 doses at 11m, 15m
  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000007', 1, 11, 11, NULL, NULL),
  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000007', 2, 15, 15, 28, NULL),

  -- Influenza: 1 dose annually from 6 months
  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000008', 1, 6, 6, NULL, NULL),

  -- Tdap-IPV Booster: 1 dose at 60-72 months (5-6 years)
  ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000009', 1, 60, 60, NULL, NULL),

  -- HPV: 2 doses at 108m (9 years), 114m (9.5 years)
  ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000010', 1, 108, 108, NULL, NULL),
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000010', 2, 114, 108, 150, NULL),

  -- MenACWY: 1 dose at 144-168 months (12-14 years)
  ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000011', 1, 144, 144, NULL, NULL)

ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 4. Developmental Milestones (~40 entries, linked to U3-U9)
-- ---------------------------------------------------------------------------
-- UUID pattern: 30000000-0000-0000-0000-0000000000XX
-- Categories: motor, language, social_cognitive
-- Each milestone has bilingual descriptions (EN + DE)
-- ---------------------------------------------------------------------------

INSERT INTO public.milestones (id, u_exam_id, category, description_en, description_de)
VALUES
  -- U3 (1 month) - 00000000-0000-0000-0000-000000000003
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'motor',
   'Lifts head briefly when on tummy', 'Hebt kurz den Kopf in Bauchlage'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'motor',
   'Moves arms and legs actively', 'Bewegt Arme und Beine aktiv'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'language',
   'Reacts to sounds', 'Reagiert auf Geraeusche'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'social_cognitive',
   'Fixates on faces briefly', 'Fixiert kurz Gesichter'),

  -- U4 (3-4 months) - 00000000-0000-0000-0000-000000000004
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'motor',
   'Holds head steady', 'Haelt den Kopf sicher'),
  ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'motor',
   'Supports on forearms in tummy position', 'Stuetzt sich in Bauchlage auf Unterarme'),
  ('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', 'language',
   'Coos and babbles', 'Gurrt und brabbelt'),
  ('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', 'social_cognitive',
   'Smiles responsively (social smile)', 'Laechelt zurueck (soziales Laecheln)'),

  -- U5 (6-7 months) - 00000000-0000-0000-0000-000000000005
  ('30000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000005', 'motor',
   'Sits with support', 'Sitzt mit Unterstuetzung'),
  ('30000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000005', 'motor',
   'Grasps objects', 'Greift nach Gegenstaenden'),
  ('30000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000005', 'language',
   'Babbles with syllable chains', 'Lallketten bilden'),
  ('30000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000005', 'social_cognitive',
   'Recognizes familiar faces', 'Erkennt vertraute Gesichter'),

  -- U6 (10-12 months) - 00000000-0000-0000-0000-000000000006
  ('30000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000006', 'motor',
   'Pulls to stand', 'Zieht sich zum Stehen hoch'),
  ('30000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000006', 'motor',
   'Pincer grasp developing', 'Pinzettengriff entwickelt sich'),
  ('30000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000006', 'language',
   'Says first words (mama, papa)', 'Erste Worte (Mama, Papa)'),
  ('30000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000006', 'social_cognitive',
   'Stranger anxiety', 'Fremdelt'),

  -- U7 (21-24 months) - 00000000-0000-0000-0000-000000000007
  ('30000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000007', 'motor',
   'Walks independently', 'Laeuft selbststaendig'),
  ('30000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000007', 'motor',
   'Stacks 2-3 blocks', 'Stapelt 2-3 Kloetze'),
  ('30000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000007', 'language',
   'Uses 50+ words', 'Benutzt 50+ Woerter'),
  ('30000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000007', 'language',
   'Two-word sentences', 'Zwei-Wort-Saetze'),
  ('30000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000007', 'social_cognitive',
   'Plays alongside other children', 'Spielt neben anderen Kindern'),

  -- U7a (34-36 months) - 00000000-0000-0000-0000-000000000008
  ('30000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000008', 'motor',
   'Runs steadily', 'Laeuft sicher'),
  ('30000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000008', 'motor',
   'Pedals tricycle', 'Faehrt Dreirad'),
  ('30000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000008', 'language',
   'Speaks in sentences', 'Spricht in Saetzen'),
  ('30000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000008', 'social_cognitive',
   'Imaginative play', 'Fantasiespiel'),

  -- U8 (46-48 months) - 00000000-0000-0000-0000-000000000009
  ('30000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000009', 'motor',
   'Hops on one foot', 'Huepft auf einem Bein'),
  ('30000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000009', 'motor',
   'Draws recognizable shapes', 'Malt erkennbare Formen'),
  ('30000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000009', 'language',
   'Tells simple stories', 'Erzaehlt einfache Geschichten'),
  ('30000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000009', 'social_cognitive',
   'Understands rules in games', 'Versteht Spielregeln'),

  -- U9 (60-64 months) - 00000000-0000-0000-0000-000000000010
  ('30000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000010', 'motor',
   'Catches a ball', 'Faengt einen Ball'),
  ('30000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000010', 'motor',
   'Writes own name', 'Schreibt eigenen Namen'),
  ('30000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000010', 'language',
   'Uses complex sentences', 'Benutzt komplexe Saetze'),
  ('30000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000010', 'social_cognitive',
   'Shows empathy', 'Zeigt Mitgefuehl')

ON CONFLICT (id) DO NOTHING;
