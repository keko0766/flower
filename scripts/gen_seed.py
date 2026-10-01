"""Generates supabase/seed.sql with concept demo data. Run: python3 scripts/gen_seed.py"""
from pathlib import Path

U = "https://images.unsplash.com/photo-{}?w=1200&q=80&auto=format&fit=crop"
P = {  # verified flower photos
    "tulips_vase": "1561181286-d3fee7d55364",
    "rainbow": "1508610048659-a06b669e3321",
    "heart": "1526047932273-341f2a7631f9",
    "peony_kraft": "1563241527-3004b7be0ffd",
    "red_field": "1519378058457-4c29a0a2efac",
    "sunflowers": "1455659817273-f96807779a8a",
    "pink_roses": "1582794543139-8ac9cb0f7b11",
    "mixed_roses": "1591886960571-74d43a9d4166",
    "pink_tulip": "1520763185298-1b434c919102",
    "lily": "1525310072745-f49212b5ac6d",
    "red_rose": "1496062031456-07b8f162a322",
    "tulip_field": "1468327768560-75b778cbb551",
    "red_roses": "1494972308805-463bc619d34e",
    "kraft_hand": "1567696153798-9111f9cd3d0d",
    "red_rose_dark": "1559563362-c667ba5f5480",
    "sunflower": "1597848212624-a19eb35e2651",
    "daisy": "1606041008023-472dfb5e530f",
    "vase_orange": "1533616688419-b7a585564566",
    "dark_mix": "1457089328109-e5d9bd499191",
    "peach_vase": "1572454591674-2739f30d8c40",
}

OCCASIONS = [
    ("birthday", "День рождения", "Туған күн"),
    ("love", "Любимой", "Сүйіктіге"),
    ("wedding", "Свадьба", "Үйлену той"),
    ("mom", "Маме", "Анаға"),
    ("march8", "8 марта", "8 наурыз"),
    ("thanks", "Благодарность", "Алғыс"),
    ("colleague", "Коллеге", "Әріптеске"),
    ("sympathy", "Соболезнование", "Көңіл айту"),
]
COLORS = [
    ("red", "Красные", "Қызыл", "#C0392B"),
    ("pink", "Розовые", "Қызғылт", "#E9A3B0"),
    ("white", "Белые", "Ақ", "#FFFFFF"),
    ("yellow", "Жёлтые", "Сары", "#F4C430"),
    ("orange", "Оранжевые", "Қызғылт сары", "#F08A4B"),
    ("mix", "Микс", "Аралас", "linear"),
]

# slug, name_ru, name_kk, short_ru, short_kk, composition_ru, composition_kk,
# price, old_price, size, h, d, images, occasions, colors, popularity, rating, days_ago
B = [
    ("alma-bagy", "Алма бағы", "Алма бағы", "Нежные пионовидные розы с эвкалиптом", "Эвкалипт қосылған нәзік пион тәрізді раушандар",
     "Пионовидные розы — 9 шт., эвкалипт, маттиола", "Пион тәрізді раушан — 9 дана, эвкалипт, маттиола",
     24900, None, "M", 45, 35, ["pink_roses", "peony_kraft"], ["birthday", "love", "mom"], ["pink"], 96, 4.9, 3),
    ("ak-tan", "Ақ таң", "Ақ таң", "Белые и розовые тюльпаны в вазе", "Вазадағы ақ және қызғылт қызғалдақтар",
     "Тюльпаны — 25 шт., зелень", "Қызғалдақ — 25 дана, жасыл шөп",
     18500, None, "M", 40, 30, ["tulips_vase", "tulip_field"], ["march8", "mom", "colleague"], ["white", "pink"], 88, 4.8, 10),
    ("koktem", "Көктем", "Көктем", "Яркий весенний микс в вазе", "Вазадағы жарқын көктемгі аралас гүлдер",
     "Тюльпаны, львиный зев, розы, ранункулюсы", "Қызғалдақ, арыстан аузы, раушан, ранункулюс",
     31000, 35000, "L", 55, 40, ["vase_orange", "dark_mix"], ["birthday", "thanks"], ["orange", "mix"], 74, 4.7, 5),
    ("zhibek", "Жібек", "Жібек", "Пудровые розы в крафте с хлопком", "Мақта қосылған крафттағы ұнтақ түсті раушандар",
     "Кустовые розы, хлопок, лизиантус, эвкалипт", "Бұталы раушан, мақта, лизиантус, эвкалипт",
     22000, None, "M", 45, 35, ["peony_kraft", "pink_roses"], ["love", "wedding"], ["white", "pink"], 81, 4.9, 20),
    ("kyzyl-raushan-25", "25 красных роз", "25 қызыл раушан", "Классика, которая всегда к месту", "Әрқашан орынды классика",
     "Красная роза Explorer 60 см — 25 шт.", "Explorer қызыл раушаны 60 см — 25 дана",
     27500, None, "L", 60, 40, ["red_roses", "red_rose"], ["love", "birthday"], ["red"], 99, 5.0, 40),
    ("kyzyl-raushan-51", "51 красная роза", "51 қызыл раушан", "Большой букет для громкого признания", "Үлкен махаббат мойындауына арналған гүл шоғы",
     "Красная роза Explorer 60 см — 51 шт., лента", "Explorer қызыл раушаны 60 см — 51 дана, таспа",
     54900, 59900, "XL", 60, 55, ["red_roses", "red_rose_dark"], ["love", "wedding"], ["red"], 70, 4.9, 60),
    ("kun-sauly", "Күн сәулесі", "Күн сәулесі", "Солнечные подсолнухи в крафте", "Крафттағы күн сияқты күнбағыстар",
     "Подсолнухи — 7 шт., сухоцветы, эвкалипт", "Күнбағыс — 7 дана, кепкен гүлдер, эвкалипт",
     16900, None, "M", 50, 35, ["kraft_hand", "sunflower"], ["birthday", "colleague", "thanks"], ["yellow"], 77, 4.8, 8),
    ("kunbagys-shogy", "Поле подсолнухов", "Күнбағыс алқабы", "15 подсолнухов — заряд лета", "15 күнбағыс — жаздың қуаты",
     "Подсолнухи — 15 шт.", "Күнбағыс — 15 дана",
     23900, None, "L", 55, 45, ["sunflowers", "sunflower"], ["birthday", "thanks"], ["yellow"], 52, 4.6, 30),
    ("mahabbat", "Махаббат", "Махаббат", "Композиция-сердце из роз", "Раушандардан жасалған жүрек композициясы",
     "Розы, гвоздики, хризантемы в форме сердца", "Жүрек пішініндегі раушан, қалампыр, хризантема",
     38500, None, "L", 35, 45, ["heart", "mixed_roses"], ["love", "march8"], ["mix", "pink"], 85, 4.9, 2),
    ("anaga", "Анаға", "Анаға", "Пионы и садовые розы для самой родной", "Ең жақын адамға арналған пион мен бақ раушандары",
     "Садовые розы, пионовидные розы, эустома", "Бақ раушаны, пион тәрізді раушан, эустома",
     29900, None, "M", 45, 40, ["mixed_roses", "pink_roses"], ["mom", "birthday", "march8"], ["pink", "mix"], 90, 5.0, 14),
    ("kempirkosak", "Радуга", "Кемпірқосақ", "Радужные розы — сюрприз в каждом бутоне", "Кемпірқосақ раушандары — әр бүршікте тосын сый",
     "Радужные розы — 19 шт.", "Кемпірқосақ раушаны — 19 дана",
     34900, None, "M", 50, 35, ["rainbow", "mixed_roses"], ["birthday"], ["mix"], 61, 4.5, 6),
    ("kyzgaldak", "Розовый тюльпан", "Қызғылт қызғалдақ", "Минимализм: тюльпаны одного оттенка", "Минимализм: бір реңкті қызғалдақтар",
     "Пионовидные тюльпаны — 15 шт.", "Пион тәрізді қызғалдақ — 15 дана",
     14900, None, "S", 35, 25, ["pink_tulip", "tulips_vase"], ["march8", "colleague"], ["pink"], 68, 4.7, 12),
    ("aiaulym", "Аяулым", "Аяулым", "Персиковые розы и альстромерии", "Шабдалы түсті раушандар мен альстромериялар",
     "Розы, альстромерии, гвоздики, зелень", "Раушан, альстромерия, қалампыр, жасыл шөп",
     26900, None, "M", 45, 40, ["peach_vase", "mixed_roses"], ["birthday", "thanks", "mom"], ["orange", "pink"], 79, 4.8, 1),
    ("tungi-bak", "Ночной сад", "Түнгі бақ", "Глубокие оттенки бордо и коралла", "Бордо мен маржан түстерінің терең реңктері",
     "Пионы, розы, протея, ранункулюсы", "Пион, раушан, протея, ранункулюс",
     42900, None, "L", 55, 45, ["dark_mix", "vase_orange"], ["birthday", "wedding"], ["red", "mix"], 58, 4.8, 4),
    ("lilia", "Нежность", "Нәзіктік", "Изящные альстромерии", "Әсем альстромериялар",
     "Альстромерии — 11 шт., зелень", "Альстромерия — 11 дана, жасыл шөп",
     12900, None, "S", 40, 25, ["lily", "pink_tulip"], ["colleague", "thanks"], ["pink"], 45, 4.5, 25),
    ("ak-romashka", "Ромашковое поле", "Түймедақ алқабы", "Простые ромашки — искренние чувства", "Қарапайым түймедақтар — шынайы сезім",
     "Ромашки — 25 шт., гипсофила", "Түймедақ — 25 дана, гипсофила",
     11900, None, "M", 40, 35, ["daisy", "tulips_vase"], ["birthday", "mom", "thanks"], ["white"], 50, 4.6, 18),
    ("kyzyl-gul", "Алая роза", "Ал раушан", "Одна роза в подарочной упаковке", "Сыйлық орамасындағы бір раушан",
     "Роза Red Naomi 80 см — 1 шт.", "Red Naomi раушаны 80 см — 1 дана",
     3900, None, "S", 80, 15, ["red_rose", "red_rose_dark"], ["love"], ["red"], 66, 4.7, 50),
    ("gul-alkaby", "Розовый сад", "Қызғылт бақ", "Пышные пионовидные розы оттенка пудры", "Ұнтақ түсті көпшікті пион тәрізді раушандар",
     "Пионовидные розы — 15 шт.", "Пион тәрізді раушан — 15 дана",
     36900, None, "L", 50, 45, ["pink_roses", "heart"], ["wedding", "love", "mom"], ["pink"], 72, 4.9, 9),
    ("ak-zhauhar", "Ақ жауһар", "Ақ жауһар", "Светлый букет для тихих слов поддержки", "Қолдау сөздеріне арналған ашық түсті гүл шоғы",
     "Белые хризантемы, эустома, гипсофила", "Ақ хризантема, эустома, гипсофила",
     19900, None, "M", 45, 35, ["daisy", "peony_kraft"], ["sympathy", "thanks"], ["white"], 30, 4.8, 35),
    ("kyzyl-bak", "Гранатовый сад", "Анар бағы", "Пышный букет из кустовых роз", "Бұталы раушандардан жасалған көпшікті гүл шоғы",
     "Кустовые розы — 15 шт., гиперикум", "Бұталы раушан — 15 дана, гиперикум",
     21900, None, "M", 45, 35, ["red_field", "red_roses"], ["birthday", "colleague"], ["red"], 55, 4.6, 22),
]

DESC = {
    "ru": "Собираем букет «{n}» вручную в день доставки из свежих цветов от проверенных поставщиков. "
          "Каждый букет фотографируем перед отправкой и присылаем фото вам в WhatsApp. "
          "В комплекте — подкормка для цветов и инструкция по уходу, чтобы букет радовал дольше.",
    "kk": "«{n}» гүл шоғын жеткізу күні сенімді жеткізушілердің балғын гүлдерінен қолмен жинаймыз. "
          "Әр гүл шоғын жібермес бұрын суретке түсіріп, WhatsApp арқылы жібереміз. "
          "Жиынтықта гүлдерге арналған қоректендіргіш пен күтім нұсқаулығы бар.",
}


def q(v):
    if v is None:
        return "null"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


out = ["-- Generated by scripts/gen_seed.py — concept data, replace with real content.\n"]
out.append("insert into public.occasions (slug, name_ru, name_kk, sort) values\n" + ",\n".join(
    f"  ({q(s)}, {q(r)}, {q(k)}, {i})" for i, (s, r, k) in enumerate(OCCASIONS)) + ";\n")
out.append("insert into public.colors (slug, name_ru, name_kk, hex, sort) values\n" + ",\n".join(
    f"  ({q(s)}, {q(r)}, {q(k)}, {q(h)}, {i})" for i, (s, r, k, h) in enumerate(COLORS)) + ";\n")

rows, occ, col = [], [], []
for (slug, nr, nk, sr, sk, cr, ck, price, old, size, h, d, imgs, occs, cols, pop, rating, ago) in B:
    arr = "array[" + ", ".join(q(U.format(P[i])) for i in imgs) + "]"
    rows.append(
        f"  ({q(slug)}, {q(nr)}, {q(nk)}, {q(sr)}, {q(sk)}, {q(DESC['ru'].format(n=nr))}, {q(DESC['kk'].format(n=nk))}, "
        f"{q(cr)}, {q(ck)}, {price}, {q(old)}, {q(size)}, {h}, {d}, {arr}, {pop}, {rating}, now() - interval '{ago} days')")
    occ += [f"  ({q(slug)}, {q(o)})" for o in occs]
    col += [f"  ({q(slug)}, {q(c)})" for c in cols]

out.append(
    "insert into public.bouquets (slug, name_ru, name_kk, short_ru, short_kk, description_ru, description_kk, "
    "composition_ru, composition_kk, price, old_price, size, height_cm, diameter_cm, images, popularity, rating, created_at) values\n"
    + ",\n".join(rows) + ";\n")
out.append("insert into public.bouquet_occasions (bouquet_id, occasion_slug)\nselect b.id, v.o from (values\n"
           + ",\n".join(occ) + "\n) as v(s, o) join public.bouquets b on b.slug = v.s;\n")
out.append("insert into public.bouquet_colors (bouquet_id, color_slug)\nselect b.id, v.c from (values\n"
           + ",\n".join(col) + "\n) as v(s, c) join public.bouquets b on b.slug = v.s;\n")

Path(__file__).resolve().parent.parent.joinpath("supabase/seed.sql").write_text("\n".join(out), encoding="utf-8")
print(f"seed.sql: {len(B)} bouquets, {len(occ)} occasion links, {len(col)} color links")
