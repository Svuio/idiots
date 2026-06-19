import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "disc_color_check_results_single_choice_v1";
const ADMIN_SESSION_KEY = "disc_color_check_admin_session_stable_v3";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "colors2026";
const RESULTS_API = "/.netlify/functions/results";

const COLORS = {
  D: { label: "ЧЕРВЕН", short: "Червен", group: "Червена група", emoji: "🔴", soft: "bg-red-50", text: "text-red-700", ring: "ring-red-300", border: "border-red-200" },
  I: { label: "ЖЪЛТ", short: "Жълт", group: "Жълта група", emoji: "🟡", soft: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-300", border: "border-yellow-200" },
  S: { label: "ЗЕЛЕН", short: "Зелен", group: "Зелена група", emoji: "🟢", soft: "bg-green-50", text: "text-green-700", ring: "ring-green-300", border: "border-green-200" },
  C: { label: "СИН", short: "Син", group: "Синя група", emoji: "🔵", soft: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-300", border: "border-blue-200" },
};

const PROFILE = {
  D: {
    headline: "Действа бързо, търси посока и резултат.",
    behavior: "Включва се най-силно, когато има ясна цел, ограничено време и нужда някой да придвижи групата към решение.",
    contribution: "Подходящ за роли с посока, решение, тайминг, лидерство или кризисен избор.",
    watch: "Внимавай да не доминира прекалено разговора. Дай му конкретна отговорност и правило да чуе поне две други мнения.",
    facilitation: "Дай му ясна цел, ограничено време и поле да движи нещата напред.",
    pairing: "Добре се балансира със Зелен за човешка чувствителност или със Син за качество.",
  },
  I: {
    headline: "Внася енергия, идеи и социална динамика.",
    behavior: "Създава настроение, дава идеи и помага групата да не стане прекалено суха.",
    contribution: "Подходящ за роли с представяне, story telling, енергизиране, измисляне на име, слоган или нестандартна идея.",
    watch: "Внимавай да не завлече групата в забавна, но неясна посока. Дай му пространство за енергия и видим критерий за завършен резултат.",
    facilitation: "Ползвай го за настроение, представяне и раздвижване на групата.",
    pairing: "Добре се балансира със Син за структура или със Зелен за стабилност.",
  },
  S: {
    headline: "Търси спокойствие, баланс и включване на хората.",
    behavior: "Пази спокойствието, изслушва и помага на по-тихите хора да се включат.",
    contribution: "Подходящ за роли с координация, включване на всички, наблюдение на груповата динамика и поддържане на добра атмосфера.",
    watch: "Внимавай да не остане в сянка или да се съгласява само за да няма напрежение. Покани го директно с въпрос.",
    facilitation: "Дай му роля, в която да пази екипната атмосфера и да чува тихите гласове.",
    pairing: "Добре се балансира с Червен за движение или с Жълт за енергия.",
  },
  C: {
    headline: "Мисли структурирано, проверява детайли и търси логика.",
    behavior: "Търси логика, последователност и добри аргументи. Може да забави групата, ако започне да проверява прекалено много детайли.",
    contribution: "Подходящ за роли с проверка на плана, анализ на рискове, качество, реалистичност и структуриране на аргументи.",
    watch: "Внимавай да не се блокира в анализ или да критикува твърде рано идеите. Дай му отделен момент за проверка.",
    facilitation: "Ползвай го за анализ, качество, проверка на планове и реалистичност.",
    pairing: "Добре се балансира с Жълт за креативност или с Червен за скорост.",
  },
};

const COMBOS = {
  DI: "Силен двигател: бързина, влияние и видима енергия.",
  DS: "Резултатен, но с повече внимание към хората.",
  DC: "Директен и аналитичен: иска контрол, точност и ясен резултат.",
  ID: "Енергичен инициатор: продава идеи и обича движение.",
  IS: "Социален и подкрепящ: добър за сплотяване.",
  IC: "Креативен, но с нужда от смисъл и добра рамка.",
  SD: "Спокоен изпълнител, който може да поеме посока при ясна цел.",
  SI: "Топъл екипен играч: свързва хората и поддържа добър тон.",
  SC: "Стабилен и внимателен: надежден при задачи, изискващи последователност.",
  CD: "Аналитичен решавач: търси правилния отговор и може да бъде много ефективен.",
  CI: "Идеи с проверка: комбинира любопитство с нужда от аргументи.",
  CS: "Спокоен анализатор: силен в структура, качество и обмислени решения.",
};

const COLOR_HINT = "Запомни цвета си — по-късно ще го използваме като екипна роля, не като етикет.";

const RISK_RULES = {
  D: "Много Червени: групата може да се движи бързо, но има риск от надговаряне, конкуренция и битка за контрол.",
  I: "Много Жълти: ще има енергия и идеи, но има риск от разфокусиране и недовършване.",
  S: "Много Зелени: атмосферата може да е спокойна, но има риск от бавни решения и избягване на конфликт.",
  C: "Много Сини: качеството може да е високо, но има риск от прекален анализ и забавяне.",
};

const RAW_ITEMS = [
  ["Вие сте на тиймбилдинг и групата ви получава задача: за 15 минути трябва да измислите кратка концепция за нов продукт. Минават 7 минути, всички говорят, но още няма посока. Времето започва да притиска групата. Какво най-вероятно правиш първо?", [
    "Казвам: „Нека изберем една посока и да започнем да я оформяме.“",
    "Казвам: „Имам идея как да го направим по-забавно и различно.“",
    "Питам: „Всички ли са ок с това накъде вървим?“",
    "Казвам: „Нека първо уточним какво трябва да има в крайния резултат.“"
  ]],
  ["Групата ви обсъжда решение. Един човек говори почти през цялото време, а двама други само кимат и не казват нищо. Фасилитаторът минава покрай масата и казва, че имате още 8 минути. Как реагираш най-естествено?", [
    "Прекъсвам учтиво и връщам групата към това какво трябва да решим.",
    "Включвам се с енергия, за да раздвижа разговора и да не зацикляме.",
    "Обръщам се към по-тихите хора и ги питам какво мислят.",
    "Опитвам да обобщя какво е казано дотук и кое е факт, а кое мнение."
  ]],
  ["Работите по задача, в която трябва да измислите нестандартно представяне. Някой предлага много шантава идея. Част от групата се смее и се оживява, но друг човек казва: „Това няма да стане.“ Какво правиш първо?", [
    "Казвам: „Ако ще я правим, да решим как точно и да действаме.“",
    "Подхващам идеята и добавям още нещо, за да стане по-силна.",
    "Проверявам дали групата се чувства комфортно с такава посока.",
    "Питам как можем да проверим дали идеята е реалистична."
  ]],
  ["Фасилитаторът ви дава задача, но инструкцията е леко неясна. Един човек я разбира по един начин, друг — по съвсем различен. Започва спор какво всъщност се иска. Какво най-вероятно правиш?", [
    "Предлагам практична интерпретация и казвам да започнем по нея.",
    "Предлагам да съберем няколко идеи и после да изберем най-интересната.",
    "Опитвам да успокоя разговора, за да не стане излишно напрежение.",
    "Питам какъв точно трябва да е крайният резултат и по какви критерии ще се гледа."
  ]],
  ["Групата ви трябва да построи нещо с ограничени материали — хартия, тиксо и маркери. Имате две идеи: едната е лесна и бърза, другата е по-впечатляваща, но по-рискована. Остават 12 минути. Какво казваш?", [
    "„Да вземем по-бързия вариант и да го направим добре.“",
    "„По-рискованият вариант ще е много по-запомнящ се.“",
    "„Кой вариант ще е най-комфортен за всички да изпълним?“",
    "„Нека сравним риска, времето и шанса да го завършим.“"
  ]],
  ["По време на упражнение двама души от групата започват да спорят. Единият иска да се действа веднага, другият настоява, че планът е слаб. Останалите започват да мълчат. Какво правиш първо?", [
    "Назовавам проблема и предлагам бързо решение как да продължим.",
    "Опитвам да сменя енергията и да върна групата към общата цел.",
    "Опитвам да чуя и двете страни, за да спадне напрежението.",
    "Опитвам да разбера какво точно в плана се смята за слабо."
  ]],
  ["Групата ви има идея, но става ясно, че няма да успеете да я изпълните цялата. Остават 6 минути. Някой казва: „Май няма смисъл, няма да стане.“ Какво най-вероятно предлагаш?", [
    "Да направим най-важната част и да я покажем като завършен минимум.",
    "Да я представим по-атрактивно, дори да не е перфектна.",
    "Да видим кой с какво може да помогне, за да не се отказваме.",
    "Да намалим обхвата, така че поне това, което покажем, да е качествено."
  ]],
  ["След работа по групова задача трябва да представите резултата си пред всички. Никой не е сигурен кой какво да каже. Имате 3 минути да се подготвите. Коя роля най-естествено поемаш?", [
    "Да кажа ясно какво сме решили и защо това е нашият избор.",
    "Да направя представянето живо, забавно и запомнящо се.",
    "Да се уверя, че приносът на хората в групата се вижда.",
    "Да подредя структурата, аргументите и последователността."
  ]],
  ["В задачата трябва да изберете само една идея, но групата обсъжда детайли вече твърде дълго. Някой започва да отваря още нови варианти. Времето напредва. Какво правиш?", [
    "Казвам: „Стига обсъждане, трябва да изберем и да действаме.“",
    "Предлагам по-смел вариант, за да излезем от скучния цикъл.",
    "Питам дали всички са готови да продължим с една от опциите.",
    "Питам кои детайли наистина са критични за решението."
  ]],
  ["Групата ви представя идея вътрешно, преди да я покаже на останалите. Един човек казва: „Това няма да ги впечатли.“ Настъпва кратко мълчание. Каква е първата ти реакция?", [
    "Питам: „Какво трябва да променим, за да стане по-силно?“",
    "Опитвам да обърна коментара в по-позитивна и креативна посока.",
    "Питам какво точно го притеснява, за да не го отхвърлим веднага.",
    "Питам на какво основание смята, че няма да сработи."
  ]],
  ["На масата има 6 различни идеи, написани на листчета. Всички изглеждат донякъде добри, но никой не иска да отстъпи от своята. Фасилитаторът казва: „Изберете една.“ Какво правиш?", [
    "Предлагам бързо гласуване или избор на една идея, за да продължим.",
    "Избирам идеята, която носи най-много енергия и настроение.",
    "Търся вариант, с който най-много хора могат да се съгласят.",
    "Предлагам 2–3 критерия, по които да сравним идеите."
  ]],
  ["Получавате задача да измислите решение за измислен клиент. Един човек иска да направите нещо просто, друг иска нещо много креативно, трети се притеснява, че няма време. Ти какво правиш най-естествено?", [
    "Избирам най-директния път към работещ резултат.",
    "Подкрепям по-креативния подход, ако ще направи задачата по-интересна.",
    "Търся подход, който няма да стресира групата излишно.",
    "Търся подхода с най-малко неясноти и риск от грешка."
  ]],
  ["В последните минути някой предлага да смените цялата посока, защото новата идея звучи по-добре. Част от групата се колебае, част се ентусиазира. Как реагираш?", [
    "Питам дали промяната реално ще даде по-добър резултат и решаваме бързо.",
    "Харесва ми, ако новата посока ще направи представянето по-силно.",
    "Проверявам дали групата е спокойна с такава промяна в последния момент.",
    "Питам какви са последствията и какво ще трябва да преработим."
  ]],
  ["Докато работите, забелязваш, че един човек от групата изглежда объркан. Той гледа задачата, но не се включва. Другите са заети и не му обръщат внимание. Какво най-вероятно правиш?", [
    "Давам му конкретна малка задача, за да се включи веднага.",
    "Опитвам да го въвлека с лек въпрос или шега.",
    "Питам го спокойно какво мисли и дали има нужда от помощ.",
    "Опитвам да разбера къде точно се е изгубил в задачата."
  ]],
  ["Крайният резултат е почти готов, но не е идеален. Остават 2 минути. Един човек иска още да го пипате, друг казва да приключвате. Какво казваш?", [
    "„Достатъчно добро е. Да го покажем.“",
    "„Да го представим така, че да има ефект.“",
    "„Важно е всички да сме ок с това, което показваме.“",
    "„Нека проверим дали няма очевидни пропуски.“"
  ]],
  ["Представи си, че си в групова задача с хора, които не познаваш много добре. Има ограничено време, различни мнения и очакване накрая да покажете резултат. Кое изречение най-много прилича на първия ти импулс?", [
    "„Да решим и да действаме.“",
    "„Да го направим живо и интересно.“",
    "„Да го направим спокойно и заедно.“",
    "„Да го направим правилно и обмислено.“"
  ]],
];

const ITEMS = RAW_ITEMS.map(([scenario, texts], idx) => ({
  scenario,
  options: ["D", "I", "S", "C"].map((type, i) => ({ id: `${idx + 1}${type}`, type, text: texts[i] })),
}));

const TIE_TEXTS = {
  D: ["да взема решение и да придвижа групата напред", "да поема посока, дори да нямаме всички детайли", "да сложа ясен приоритет и следващ ход"],
  I: ["да вкарам енергия и да отворя повече идеи", "да спечеля хората за по-смел вариант", "да направя разговора по-жив и ангажиращ"],
  S: ["да запазя спокойствието и да включа всички", "да потърся обща точка, преди да натискаме напред", "да намаля напрежението и да чуя тихите гласове"],
  C: ["да проверя фактите и критериите", "да подредя информацията, преди да решим", "да видя риска и слабите места в плана"],
};

const TIE_SCENARIOS = [
  "Остават последните 5 минути от групова задача. Имате недовършен резултат, няколко различни мнения и нужда да излезете с нещо пред останалите. Какъв е първият ти импулс?",
  "В средата на упражнение двама души дърпат групата в различни посоки. Единият иска да се действа, другият иска още да се мисли. Останалите чакат. Какво ти идва най-естествено?",
  "Фасилитаторът казва: „Имате още 3 минути.“ Групата още не е напълно готова и усещаш напрежение на масата. Какво най-вероятно правиш?",
];

function getTieQuestions(pair) {
  const [a, b] = pair;
  return TIE_SCENARIOS.map((scenario, index) => ({
    scenario,
    options: [
      { id: `tie${index}${a}`, type: a, text: TIE_TEXTS[a][index] },
      { id: `tie${index}${b}`, type: b, text: TIE_TEXTS[b][index] },
    ],
  }));
}

function Button({ children, onClick, disabled, variant = "primary", className = "" }) {
  const styles = variant === "danger"
    ? "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-200"
    : variant === "success"
      ? "border border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700"
      : variant === "reject"
        ? "border border-red-300 bg-red-100 text-red-700 hover:bg-red-200"
        : variant === "secondary"
          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          : "bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-300";
  return <button disabled={disabled} onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${styles} ${className}`}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Page({ children, center = false }) {
  return <main className={`min-h-screen bg-slate-50 p-4 md:p-8 ${center ? "flex items-center justify-center" : ""}`}>{children}</main>;
}

function Input({ label, value, onChange, placeholder, type = "text", onEnter }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter?.()} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-slate-200" /></label>;
}

function Badge({ type }) {
  const c = COLORS[type] || COLORS.D;
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${c.soft} ${c.text}`}>{c.emoji} {c.short}</span>;
}

function Info({ title, text }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 text-sm font-semibold text-slate-900">{title}</div><p className="text-sm leading-relaxed text-slate-600">{text}</p></div>;
}

function scoreAnswers(answers, tieAnswers = {}) {
  const score = { D: 0, I: 0, S: 0, C: 0 };
  Object.values(answers).forEach((option) => {
    if (option?.type) score[option.type] += 1;
  });
  Object.values(tieAnswers).forEach((option) => {
    if (option?.type) score[option.type] += 1;
  });
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  return { score, primary: ranked[0]?.[0] || "D", secondary: ranked[1]?.[0] || "I", ranked };
}

function shouldUseTieBreaker(result) {
  const top = result.ranked?.[0];
  const second = result.ranked?.[1];
  if (!top || !second) return false;
  return top[0] !== second[0] && top[1] - second[1] <= 2;
}

function loadResults() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function storeResultsLocally(results) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

async function fetchResults() {
  try {
    const response = await fetch(RESULTS_API, { method: "GET" });
    if (!response.ok) throw new Error("Results API unavailable");
    const data = await response.json();
    const results = data.results || [];
    storeResultsLocally(results);
    return results;
  } catch {
    return loadResults();
  }
}

async function saveResult(record) {
  try {
    const response = await fetch(RESULTS_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
    if (!response.ok) throw new Error("Results API unavailable");
    const data = await response.json();
    const results = data.results || [data.record, ...loadResults()].filter(Boolean);
    storeResultsLocally(results);
    return data.record || record;
  } catch {
    const next = [record, ...loadResults()];
    storeResultsLocally(next);
    return record;
  }
}

async function deleteStoredResult(id, index) {
  try {
    const params = new URLSearchParams();
    if (id) params.set("id", id);
    else params.set("index", String(index));
    const response = await fetch(`${RESULTS_API}?${params.toString()}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Results API unavailable");
    const data = await response.json();
    const results = data.results || [];
    storeResultsLocally(results);
    return results;
  } catch {
    const next = loadResults().filter((record, i) => id ? record.id !== id : i !== index);
    storeResultsLocally(next);
    return next;
  }
}

async function clearStoredResults() {
  try {
    const response = await fetch(`${RESULTS_API}?all=true`, { method: "DELETE" });
    if (!response.ok) throw new Error("Results API unavailable");
  } catch {
    // Fallback to local cleanup only.
  }
  localStorage.removeItem(STORAGE_KEY);
  return [];
}

function confidenceFor(score) {
  const values = Object.values(score || { D: 0, I: 0, S: 0, C: 0 }).sort((a, b) => b - a);
  const gap = values[0] - (values[1] ?? values[0]);
  if (gap >= 4) return "ясно изразен";
  if (gap >= 2) return "умерено изразен";
  return "смесен/балансиран";
}

function confidenceClass(confidence) {
  if (confidence === "ясно изразен") return "bg-emerald-100 text-emerald-800";
  if (confidence === "умерено изразен") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

function analysisFor(record) {
  const p = PROFILE[record.primary] || PROFILE.D;
  const confidence = confidenceFor(record.score);
  return {
    summary: `${COLORS[record.primary]?.short || "Червен"} с вторичен ${COLORS[record.secondary]?.short || "Жълт"}. ${p.headline} ${COMBOS[`${record.primary}${record.secondary}`] || ""}`,
    confidence,
    behavior: p.behavior,
    contribution: p.contribution,
    watch: p.watch,
    facilitation: p.facilitation,
    pairing: p.pairing,
    csv: `${p.headline} Профилът е ${confidence}. ${p.facilitation}`,
  };
}

function groupRadar(results) {
  if (!results.length) return [];
  const totals = results.reduce((acc, r) => ({ ...acc, [r.primary]: (acc[r.primary] || 0) + 1 }), { D: 0, I: 0, S: 0, C: 0 });
  const dominant = Object.entries(totals).filter(([, count]) => count / results.length >= 0.4 && count >= 2);
  if (!dominant.length) return ["Групата изглежда сравнително балансирана. Очаквай разнообразни реакции и добри условия за разговор за различните стилове."];
  return dominant.map(([type]) => RISK_RULES[type]);
}

function suggestTeams(results) {
  const buckets = { D: [], I: [], S: [], C: [] };
  results.forEach((person) => buckets[person.primary || "D"].push(person));
  return ["D", "I", "S", "C"].filter((type) => buckets[type].length).map((type) => ({
    name: `${COLORS[type].emoji} ${COLORS[type].group}`,
    color: type,
    members: buckets[type].sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

function copyFacilitatorNote(record) {
  const a = analysisFor(record);
  navigator?.clipboard?.writeText?.(`${record.name}: ${COLORS[record.primary]?.short}/${COLORS[record.secondary]?.short}. ${a.facilitation} Наблюдавай: ${a.watch}`);
}

function downloadCsv(results) {
  const nl = String.fromCharCode(10);
  const rows = [["Name", "Primary", "Secondary", "Analysis", "D", "I", "S", "C", "SubmittedAt"], ...results.map((r) => [r.name, COLORS[r.primary]?.short, COLORS[r.secondary]?.short, analysisFor(r).csv, r.score?.D, r.score?.I, r.score?.S, r.score?.C, r.submittedAt])];
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join(nl);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "team-color-results.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function ColorDots() {
  return <div className="flex gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /><span className="h-3 w-3 rounded-full bg-yellow-400" /><span className="h-3 w-3 rounded-full bg-green-500" /><span className="h-3 w-3 rounded-full bg-blue-500" /></div>;
}

function TestIntro({ name, setName, start, openAdmin }) {
  return <Page center><Card className="relative w-full max-w-4xl overflow-hidden p-8 md:p-12"><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-100 blur-2xl" /><div className="absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-blue-100 blur-2xl" /><div className="relative"><div className="flex items-center justify-between gap-4"><div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Team style check</div><Button variant="secondary" onClick={openAdmin}>Admin</Button></div><div className="mt-10 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end"><div><ColorDots /><h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 md:text-7xl">Ами ако никой не е идиот?</h1><p className="mt-5 text-xl leading-relaxed text-slate-600">Понякога „идиот“ е просто човек с различен стил от нашия. Нека видим какъв е твоят.</p></div><div className="rounded-3xl bg-slate-950 p-5 text-white shadow-lg"><div className="text-sm uppercase tracking-[0.18em] text-slate-400">Как работи</div><div className="mt-4 space-y-3 text-sm text-slate-200"><div>1. Минаваш през 16 кратки екипни сцени.</div><div>2. За всяка сцена избираш първата реакция, която най-много прилича на теб.</div><div>3. Ако резултатът е близък, ще има още 3 бързи уточняващи ситуации.</div><div>4. Виждаш само своя цвят за играта.</div></div></div></div><div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]"><Input label="Име" value={name} onChange={setName} placeholder="например: Светослав" /><div className="flex items-end"><Button disabled={!name.trim()} onClick={start} className="w-full px-6 py-4 text-base md:w-auto">Продължи ›</Button></div></div><div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">Няма правилни и грешни отговори. Представи си, че си в сцената, и избери реакцията, която най-много прилича на първия ти импулс.</div></div></Card></Page>;
}

function HowUsed({ onBack, onStart }) {
  return <Page center><Card className="w-full max-w-3xl p-8 md:p-10"><div className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm text-white">Преди да започнеш</div><h1 className="mt-6 text-3xl font-semibold text-slate-950 md:text-4xl">Как ще използваме резултата?</h1><div className="mt-6 grid gap-4"><div className="rounded-2xl bg-slate-50 p-4 text-slate-700">Това не е психологическа диагноза и не е оценка на личността.</div><div className="rounded-2xl bg-slate-50 p-4 text-slate-700">Цветът е игрови ориентир за това как най-често реагираш в екипни ситуации.</div><div className="rounded-2xl bg-slate-50 p-4 text-slate-700">Ще го използваме по време на тиймбилдинга, за да видим как различните стилове влияят на комуникацията.</div></div><p className="mt-6 text-sm leading-relaxed text-slate-500">Отговаряй интуитивно. Не избирай идеалната реакция, а тази, която най-вероятно би направил/а в такъв момент.</p><div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row"><Button variant="secondary" onClick={onBack}>Назад</Button><Button onClick={onStart} className="px-6 py-3 text-base">Започни ситуациите ›</Button></div></Card></Page>;
}

function TestStep({ current, answers, choose, back, next, isLast }) {
  const answer = answers[current] || null;
  const progress = Math.round(((current + 1) / ITEMS.length) * 100);
  const canContinue = Boolean(answer);
  const item = ITEMS[current];
  return <Page center><Card className="w-full max-w-5xl p-6 md:p-10"><div className="mb-8"><div className="mb-3 flex items-center justify-between text-sm text-slate-500"><span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">Сцена {current + 1} от {ITEMS.length}</span><span>{progress}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} /></div></div><div className="mb-7 rounded-3xl bg-slate-950 p-6 text-white md:p-8"><div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Екипна ситуация</div><h2 className="text-2xl font-semibold leading-tight md:text-4xl">{item.scenario}</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">Представи си, че си в тази сцена. Не търси идеалния отговор. Избери първата реакция, която най-много прилича на теб в такъв момент. Можеш да се връщаш назад — изборите ти се запазват.</p><div className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">Само един избор на сцена</div></div><div className="grid gap-4 md:grid-cols-2">{item.options.map((option) => { const selected = answer?.id === option.id; const color = COLORS[option.type]; return <div key={option.id} onClick={() => choose(option)} className={`relative min-h-[160px] cursor-pointer rounded-3xl border p-5 transition ${selected ? "border-slate-400 bg-slate-100 text-slate-950 shadow-md ring-4 ring-slate-200" : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:shadow-sm"}`}>{selected && <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">✓ Избрано</div>}<div className="pr-20 text-lg font-semibold leading-relaxed md:text-xl">{option.text}</div><div className="absolute bottom-5 left-5 right-5"><Button variant={selected ? "primary" : "secondary"} className="w-full" onClick={(event) => { event.stopPropagation(); choose(option); }}>{selected ? "Избрано" : "Това съм аз"}</Button></div></div>; })}</div><div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row"><Button variant="secondary" disabled={current === 0} onClick={back}>‹ Предходна ситуация</Button><Button disabled={!canContinue} onClick={next} className="px-6 py-3 text-base">{!canContinue ? "Избери една реакция" : isLast ? "Продължи" : "Следваща ситуация ›"}</Button></div></Card></Page>;
}

function TieBreakerStep({ pair, current, answers, choose, back, next, isLast }) {
  const questions = getTieQuestions(pair);
  const item = questions[current];
  const answer = answers[current] || null;
  const canContinue = Boolean(answer);
  const progress = Math.round(((current + 1) / questions.length) * 100);
  return <Page center><Card className="w-full max-w-4xl p-6 md:p-10"><div className="mb-8"><div className="mb-3 flex items-center justify-between text-sm text-slate-500"><span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">Уточняване {current + 1} от {questions.length}</span><span>{progress}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} /></div></div><div className="mb-7 rounded-3xl bg-slate-950 p-6 text-white md:p-8"><div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Близък резултат</div><h2 className="text-2xl font-semibold leading-tight md:text-4xl">{item.scenario}</h2><p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">Имаш близък резултат. Представи си сцената и избери кое е по-естествено за теб, без да мислиш прекалено дълго.</p></div><div className="grid gap-4 md:grid-cols-2">{item.options.map((option) => { const selected = answer?.id === option.id; const color = COLORS[option.type]; return <div key={option.id} onClick={() => choose(option)} className={`relative min-h-[170px] cursor-pointer rounded-3xl border p-5 transition ${selected ? "border-slate-400 bg-slate-100 text-slate-950 shadow-md ring-4 ring-slate-200" : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:shadow-sm"}`}><div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Вариант</div>{selected && <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">✓ Избрано</div>}<div className="text-lg font-semibold leading-relaxed md:text-xl">{option.text}</div></div>; })}</div><div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row"><Button variant="secondary" onClick={back}>{current === 0 ? "Назад към теста" : "‹ Предходно уточняване"}</Button><Button disabled={!canContinue} onClick={next} className="px-6 py-3 text-base">{!canContinue ? "Избери една реакция" : isLast ? "Покажи цвета" : "Следващо уточняване ›"}</Button></div></Card></Page>;
}

function Result({ name, result, restart, openAdmin }) {
  const color = COLORS[result.primary];
  return <Page center><Card className={`w-full max-w-2xl p-8 text-center md:p-12 ${color.soft} ${color.border}`}><p className="text-slate-600">Благодаря, {name.trim()}!</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Твоят цвят за тиймбилдинга е:</h1><div className={`mx-auto mt-8 max-w-sm rounded-3xl bg-white p-8 ring-4 ${color.ring}`}><div className="text-7xl">{color.emoji}</div><div className={`mt-4 text-4xl font-black tracking-wider ${color.text}`}>{color.label}</div></div><p className="mt-8 text-slate-600">{COLOR_HINT}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button variant="secondary" onClick={restart}>Нов участник</Button><Button variant="secondary" onClick={openAdmin}>Admin</Button></div></Card></Page>;
}

function AdminLogin({ onBack, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = () => {
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) { sessionStorage.setItem(ADMIN_SESSION_KEY, "true"); onSuccess(); }
    else setError("Грешно потребителско име или парола.");
  };
  return <Page center><Card className="w-full max-w-md p-8"><div className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm text-white">Admin access</div><h1 className="mt-5 text-3xl font-semibold text-slate-950">Вход за фасилитатор</h1><p className="mt-2 text-slate-600">Въведи админ данните, за да видиш резултатите.</p><div className="mt-6 space-y-4"><Input label="Потребител" value={username} onChange={setUsername} placeholder="admin" onEnter={login} /><Input label="Парола" value={password} onChange={setPassword} placeholder="••••••••" type="password" onEnter={login} /></div>{error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}<div className="mt-6 flex justify-between"><Button variant="secondary" onClick={onBack}>Назад</Button><Button onClick={login}>Вход</Button></div></Card></Page>;
}

function AdminView({ onBack, onLogout }) {
  const [results, setResults] = useState(() => loadResults());
  const [showScores, setShowScores] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const refreshResults = async () => { setIsLoading(true); const next = await fetchResults(); setResults(next); setIsLoading(false); };
  useEffect(() => { refreshResults(); }, []);
  const totals = useMemo(() => results.reduce((acc, r) => ({ ...acc, [r.primary]: (acc[r.primary] || 0) + 1 }), { D: 0, I: 0, S: 0, C: 0 }), [results]);
  const radar = useMemo(() => groupRadar(results), [results]);
  const teams = useMemo(() => suggestTeams(results), [results]);
  const clear = async () => { if (window.confirm("Сигурен ли си, че искаш да изтриеш всички резултати?")) { const next = await clearStoredResults(); setResults(next); setExpanded({}); } };
  const deleteResult = async (id, index) => { const next = await deleteStoredResult(id, index); setResults(next); setExpanded((current) => { const copy = { ...current }; delete copy[id || String(index)]; return copy; }); };
  return <Page><div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm text-white">Facilitator Admin View</div><h1 className="mt-3 text-4xl font-semibold text-slate-950">Резултати</h1><p className="mt-2 text-slate-600">Видими само за фасилитатора. Участниците виждат единствено своя цвят.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={onBack}>Към теста</Button><Button variant="secondary" onClick={onLogout}>Изход</Button><Button variant="secondary" onClick={refreshResults}>{isLoading ? "Зареждам..." : "Обнови"}</Button><Button variant="secondary" onClick={() => setShowScores(!showScores)}>{showScores ? "Скрий точките" : "Покажи точките"}</Button><Button variant="secondary" disabled={!results.length} onClick={() => downloadCsv(results)}>CSV</Button><Button variant="danger" disabled={!results.length} onClick={clear}>Изчисти</Button></div></div><div className="grid gap-4 md:grid-cols-4">{Object.entries(COLORS).map(([key, color]) => <Card key={key} className={`p-5 ${color.soft} ${color.border}`}><div className="text-4xl">{color.emoji}</div><div className={`mt-3 text-lg font-bold ${color.text}`}>{color.short}</div><div className="mt-2 text-3xl font-semibold">{totals[key] || 0}</div></Card>)}</div>{results.length > 0 && <div className="grid gap-4 lg:grid-cols-2"><Card className="p-5"><div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Team risk radar</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">Какво да наблюдаваш в групата</h2><div className="mt-4 space-y-3">{radar.map((item, index) => <div key={index} className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{item}</div>)}</div></Card><Card className="p-5"><div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Color groups</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">Предложение за групи по цвят</h2><p className="mt-2 text-sm text-slate-600">Всеки участник остава в групата на своя основен цвят. Показват се само цветовете, за които има подадени резултати.</p><div className="mt-4 grid gap-3">{teams.map((team) => <div key={team.name} className={`rounded-2xl border p-4 ${COLORS[team.color].soft} ${COLORS[team.color].border}`}><div className={`mb-2 font-semibold ${COLORS[team.color].text}`}>{team.name} · {team.members.length}</div><div className="flex flex-wrap gap-2">{team.members.map((member, i) => <span key={member.id || i} className="rounded-full bg-white px-3 py-1 text-sm text-slate-700">{member.name}</span>)}</div></div>)}</div></Card></div>}<Card className="overflow-hidden">{!results.length ? <div className="p-10 text-center text-slate-500">{isLoading ? "Зареждам резултатите..." : "Още няма попълнени резултати."}</div> : <AdminTable results={results} showScores={showScores} expanded={expanded} setExpanded={setExpanded} onDelete={deleteResult} />}</Card></div></Page>;
}

function AdminTable({ results, showScores, expanded, setExpanded, onDelete }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="px-4 py-3 font-semibold">Име</th><th className="px-4 py-3 font-semibold">Основен цвят</th><th className="px-4 py-3 font-semibold">Втори цвят</th><th className="px-4 py-3 font-semibold">Анализ</th>{showScores && <><th className="px-4 py-3 font-semibold">D 🔴</th><th className="px-4 py-3 font-semibold">I 🟡</th><th className="px-4 py-3 font-semibold">S 🟢</th><th className="px-4 py-3 font-semibold">C 🔵</th></>}<th className="px-4 py-3 font-semibold">Подадено</th><th className="px-4 py-3 font-semibold">Действие</th></tr></thead><tbody className="divide-y divide-slate-100">{results.map((record, index) => { const analysis = analysisFor(record); const key = record.id || String(index); const isOpen = expanded[key]; const span = showScores ? 10 : 6; return <React.Fragment key={key}><tr className="hover:bg-slate-50"><td className="px-4 py-3 font-medium text-slate-900">{record.name}</td><td className="px-4 py-3"><Badge type={record.primary} /></td><td className="px-4 py-3"><Badge type={record.secondary} /></td><td className="px-4 py-3"><Button variant="secondary" onClick={() => setExpanded((current) => ({ ...current, [key]: !current[key] }))}>{isOpen ? "Скрий анализ" : "Виж анализ"}</Button></td>{showScores && <><td className="px-4 py-3 text-slate-700">{record.score?.D}</td><td className="px-4 py-3 text-slate-700">{record.score?.I}</td><td className="px-4 py-3 text-slate-700">{record.score?.S}</td><td className="px-4 py-3 text-slate-700">{record.score?.C}</td></>}<td className="px-4 py-3 text-slate-500">{record.submittedAt ? new Date(record.submittedAt).toLocaleString("bg-BG") : ""}</td><td className="px-4 py-3"><Button variant="danger" onClick={() => onDelete(record.id, index)}>Изтрий</Button></td></tr>{isOpen && <tr className="bg-slate-50"><td colSpan={span} className="px-4 py-5"><div className="rounded-3xl border bg-white p-5"><div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><div className="text-sm font-semibold text-slate-500">Задълбочен фасилитаторски анализ</div><h3 className="mt-1 text-xl font-semibold text-slate-950">{analysis.summary}</h3></div><span className={`rounded-full px-3 py-1 text-sm font-semibold ${confidenceClass(analysis.confidence)}`}>Профил: {analysis.confidence}</span></div><div className="mb-4"><Button variant="secondary" onClick={() => copyFacilitatorNote(record)}>Copy facilitator note</Button></div><div className="grid gap-4 md:grid-cols-2"><Info title="Как вероятно ще се включи" text={analysis.behavior} /><Info title="Силна роля в играта" text={analysis.contribution} /><Info title="Какво да наблюдаваш" text={analysis.watch} /><Info title="Как да го фасилитираш" text={analysis.facilitation} /><Info title="Комбиниране в екип" text={analysis.pairing} /><Info title="Бележка" text="Това е ориентировъчен комуникационен профил за игра и фасилитация, не психологическа диагноза." /></div></div></td></tr>}</React.Fragment>; })}</tbody></table></div>;
}

export default function DiscColorCheckApp() {
  const [step, setStep] = useState("intro");
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [tiePair, setTiePair] = useState(null);
  const [tieCurrent, setTieCurrent] = useState(0);
  const [tieAnswers, setTieAnswers] = useState({});
  const result = useMemo(() => scoreAnswers(answers, tieAnswers), [answers, tieAnswers]);

  const restart = () => { setStep("intro"); setName(""); setCurrent(0); setAnswers({}); setTiePair(null); setTieCurrent(0); setTieAnswers({}); };
  const openAdmin = () => setStep(sessionStorage.getItem(ADMIN_SESSION_KEY) === "true" ? "admin" : "adminLogin");
  const choose = (option) => setAnswers((previous) => ({ ...previous, [current]: option }));
  const chooseTie = (option) => setTieAnswers((previous) => ({ ...previous, [tieCurrent]: option }));
  const saveAndShowResult = async () => { const finalResult = scoreAnswers(answers, tieAnswers); await saveResult({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, name: name.trim(), primary: finalResult.primary, secondary: finalResult.secondary, score: finalResult.score, submittedAt: new Date().toISOString() }); setStep("result"); };
  const finishBaseTest = () => { const baseResult = scoreAnswers(answers); if (shouldUseTieBreaker(baseResult)) { setTiePair([baseResult.ranked[0][0], baseResult.ranked[1][0]]); setTieCurrent(0); setTieAnswers({}); setStep("tie"); } else { saveAndShowResult(); } };
  const finishTieBreaker = () => { if (tieCurrent === getTieQuestions(tiePair).length - 1) saveAndShowResult(); else setTieCurrent((value) => value + 1); };

  if (step === "adminLogin") return <AdminLogin onBack={restart} onSuccess={() => setStep("admin")} />;
  if (step === "admin") return <AdminView onBack={restart} onLogout={() => { sessionStorage.removeItem(ADMIN_SESSION_KEY); restart(); }} />;
  if (step === "intro") return <TestIntro name={name} setName={setName} start={() => setStep("howUsed")} openAdmin={openAdmin} />;
  if (step === "howUsed") return <HowUsed onBack={() => setStep("intro")} onStart={() => setStep("test")} />;
  if (step === "result") return <Result name={name} result={result} restart={restart} openAdmin={openAdmin} />;
  if (step === "tie") return <TieBreakerStep pair={tiePair} current={tieCurrent} answers={tieAnswers} choose={chooseTie} back={() => { if (tieCurrent === 0) setStep("test"); else setTieCurrent((value) => value - 1); }} next={finishTieBreaker} isLast={tieCurrent === getTieQuestions(tiePair).length - 1} />;
  return <TestStep current={current} answers={answers} choose={choose} back={() => setCurrent((value) => Math.max(0, value - 1))} next={() => current === ITEMS.length - 1 ? finishBaseTest() : setCurrent((value) => value + 1)} isLast={current === ITEMS.length - 1} />;
}
