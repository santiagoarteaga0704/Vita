-- AgroScan — Seed de 10 plagas top de Santa Cruz Bolivia
-- Ejecutar DESPUÉS de schema.sql en Supabase SQL Editor

INSERT INTO pests_catalog (common_name, scientific_name, affected_crops, visual_signs, treatment_organic, treatment_chemical, prevention) VALUES

('Roya asiática de la soya', 'Phakopsora pachyrhizi', ARRAY['soya'],
 'Pústulas marrones en el envés de hojas, halo amarillo. Avanza desde hojas bajas hacia arriba. Defoliación temprana.',
 '{"method":"Caldo bordelés","ingredients":["Sulfato de cobre","Cal apagada"],"dosage":"5g/L de agua","frequency":"Cada 7 días, 3 aplicaciones","notes":"Aplicar al atardecer"}'::jsonb,
 '{"actives":["Triazol","Estrobilurina"],"dosage_per_ha":"0.5 L/ha","timing":"Al atardecer, sin viento","brands":["Opera","Cypress","Priori Xtra"]}'::jsonb,
 'Variedades resistentes, rotación de cultivos, monitoreo desde V3.'),

('Mancha foliar de la soya', 'Septoria glycines', ARRAY['soya'],
 'Manchas pequeñas color marrón rojizo en hojas inferiores, contorno angular.',
 '{"method":"Extracto de cola de caballo","ingredients":["Equisetum arvense"],"dosage":"10g/L","frequency":"Semanal preventivo"}'::jsonb,
 '{"actives":["Carbendazim","Mancozeb"],"dosage_per_ha":"1 L/ha","timing":"Cuando aparecen primeras manchas","brands":["Manzate","Carben 500"]}'::jsonb,
 'Densidad adecuada, ventilación entre hileras, no monocultivo.'),

('Gusano cogollero', 'Spodoptera frugiperda', ARRAY['maíz','soya','sorgo'],
 'Hojas con perforaciones grandes, aserrín de excrementos en el cogollo, larva verde con cabeza marrón.',
 '{"method":"Bacillus thuringiensis (Bt)","ingredients":["Bt kurstaki"],"dosage":"500g/ha","frequency":"Cada 7-10 días","notes":"Aplicar al atardecer, larva pequeña"}'::jsonb,
 '{"actives":["Clorantraniliprol","Spinetoram"],"dosage_per_ha":"0.1 L/ha","timing":"Larvas L1-L3","brands":["Coragen","Belt"]}'::jsonb,
 'Trampas de feromonas, control biológico con avispas Trichogramma, refugios.'),

('Mosca blanca', 'Bemisia tabaci', ARRAY['tomate','soya','algodón'],
 'Insectos blancos voladores debajo de las hojas, melaza pegajosa, fumagina negra, hojas amarillas y enrolladas.',
 '{"method":"Jabón potásico","ingredients":["Jabón potásico"],"dosage":"10ml/L","frequency":"Cada 5 días, 3 aplicaciones"}'::jsonb,
 '{"actives":["Pimetrozina","Imidacloprid"],"dosage_per_ha":"0.3 L/ha","timing":"Adultos volando o ninfas","brands":["Plenum","Confidor"]}'::jsonb,
 'Trampas amarillas adhesivas, malla anti-insectos, eliminar malezas hospederas.'),

('Tizón tardío', 'Phytophthora infestans', ARRAY['papa','tomate'],
 'Manchas marrón-negras en hojas con halo amarillo, vello blanco en envés en clima húmedo. Frutos con manchas duras marrones.',
 '{"method":"Caldo bordelés","ingredients":["Sulfato cobre","Cal"],"dosage":"5g/L","frequency":"Preventivo cada 7 días en clima húmedo"}'::jsonb,
 '{"actives":["Metalaxil","Mancozeb","Cimoxanilo"],"dosage_per_ha":"2 kg/ha","timing":"Preventivo antes de lluvias","brands":["Ridomil","Curzate","Dithane"]}'::jsonb,
 'Variedades resistentes, no regar al atardecer, distancia adecuada entre plantas.'),

('Pulgón verde', 'Myzus persicae', ARRAY['papa','tomate','cítricos'],
 'Pulgones pequeños verdes en brotes y envés de hojas tiernas, hojas enrolladas, melaza, hormigas asociadas.',
 '{"method":"Aceite de neem","ingredients":["Neem"],"dosage":"5ml/L","frequency":"Cada 5 días"}'::jsonb,
 '{"actives":["Imidacloprid","Acetamiprid"],"dosage_per_ha":"0.2 L/ha","timing":"Al aparecer colonias","brands":["Confidor","Mospilan"]}'::jsonb,
 'Mariquitas (Coccinellidae), plantas trampa, control de hormigas (vectores).'),

('Antracnosis cítricos', 'Colletotrichum gloeosporioides', ARRAY['cítricos'],
 'Manchas marrones hundidas en frutos, hojas con anillos concéntricos, ramitas con tizón.',
 '{"method":"Caldo sulfocálcico","ingredients":["Cal","Azufre"],"dosage":"30ml/L","frequency":"Mensual en época húmeda"}'::jsonb,
 '{"actives":["Mancozeb","Tebuconazol"],"dosage_per_ha":"2 kg/ha","timing":"Pre-floración y post-cosecha","brands":["Dithane","Folicur"]}'::jsonb,
 'Poda de ramas enfermas, drenaje del suelo, no fertilizar con exceso de nitrógeno.'),

('Cochinilla harinosa', 'Planococcus citri', ARRAY['cítricos','tomate'],
 'Insectos cubiertos de polvo blanco céreo, en racimos en axilas de hojas y frutos. Melaza y fumagina.',
 '{"method":"Alcohol al 70% + jabón","ingredients":["Alcohol","Jabón neutro"],"dosage":"100ml alcohol + 5ml jabón/L","frequency":"Aplicación directa sobre colonias"}'::jsonb,
 '{"actives":["Buprofezin","Spirotetramat"],"dosage_per_ha":"0.5 L/ha","timing":"Ninfas L1-L2","brands":["Applaud","Movento"]}'::jsonb,
 'Control de hormigas, fauna auxiliar (Chrysoperla, Cryptolaemus).'),

('Mildiú velloso', 'Peronospora destructor', ARRAY['cebolla'],
 'Manchas amarillentas ovaladas en hojas, con vello violáceo grisáceo en envés, hojas se doblan y mueren.',
 '{"method":"Bicarbonato sódico","ingredients":["Bicarbonato","Jabón neutro"],"dosage":"5g/L + 2ml jabón","frequency":"Cada 7 días preventivo"}'::jsonb,
 '{"actives":["Mancozeb","Fosetil-Al"],"dosage_per_ha":"2.5 kg/ha","timing":"Preventivo en alta humedad","brands":["Dithane","Aliette"]}'::jsonb,
 'Riego matinal, ventilación, variedades resistentes, drenaje.'),

('Trips', 'Frankliniella occidentalis', ARRAY['tomate','cebolla','soya'],
 'Insectos diminutos amarillentos, hojas con manchas plateadas y puntos negros, deformación de brotes, transmiten virus.',
 '{"method":"Trampas azules + extracto de ajo","ingredients":["Ajo","Agua"],"dosage":"50g/L macerado","frequency":"Cada 5 días"}'::jsonb,
 '{"actives":["Spinosad","Spinetoram"],"dosage_per_ha":"0.2 L/ha","timing":"Adultos y ninfas","brands":["Tracer","Delegate"]}'::jsonb,
 'Trampas azules adhesivas, ácaros depredadores (Amblyseius), eliminar malezas.');
