// ========== 农历年份与生肖自动计算系统 ==========

// 十二生肖顺序（地支序: 子丑寅卯辰巳午未申酉戌亥）
const ZODIAC_CYCLE = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 生肖五行属性（参考信息，五行号码通过基准年平移计算）
const ZODIAC_ELEMENT = {
    '猴': '金', '鸡': '金',
    '虎': '木', '兔': '木',
    '鼠': '水', '猪': '水',
    '蛇': '火', '马': '火',
    '牛': '土', '龙': '土', '羊': '土', '狗': '土'
};

// 野肖和家肖分类（固定不变）
const WILD_ZODIACS = new Set(['鼠', '虎', '兔', '龙', '蛇', '猴']);
const DOMESTIC_ZODIACS = new Set(['牛', '马', '羊', '鸡', '狗', '猪']);

// ===== 农历新年日期查找表 (公历 [月, 日]) =====
// 覆盖 2020-2100 年，农历正月初一对应的公历日期
const LUNAR_NEW_YEAR_DATES = {
    // 2020s
    2020: [1, 25], 2021: [2, 12], 2022: [2, 1], 2023: [1, 22],
    2024: [2, 10], 2025: [1, 29], 2026: [2, 17], 2027: [2, 6],
    2028: [1, 26], 2029: [2, 13],
    // 2030s
    2030: [2, 3], 2031: [1, 23], 2032: [2, 11], 2033: [1, 31],
    2034: [2, 19], 2035: [2, 8], 2036: [1, 28], 2037: [2, 15],
    2038: [2, 4], 2039: [1, 24],
    // 2040s
    2040: [2, 12], 2041: [2, 1], 2042: [1, 22], 2043: [2, 10],
    2044: [1, 30], 2045: [2, 17], 2046: [2, 6], 2047: [1, 26],
    2048: [2, 14], 2049: [2, 2],
    // 2050s
    2050: [1, 23], 2051: [2, 11], 2052: [2, 1], 2053: [2, 19],
    2054: [2, 8], 2055: [1, 28], 2056: [2, 15], 2057: [2, 4],
    2058: [1, 24], 2059: [2, 12],
    // 2060s
    2060: [2, 2], 2061: [1, 21], 2062: [2, 9], 2063: [1, 29],
    2064: [2, 17], 2065: [2, 5], 2066: [1, 26], 2067: [2, 14],
    2068: [2, 3], 2069: [1, 23],
    // 2070s
    2070: [2, 11], 2071: [1, 31], 2072: [2, 19], 2073: [2, 7],
    2074: [1, 27], 2075: [2, 15], 2076: [2, 5], 2077: [1, 24],
    2078: [2, 12], 2079: [2, 2],
    // 2080s
    2080: [1, 22], 2081: [2, 9], 2082: [1, 29], 2083: [2, 17],
    2084: [2, 6], 2085: [1, 26], 2086: [2, 14], 2087: [2, 3],
    2088: [1, 24], 2089: [2, 10],
    // 2090s
    2090: [1, 30], 2091: [2, 18], 2092: [2, 7], 2093: [1, 27],
    2094: [2, 15], 2095: [2, 5], 2096: [1, 25], 2097: [2, 12],
    2098: [2, 1], 2099: [1, 21],
    // 2100
    2100: [2, 9]
};

// ===== 万能农历新年计算算法（超出查找表范围时的后备方案）=====
// 基于 Jean Meeus 天文新月算法

/** 公历日期 → 儒略日 */
function _gregorianToJD(y, m, d) {
    if (m <= 2) { y--; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

/** 儒略日 → 公历日期 {year, month, day} */
function _jdToGregorian(jd) {
    jd += 0.5;
    const Z = Math.floor(jd);
    let A;
    if (Z < 2299161) {
        A = Z;
    } else {
        const alpha = Math.floor((Z - 1867216.25) / 36524.25);
        A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    const day = B - D - Math.floor(30.6001 * E);
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;
    return { year, month, day };
}

/**
 * 计算第 k 个新月的儒略日（Jean Meeus 算法）
 * k=0 对应 2000年1月6日附近的新月
 */
function _getNewMoonJD(k) {
    const T = k / 1236.85;
    const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    let JDE = 2451550.09766 + 29.530588861 * k
        + 0.00015437 * T2 - 0.000000150 * T3 + 0.00000000073 * T4;

    const E = 1 - 0.002516 * T - 0.0000074 * T2;
    const toRad = Math.PI / 180;

    const M = (2.5534 + 29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3) * toRad;
    const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * toRad;
    const F = (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * toRad;
    const O = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * toRad;

    JDE += -0.40720 * Math.sin(Mp)
        + 0.17241 * E * Math.sin(M)
        + 0.01608 * Math.sin(2 * Mp)
        + 0.01039 * Math.sin(2 * F)
        + 0.00739 * E * Math.sin(Mp - M)
        - 0.00514 * E * Math.sin(Mp + M)
        + 0.00208 * E * E * Math.sin(2 * M)
        - 0.00111 * Math.sin(Mp - 2 * F)
        - 0.00057 * Math.sin(Mp + 2 * F)
        + 0.00056 * E * Math.sin(2 * Mp + M)
        - 0.00042 * Math.sin(3 * Mp)
        + 0.00042 * E * Math.sin(M + 2 * F)
        + 0.00038 * E * Math.sin(M - 2 * F)
        - 0.00024 * E * Math.sin(2 * Mp - M)
        - 0.00017 * Math.sin(O)
        - 0.00007 * Math.sin(Mp + 2 * M)
        + 0.00004 * Math.sin(2 * Mp - 2 * F)
        + 0.00004 * Math.sin(3 * M)
        + 0.00003 * Math.sin(Mp + M - 2 * F)
        + 0.00003 * Math.sin(2 * Mp + 2 * F)
        - 0.00003 * Math.sin(Mp + M + 2 * F)
        + 0.00003 * Math.sin(Mp - M + 2 * F)
        - 0.00002 * Math.sin(Mp - M - 2 * F)
        - 0.00002 * Math.sin(3 * Mp + M)
        + 0.00002 * Math.sin(4 * Mp);
    return JDE;
}

/**
 * 万能公式：通过天文算法计算指定公历年的农历新年日期
 * 农历新年 = 冬至后第二个新月
 * @param {number} gregorianYear - 公历年份
 * @returns {[number, number]} [月, 日]
 */
function calculateLunarNewYear(gregorianYear) {
    // 冬至约在前一年12月21日
    const winterSolsticeJD = _gregorianToJD(gregorianYear - 1, 12, 21);

    // 估算 k 值（新月序号，k=0 对应 2000-01-06 附近）
    const approxK = Math.floor((gregorianYear - 2000) * 12.3685) - 2;
    let k = approxK;

    // 找冬至后第一个新月
    while (_getNewMoonJD(k) < winterSolsticeJD) k++;
    // 冬至后第二个新月 = 农历新年
    const lnyJD = _getNewMoonJD(k + 1);
    const date = _jdToGregorian(lnyJD);

    // 返回 UTC+8 校正后的日期
    return [date.month, date.day];
}

/**
 * 获取指定公历年的农历新年日期 [月, 日]
 * 优先使用查找表，超出范围时使用天文算法
 */
function getLunarNewYearDate(gregorianYear) {
    if (LUNAR_NEW_YEAR_DATES[gregorianYear]) {
        return LUNAR_NEW_YEAR_DATES[gregorianYear];
    }
    // 后备：天文算法
    console.warn(`⚠️ ${gregorianYear}年不在查找表范围(2020-2100)，使用天文算法估算`);
    return calculateLunarNewYear(gregorianYear);
}

/**
 * 获取当前农历年信息
 * 根据公历日期判断是否已过农历新年，确定当前农历年份，再计算生肖
 * @returns {{ lunarYear: number, zodiac: string }}
 */
function getCurrentLunarYearInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    let lunarYear = year;

    // 获取当年的农历新年日期（查找表或算法）
    const [lnyMonth, lnyDay] = getLunarNewYearDate(year);
    if (month < lnyMonth || (month === lnyMonth && day < lnyDay)) {
        // 还没过春节，属于上一个农历年
        lunarYear = year - 1;
    }

    // 计算地支索引: (lunarYear - 4) % 12 → 0=鼠, 1=牛, ..., 5=蛇, 6=马...
    const zodiacIndex = ((lunarYear - 4) % 12 + 12) % 12;
    return { lunarYear, zodiac: ZODIAC_CYCLE[zodiacIndex] };
}

/**
 * 根据当年生肖动态生成号码映射
 * 规则：号码1对应当年生肖，然后按生肖逆序排列（向前回溯），每12个号码一轮
 * 当年生肖分配5个号码（1,13,25,37,49），其余生肖各4个号码
 * @param {string} currentZodiac - 当前农历年的生肖
 * @param {number} lunarYear - 当前农历年份（如2026）
 */
function generateNumberMappings(currentZodiac, lunarYear) {
    const currentIndex = ZODIAC_CYCLE.indexOf(currentZodiac);

    // 构建生肖→号码映射
    const zodiacMap = {};
    ZODIAC_CYCLE.forEach(z => zodiacMap[z] = []);

    for (let num = 1; num <= 49; num++) {
        // 号码 num 对应的生肖：从当年生肖开始，每个号码向前回溯一个生肖
        const offset = (num - 1) % 12;
        // 生肖序列是逆序的：1→当年, 2→前一年, 3→前两年...
        const zodiacIdx = ((currentIndex - offset) % 12 + 12) % 12;
        const zodiac = ZODIAC_CYCLE[zodiacIdx];
        zodiacMap[zodiac].push(num);
    }

    // ===== 五行号码计算 =====
    // 五行号码基于固定的位置映射，每年整体平移1位（与生肖平移同步）
    // 基准年: 2025 蛇年 (蛇在ZODIAC_CYCLE中index=5)
    // 基准年五行数据（已验证正确）:
    const BASE_ELEMENT = {
        '金': [3, 4, 11, 12, 25, 26, 33, 34, 41, 42],
        '木': [7, 8, 15, 16, 23, 24, 37, 38, 45, 46],
        '水': [13, 14, 21, 22, 29, 30, 43, 44],
        '火': [1, 2, 9, 10, 17, 18, 31, 32, 39, 40, 47, 48],
        '土': [5, 6, 19, 20, 27, 28, 35, 36, 49]
    };
    const BASE_YEAR = 2025; // 基准公历年份

    // 计算当前年份相对于基准年的偏移量
    // 每前进1个农历年，所有五行号码整体 +1
    // 例如：2025蛇年 金=[3,4,...] → 2026马年 金=[4,5,...] → 2027羊年 金=[5,6,...]
    const shift = lunarYear - BASE_YEAR;

    // 辅助函数：将号码按偏移量向前平移，范围限制在1-49
    function shiftNumber(n, offset) {
        let result = n + offset;
        // 处理循环：49个号码的循环 (1-49)
        while (result > 49) result -= 49;
        while (result < 1) result += 49;
        return result;
    }

    const elementMap = { '金': [], '木': [], '水': [], '火': [], '土': [] };
    for (const el in BASE_ELEMENT) {
        elementMap[el] = BASE_ELEMENT[el].map(n => shiftNumber(n, shift)).sort((a, b) => a - b);
    }

    // 构建野肖/家肖→号码映射
    const wildNumbers = [];
    const domesticNumbers = [];
    for (const zodiac in zodiacMap) {
        if (WILD_ZODIACS.has(zodiac)) {
            wildNumbers.push(...zodiacMap[zodiac]);
        } else if (DOMESTIC_ZODIACS.has(zodiac)) {
            domesticNumbers.push(...zodiacMap[zodiac]);
        }
    }
    wildNumbers.sort((a, b) => a - b);
    domesticNumbers.sort((a, b) => a - b);

    return {
        zodiac: zodiacMap,
        element: elementMap,
        beast: { '野肖': wildNumbers, '家肖': domesticNumbers },
        currentZodiac: currentZodiac
    };
}

// 获取当前农历年信息并生成映射
const lunarYearInfo = getCurrentLunarYearInfo();
const currentZodiac = lunarYearInfo.zodiac;
const currentLunarYear = lunarYearInfo.lunarYear;
const dynamicMappings = generateNumberMappings(currentZodiac, currentLunarYear);

// ========== 号码数据定义（动态生成）==========
const numberData = {
    numbers: Array.from({ length: 49 }, (_, i) => i + 1),

    // 生肖（根据当前农历年自动计算）
    zodiac: dynamicMappings.zodiac,

    // 野肖和家肖（根据生肖自动计算）
    beast: dynamicMappings.beast,

    // 五行（根据生肖五行属性自动计算）
    element: dynamicMappings.element,

    // 大小
    size: {
        big: Array.from({ length: 25 }, (_, i) => i + 25),
        small: Array.from({ length: 24 }, (_, i) => i + 1)
    },

    // 尾大尾小
    tailSize: {
        big: [5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 25, 26, 27, 28, 29, 35, 36, 37, 38, 39, 45, 46, 47, 48, 49],
        small: [1, 2, 3, 4, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34, 40, 41, 42, 43, 44]
    },

    // 单双
    parity: {
        odd: Array.from({ length: 25 }, (_, i) => i * 2 + 1).filter(n => n <= 49),
        even: Array.from({ length: 24 }, (_, i) => (i + 1) * 2).filter(n => n <= 49)
    },

    // 波色
    wave: {
        red: [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
        blue: [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
        green: [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
    },

    // 头数
    head: {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        2: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
        3: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
        4: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
    },

    // 尾数
    tail: {
        0: [10, 20, 30, 40],
        1: [1, 11, 21, 31, 41],
        2: [2, 12, 22, 32, 42],
        3: [3, 13, 23, 33, 43],
        4: [4, 14, 24, 34, 44],
        5: [5, 15, 25, 35, 45],
        6: [6, 16, 26, 36, 46],
        7: [7, 17, 27, 37, 47],
        8: [8, 18, 28, 38, 48],
        9: [9, 19, 29, 39, 49]
    },

    // 七段（每7个号码一段，共7段）
    segment: {
        1: [1, 2, 3, 4, 5, 6, 7],
        2: [8, 9, 10, 11, 12, 13, 14],
        3: [15, 16, 17, 18, 19, 20, 21],
        4: [22, 23, 24, 25, 26, 27, 28],
        5: [29, 30, 31, 32, 33, 34, 35],
        6: [36, 37, 38, 39, 40, 41, 42],
        7: [43, 44, 45, 46, 47, 48, 49]
    }
};

// ========== 预计算映射表 ==========
const numberToZodiac = {};
const numberToWave = {};
const numberToElement = {};
const ALL_NUMBERS = Object.freeze([...numberData.numbers]);
const waveRedSet = new Set(numberData.wave.red);
const waveBlueSet = new Set(numberData.wave.blue);
const waveGreenSet = new Set(numberData.wave.green);
const tailBigSet = new Set(numberData.tailSize.big);
const wildSet = new Set(numberData.beast['野肖']);

// 初始化映射
(function initMappings() {
    for (const zodiac in numberData.zodiac) {
        numberData.zodiac[zodiac].forEach(num => numberToZodiac[num] = zodiac);
    }
    numberData.wave.red.forEach(num => numberToWave[num] = 'red');
    numberData.wave.blue.forEach(num => numberToWave[num] = 'blue');
    numberData.wave.green.forEach(num => numberToWave[num] = 'green');
    for (const element in numberData.element) {
        numberData.element[element].forEach(num => numberToElement[num] = element);
    }
})();

// ========== 筛选按钮配置 ==========
const filterMap = {
    'red': numberData.wave.red,
    'blue': numberData.wave.blue,
    'green': numberData.wave.green,
    'big': numberData.size.big,
    'small': numberData.size.small,
    'odd': numberData.parity.odd,
    'even': numberData.parity.even,
    'wild': numberData.beast['野肖'],
    'domestic': numberData.beast['家肖'],
    'tailBig': numberData.tailSize.big,
    'tailSmall': numberData.tailSize.small,
    'head0': numberData.head[0],
    'head1': numberData.head[1],
    'head2': numberData.head[2],
    'head3': numberData.head[3],
    'head4': numberData.head[4],
    'tail0': numberData.tail[0],
    'tail1': numberData.tail[1],
    'tail2': numberData.tail[2],
    'tail3': numberData.tail[3],
    'tail4': numberData.tail[4],
    'tail5': numberData.tail[5],
    'tail6': numberData.tail[6],
    'tail7': numberData.tail[7],
    'tail8': numberData.tail[8],
    'tail9': numberData.tail[9],
    'gold': numberData.element['金'],
    'wood': numberData.element['木'],
    'water': numberData.element['水'],
    'fire': numberData.element['火'],
    'earth': numberData.element['土'],
    'seg1': numberData.segment[1],
    'seg2': numberData.segment[2],
    'seg3': numberData.segment[3],
    'seg4': numberData.segment[4],
    'seg5': numberData.segment[5],
    'seg6': numberData.segment[6],
    'seg7': numberData.segment[7]
};

function buildIntersectionNumbers(filterKeys) {
    const groups = filterKeys
        .map(key => filterMap[key])
        .filter(numbers => Array.isArray(numbers) && numbers.length > 0)
        .map(numbers => new Set(numbers));

    if (groups.length === 0) return [];
    return ALL_NUMBERS.filter(num => groups.every(set => set.has(num)));
}

const TWO_SIDE_ADVANCED_FILTERS = [
    { key: 'wildBig', label: '野大', filterKeys: ['wild', 'big'] },
    { key: 'wildSmall', label: '野小', filterKeys: ['wild', 'small'] },
    { key: 'wildOdd', label: '野单', filterKeys: ['wild', 'odd'] },
    { key: 'wildEven', label: '野双', filterKeys: ['wild', 'even'] },
    { key: 'domesticBig', label: '家大', filterKeys: ['domestic', 'big'] },
    { key: 'domesticSmall', label: '家小', filterKeys: ['domestic', 'small'] },
    { key: 'domesticOdd', label: '家单', filterKeys: ['domestic', 'odd'] },
    { key: 'domesticEven', label: '家双', filterKeys: ['domestic', 'even'] }
];

const WAVE_ADVANCED_FILTERS = [
    { key: 'redBig', label: '红大', filterKeys: ['red', 'big'] },
    { key: 'redSmall', label: '红小', filterKeys: ['red', 'small'] },
    { key: 'redOdd', label: '红单', filterKeys: ['red', 'odd'] },
    { key: 'redEven', label: '红双', filterKeys: ['red', 'even'] },
    { key: 'blueBig', label: '蓝大', filterKeys: ['blue', 'big'] },
    { key: 'blueSmall', label: '蓝小', filterKeys: ['blue', 'small'] },
    { key: 'blueOdd', label: '蓝单', filterKeys: ['blue', 'odd'] },
    { key: 'blueEven', label: '蓝双', filterKeys: ['blue', 'even'] },
    { key: 'greenBig', label: '绿大', filterKeys: ['green', 'big'] },
    { key: 'greenSmall', label: '绿小', filterKeys: ['green', 'small'] },
    { key: 'greenOdd', label: '绿单', filterKeys: ['green', 'odd'] },
    { key: 'greenEven', label: '绿双', filterKeys: ['green', 'even'] }
];

[...TWO_SIDE_ADVANCED_FILTERS, ...WAVE_ADVANCED_FILTERS].forEach(({ key, filterKeys }) => {
    filterMap[key] = buildIntersectionNumbers(filterKeys);
});

const FILTER_KEYWORD_CONFIGS = [
    { filter: 'big', keywords: ['大号'] },
    { filter: 'small', keywords: ['小号'] },
    { filter: 'odd', keywords: ['单数'] },
    { filter: 'even', keywords: ['双数'] },
    { filter: 'tailBig', keywords: ['尾大'] },
    { filter: 'tailSmall', keywords: ['尾小'] },
    { filter: 'wild', keywords: ['野肖', '野兽'] },
    { filter: 'domestic', keywords: ['家肖', '家畜'] },
    { filter: 'red', keywords: ['红', '红波'] },
    { filter: 'blue', keywords: ['蓝', '蓝波'] },
    { filter: 'green', keywords: ['绿', '绿波'] },
    ...TWO_SIDE_ADVANCED_FILTERS.map(({ key, label }) => ({ filter: key, keywords: [label] })),
    ...WAVE_ADVANCED_FILTERS.map(({ key, label }) => ({ filter: key, keywords: [label] }))
];

const filterCategories = {
    'bigSmall': ['big', 'small'],
    'oddEven': ['odd', 'even'],
    'wildDomestic': ['wild', 'domestic'],
    'tailBigSmall': ['tailBig', 'tailSmall'],
    'twoSideCombo': TWO_SIDE_ADVANCED_FILTERS.map(({ key }) => key),
    'wave': ['red', 'blue', 'green'],
    'waveCombo': WAVE_ADVANCED_FILTERS.map(({ key }) => key),
    'element': ['gold', 'wood', 'water', 'fire', 'earth'],
    'head': ['head0', 'head1', 'head2', 'head3', 'head4'],
    'segment': ['seg1', 'seg2', 'seg3', 'seg4', 'seg5', 'seg6', 'seg7'],
    'tail': ['tail0', 'tail1', 'tail2', 'tail3', 'tail4', 'tail5', 'tail6', 'tail7', 'tail8', 'tail9'],
    'zodiac': (() => {
        // 动态生成生肖顺序：当年生肖排第一，然后逆序排列
        const idx = ZODIAC_CYCLE.indexOf(currentZodiac);
        const ordered = [];
        for (let i = 0; i < 12; i++) {
            ordered.push(ZODIAC_CYCLE[((idx - i) % 12 + 12) % 12]);
        }
        return ordered;
    })()
};

const categoryNames = {
    'bigSmall': '大小',
    'oddEven': '单双',
    'wildDomestic': '野肖/家肖',
    'tailBigSmall': '尾大小',
    'twoSideCombo': '两面组合',
    'wave': '波色',
    'waveCombo': '波色组合',
    'element': '五行',
    'head': '头数',
    'segment': '七段',
    'tail': '尾数',
    'zodiac': '生肖'
};

// ========== 核心状态 ==========
const PREVIEW_COMBINATION_LIMIT = 100;
const MAX_COPY_COMBINATIONS = 50000;

function createLastResult(mode = 'single') {
    return {
        mode,
        numbers: [],
        combinations: [],
        combinationCount: 0,
        buildCopyText: null,
        copyWarning: ''
    };
}

const state = {
    conditions: [],
    nextConditionId: 1,
    nextCustomNumberId: 1,    // 选号盘点击 -> 号码x
    nextDefinitionId: 1,      // 输入框输入 -> 定义x
    currentMode: 'single',
    lastResult: createLastResult('single')
};

// ========== 输入管理器（统一管理输入状态）==========
const InputManager = {
    selectedNumbers: new Set(),

    // 获取当前输入来源和数据
    getInput() {
        const inputValue = dom.customInput?.value.trim() || '';
        const activeBtn = document.querySelector('.filter-btn.active');

        if (inputValue) {
            return {
                source: 'input',
                numbers: parseNumberInput(inputValue),
                label: inputValue,
                category: null,
                categoryName: null
            };
        }

        if (this.selectedNumbers.size > 0) {
            const category = activeBtn ? getButtonCategory(activeBtn) : null;
            return {
                source: activeBtn ? 'filter' : 'picker',
                numbers: Array.from(this.selectedNumbers),
                label: activeBtn ? getActiveFilterLabels() : `${this.selectedNumbers.size}个号码`,
                category: category,
                categoryName: category ? categoryNames[category] : null
            };
        }

        return null;
    },

    // 添加号码到选择集
    addNumber(num) {
        this.selectedNumbers.add(num);
        getBall(num)?.classList.add('highlight');
    },

    // 移除号码
    removeNumber(num) {
        this.selectedNumbers.delete(num);
        getBall(num)?.classList.remove('highlight');
    },

    // 切换号码选择
    toggleNumber(num) {
        if (this.selectedNumbers.has(num)) {
            this.removeNumber(num);
        } else {
            this.addNumber(num);
        }
    },

    // 设置号码集合（用于筛选按钮）
    setNumbers(numbers) {
        this.clear(false);
        numbers.forEach(num => this.addNumber(num));
    },

    // 清空所有输入状态
    clear(clearInput = true) {
        this.selectedNumbers.clear();

        // 清除号码球高亮
        for (let i = 1; i <= 49; i++) {
            getBall(i)?.classList.remove('highlight');
        }

        // 清除筛选按钮激活状态
        document.querySelectorAll('.filter-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });

        // 清除输入框
        if (clearInput && dom.customInput) {
            dom.customInput.value = '';
        }
    },

    // 清除筛选按钮和输入框（用于号码球点击时）
    clearFiltersAndInput() {
        document.querySelectorAll('.filter-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
        if (dom.customInput) {
            dom.customInput.value = '';
        }
    }
};

// ========== DOM 缓存 ==========
const dom = {
    numberGrid: null,
    customInput: null,
    resultContent: null,
    calcMode: null,
    numberBalls: {}
};

// ========== 工具函数 ==========
const isDragMode = () => state.currentMode.startsWith('drag');
const isCompoundMode = () => state.currentMode.startsWith('compound');
const getModeNumber = () => parseInt(state.currentMode.replace(/\D/g, '')) || 0;

function getBall(num) {
    if (!dom.numberBalls[num]) {
        dom.numberBalls[num] = document.querySelector(`.number-ball[data-number="${num}"]`);
    }
    return dom.numberBalls[num];
}

function formatNumber(n) {
    return n.toString().padStart(2, '0');
}

function formatNumbers(numbers) {
    return numbers.map(formatNumber).join(', ');
}

function sortNumbers(arr) {
    return [...arr].sort((a, b) => a - b);
}

function countCombinations(total, pick) {
    if (pick < 0 || pick > total) return 0;
    if (pick === 0 || pick === total) return 1;

    let result = 1;
    const k = Math.min(pick, total - pick);
    for (let i = 1; i <= k; i++) {
        result = (result * (total - k + i)) / i;
    }
    return Math.round(result);
}

function iterateCombinations(arr, n, handler) {
    if (n < 0 || n > arr.length) return true;
    if (n === 0) return handler([]) !== false;

    const combo = [];
    let shouldContinue = true;

    function combine(start) {
        if (!shouldContinue) return;

        if (combo.length === n) {
            if (handler([...combo]) === false) {
                shouldContinue = false;
            }
            return;
        }

        const need = n - combo.length;
        for (let i = start; i <= arr.length - need && shouldContinue; i++) {
            combo.push(arr[i]);
            combine(i + 1);
            combo.pop();
        }
    }

    combine(0);
    return shouldContinue;
}

function generateCombinationPreview(arr, n, limit = PREVIEW_COMBINATION_LIMIT) {
    const preview = [];
    iterateCombinations(arr, n, combo => {
        preview.push(combo);
        return preview.length < limit;
    });
    return preview;
}

function buildCombinationCopyText(arr, n, totalCount) {
    if (totalCount > MAX_COPY_COMBINATIONS) return null;

    const lines = [];
    iterateCombinations(arr, n, combo => {
        lines.push(formatNumbers(combo));
    });
    return lines.join('\n');
}

function buildDragContext(filteredBankerArr, filteredLegArr) {
    const bankerSet = new Set(filteredBankerArr);
    const legSet = new Set(filteredLegArr);

    return {
        pureBankers: filteredBankerArr.filter(num => !legSet.has(num)),
        overlap: filteredBankerArr.filter(num => legSet.has(num)),
        pureLegs: filteredLegArr.filter(num => !bankerSet.has(num))
    };
}

function getDragSelectionPatterns(dragContext, n) {
    const patterns = [];
    const { pureBankers, overlap, pureLegs } = dragContext;

    for (let p = 0; p <= Math.min(1, pureBankers.length, n); p++) {
        for (let o = 0; o <= Math.min(overlap.length, n - p); o++) {
            const l = n - p - o;
            if (l < 0 || l > pureLegs.length) continue;
            if (p + o === 0) continue;
            if (o + l === 0) continue;
            patterns.push({ p, o, l });
        }
    }

    return patterns;
}

function countDragCombinations(dragContext, n) {
    return getDragSelectionPatterns(dragContext, n).reduce((total, { p, o, l }) => {
        return total + (
            countCombinations(dragContext.pureBankers.length, p)
            * countCombinations(dragContext.overlap.length, o)
            * countCombinations(dragContext.pureLegs.length, l)
        );
    }, 0);
}

function iterateDragCombinations(dragContext, n, handler, limit = Infinity) {
    const { pureBankers, overlap, pureLegs } = dragContext;
    const allNumbers = sortNumbers([...new Set([...pureBankers, ...overlap, ...pureLegs])]);
    const pureBankerSet = new Set(pureBankers);
    const overlapSet = new Set(overlap);
    const pureLegSet = new Set(pureLegs);
    const suffixBanker = new Array(allNumbers.length + 1).fill(0);
    const suffixLeg = new Array(allNumbers.length + 1).fill(0);
    const combo = [];
    let generated = 0;
    let shouldContinue = true;

    for (let i = allNumbers.length - 1; i >= 0; i--) {
        const num = allNumbers[i];
        const isBanker = pureBankerSet.has(num) || overlapSet.has(num);
        const isLeg = overlapSet.has(num) || pureLegSet.has(num);
        suffixBanker[i] = suffixBanker[i + 1] + (isBanker ? 1 : 0);
        suffixLeg[i] = suffixLeg[i + 1] + (isLeg ? 1 : 0);
    }

    function combine(start, pureBankerCount, bankerCount, legCount) {
        if (!shouldContinue) return;
        if (pureBankerCount > 1) return;

        if (combo.length === n) {
            if (bankerCount > 0 && legCount > 0) {
                generated++;
                if (handler([...combo], generated) === false || generated >= limit) {
                    shouldContinue = false;
                }
            }
            return;
        }

        const need = n - combo.length;
        if (allNumbers.length - start < need) return;
        if (bankerCount === 0 && suffixBanker[start] === 0) return;
        if (legCount === 0 && suffixLeg[start] === 0) return;

        for (let i = start; i <= allNumbers.length - need && shouldContinue; i++) {
            const num = allNumbers[i];
            const isPureBanker = pureBankerSet.has(num);
            const isOverlap = overlapSet.has(num);
            const isPureLeg = pureLegSet.has(num);

            combo.push(num);
            combine(
                i + 1,
                pureBankerCount + (isPureBanker ? 1 : 0),
                bankerCount + ((isPureBanker || isOverlap) ? 1 : 0),
                legCount + ((isOverlap || isPureLeg) ? 1 : 0)
            );
            combo.pop();
        }
    }

    combine(0, 0, 0, 0);
    return generated;
}

function generateDragCombinationPreview(dragContext, n, limit = PREVIEW_COMBINATION_LIMIT) {
    const preview = [];
    iterateDragCombinations(dragContext, n, combo => {
        preview.push(combo);
        return preview.length < limit;
    }, limit);
    return preview;
}

function buildDragCopyText(dragContext, n, totalCount) {
    if (totalCount > MAX_COPY_COMBINATIONS) return null;

    const lines = [];
    iterateDragCombinations(dragContext, n, combo => {
        lines.push(formatNumbers(combo));
    });
    return lines.join('\n');
}

function getKilledNumbers(excludeConditions) {
    const killed = new Set();
    excludeConditions.forEach(c => c.numbers.forEach(n => killed.add(n)));
    return killed;
}

function excludeKilledNumbers(numbers, killedSet) {
    return numbers.filter(n => !killedSet.has(n));
}

function getButtonCategory(btn) {
    const filter = btn.dataset.filter;
    const zodiac = btn.dataset.zodiac;
    if (zodiac) return 'zodiac';
    for (const category in filterCategories) {
        if (filterCategories[category].includes(filter)) {
            return category;
        }
    }
    return null;
}

function getButtonNumbers(btn) {
    const filter = btn.dataset.filter;
    const zodiac = btn.dataset.zodiac;
    if (zodiac) return numberData.zodiac[zodiac] || [];
    return filterMap[filter] || [];
}

function getActiveFilterLabels() {
    const activeButtons = document.querySelectorAll('.filter-btn.active');
    if (activeButtons.length === 0) return '';
    const labels = [];
    activeButtons.forEach(btn => {
        const text = btn.textContent.trim();
        if (text && text !== '清空选号') labels.push(text);
    });
    return labels.join('+');
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function () {
    dom.numberGrid = document.getElementById('numberGrid');
    dom.customInput = document.getElementById('customInput');
    dom.resultContent = document.getElementById('resultContent');
    dom.calcMode = document.getElementById('calcMode');

    initZodiacButtons();
    initAdvancedFilterButtons();
    initNumberGrid();
    initFilterButtons();
    initOperationButtons();
    initModeSelect();
    updateResultDisplay();

    // 在控制台输出当前年份映射信息，方便验证
    console.log(`🐾 当前农历年: ${currentLunarYear} ${currentZodiac}年`);
    console.log('📋 生肖号码映射:', numberData.zodiac);
    console.log('🔮 五行号码映射:', numberData.element);
});

// ========== 动态生成生肖按钮 ==========
function initZodiacButtons() {
    const container = document.getElementById('zodiacButtons');
    if (!container) return;

    container.innerHTML = '';
    const zodiacOrder = filterCategories['zodiac'];

    zodiacOrder.forEach(zodiac => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-btn zodiac-btn';
        btn.dataset.zodiac = zodiac;
        btn.textContent = zodiac;

        // 当年生肖加特殊标记
        if (zodiac === currentZodiac) {
            btn.title = `${zodiac}（今年生肖）`;
        }

        container.appendChild(btn);
    });
}

function initAdvancedFilterButtons() {
    renderDerivedFilterButtons('twoSideAdvancedButtons', TWO_SIDE_ADVANCED_FILTERS);
    renderDerivedFilterButtons('waveAdvancedButtons', WAVE_ADVANCED_FILTERS);
}

function renderDerivedFilterButtons(containerId, filterDefinitions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    filterDefinitions.forEach(({ key, label }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-btn';
        btn.dataset.filter = key;
        btn.textContent = label;
        container.appendChild(btn);
    });
}

// ========== 号码网格 ==========
function initNumberGrid() {
    const grid = dom.numberGrid;
    grid.innerHTML = '';

    for (let i = 1; i <= 49; i++) {
        const ball = document.createElement('div');
        const wave = numberToWave[i];
        const zodiac = numberToZodiac[i];

        ball.className = `number-ball ball-${wave}`;
        ball.dataset.number = i;
        ball.innerHTML = `
            <span class="ball-number">${formatNumber(i)}</span>
            <span class="ball-zodiac">${zodiac}</span>
        `;

        ball.addEventListener('click', () => handleBallClick(i));
        grid.appendChild(ball);
        dom.numberBalls[i] = ball;
    }
}

function handleBallClick(num) {
    // 点击号码球时，清除筛选按钮和输入框状态
    InputManager.clearFiltersAndInput();
    InputManager.toggleNumber(num);
}

// ========== 筛选按钮 ==========
function initFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => handleFilterClick(btn));
    });
}

function handleFilterClick(btn) {
    if (dom.customInput) {
        dom.customInput.value = '';
    }

    const currentCategory = getButtonCategory(btn);
    const isActive = btn.classList.contains('active');
    const numbersToToggle = getButtonNumbers(btn);

    if (isActive) {
        // 取消选中
        numbersToToggle.forEach(num => InputManager.removeNumber(num));
        btn.classList.remove('active');
    } else {
        // 选中前先清除其他分类
        clearOtherCategories(currentCategory);
        numbersToToggle.forEach(num => InputManager.addNumber(num));
        btn.classList.add('active');
    }
}

function clearOtherCategories(currentCategory) {
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        if (getButtonCategory(btn) !== currentCategory) {
            btn.classList.remove('active');
        }
    });

    // 重新计算预览号码
    InputManager.selectedNumbers.clear();
    for (let i = 1; i <= 49; i++) {
        getBall(i)?.classList.remove('highlight');
    }

    // 重新添加当前分类中仍然激活的按钮的号码
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        getButtonNumbers(btn).forEach(num => InputManager.addNumber(num));
    });
}

// ========== 操作按钮 ==========
function initOperationButtons() {
    // 输入框实时高亮
    dom.customInput.addEventListener('input', function () {
        const input = this.value.trim();
        InputManager.clear(false);

        if (input) {
            parseNumberInput(input).forEach(num => InputManager.addNumber(num));
        }
    });

    // 添加按钮
    document.getElementById('addNumbersBtn').addEventListener('click', handleAddNumbers);

    // 反选按钮
    document.getElementById('invertNumbersBtn').addEventListener('click', handleInvertNumbers);

    // 杀号按钮
    document.getElementById('killNumbersBtn').addEventListener('click', handleKillNumbers);

    // 清空按钮
    document.getElementById('clearAllBtn').addEventListener('click', clearAllConditions);

    // 复制结果
    document.getElementById('copyResultBtn').addEventListener('click', handleCopyResult);

    // 回车添加
    dom.customInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddNumbers();
    });
}

function handleInvertNumbers() {
    const input = InputManager.getInput();

    if (!input || input.numbers.length === 0) {
        alert('请先输入或选择需要反选的号码');
        return;
    }

    const selectedSet = new Set(input.numbers);
    const invertedNumbers = ALL_NUMBERS.filter(num => !selectedSet.has(num));

    InputManager.clear();
    invertedNumbers.forEach(num => InputManager.addNumber(num));
}

function handleAddNumbers() {
    const input = InputManager.getInput();

    if (!input || input.numbers.length === 0) {
        alert('请先输入或选择号码');
        return;
    }

    if (isDragMode()) {
        showDragTypeDialog(input);
    } else {
        addCondition(input, 'include');
        InputManager.clear();
    }
}

function handleKillNumbers() {
    const input = InputManager.getInput();

    if (!input || input.numbers.length === 0) {
        alert('请先输入或选择要杀的号码');
        return;
    }

    const type = isDragMode() ? 'dragExclude' : 'exclude';
    addCondition(input, type);
    InputManager.clear();
}

function handleCopyResult() {
    const { numbers, combinations, combinationCount, buildCopyText, copyWarning } = state.lastResult;

    if (numbers.length === 0 && combinations.length === 0 && combinationCount === 0) {
        alert('没有可复制的内容');
        return;
    }

    if (state.currentMode === 'single') {
        copyToClipboard(formatNumbers(numbers));
        return;
    }

    if (combinationCount === 0) {
        alert('没有可复制的组合结果');
        return;
    }

    let textToCopy = buildCopyText ? buildCopyText() : '';
    if (!textToCopy) {
        textToCopy = combinations.map(formatNumbers).join('\n');
        if (copyWarning) {
            alert(copyWarning);
        }
    }

    copyToClipboard(textToCopy);
}

function initModeSelect() {
    dom.calcMode.addEventListener('change', function () {
        state.currentMode = this.value;
        clearAllConditions();
        updateResultDisplay();
    });
}

// ========== 条件管理（简化版）==========
function addCondition(input, type) {
    let { numbers, label, source, category, categoryName } = input;

    // 如果没有分类，根据来源创建独立分类
    if (!category) {
        if (source === 'input') {
            category = `definition_${state.nextDefinitionId}`;
            categoryName = `定义${state.nextDefinitionId}`;
            state.nextDefinitionId++;
        } else {
            category = `custom_${state.nextCustomNumberId}`;
            categoryName = `号码${state.nextCustomNumberId}`;
            state.nextCustomNumberId++;
        }
    }

    state.conditions.push({
        id: state.nextConditionId++,
        label,
        category,
        categoryName,
        numbers: sortNumbers(numbers),
        type
    });

    updateResultDisplay();
    updateBallStates();
}

function clearAllConditions() {
    state.conditions = [];
    state.nextCustomNumberId = 1;
    state.nextDefinitionId = 1;

    InputManager.clear();

    // 清除杀号状态
    for (let i = 1; i <= 49; i++) {
        getBall(i)?.classList.remove('selected', 'killed');
    }

    updateResultDisplay();
    updateBallStates();
}

// 删除单个条件
function removeCondition(conditionId) {
    state.conditions = state.conditions.filter(c => c.id !== conditionId);
    updateResultDisplay();
    updateBallStates();
}

function updateBallStates() {
    const excludeType = isDragMode() ? 'dragExclude' : 'exclude';
    const killedNumbers = getKilledNumbers(
        state.conditions.filter(c => c.type === excludeType)
    );

    for (let i = 1; i <= 49; i++) {
        const ball = getBall(i);
        ball?.classList.remove('selected', 'killed');
        if (killedNumbers.has(i)) {
            ball?.classList.add('killed');
        }
    }
}

// ========== 拖式对话框 ==========
function showDragTypeDialog(input) {
    const modal = document.createElement('div');
    modal.className = 'drag-type-modal';
    modal.innerHTML = `
        <div class="drag-type-dialog">
            <h3>选择添加类型</h3>
            <p>将 ${input.numbers.length} 个号码添加为：</p>
            <div class="drag-type-buttons">
                <button class="drag-type-btn banker-btn" id="addAsBanker">🎯 拖胆</button>
                <button class="drag-type-btn leg-btn" id="addAsLeg">📋 拖码</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('addAsBanker').addEventListener('click', () => {
        addCondition(input, 'banker');
        closeDragTypeDialog(modal);
    });

    document.getElementById('addAsLeg').addEventListener('click', () => {
        addCondition(input, 'leg');
        closeDragTypeDialog(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDragTypeDialog(modal);
    });
}

function closeDragTypeDialog(modal) {
    modal.remove();
    InputManager.clear();
}

// ========== 核心计算逻辑 ==========
function filterConditionsByType(type) {
    return state.conditions.filter(c => c.type === type);
}

function calculateIntersection() {
    const includeConditions = filterConditionsByType('include');
    const excludeConditions = filterConditionsByType('exclude');

    if (includeConditions.length === 0) return [];

    // 按分类分组，同分类内取并集
    const groupedByCategory = {};
    includeConditions.forEach(c => {
        const cat = c.category || 'custom';
        if (!groupedByCategory[cat]) groupedByCategory[cat] = new Set();
        c.numbers.forEach(n => groupedByCategory[cat].add(n));
    });

    // 不同分类间取交集
    const categories = Object.keys(groupedByCategory);
    if (categories.length === 0) return [];

    let result = Array.from(groupedByCategory[categories[0]]);
    for (let i = 1; i < categories.length; i++) {
        const catNumbers = groupedByCategory[categories[i]];
        result = result.filter(n => catNumbers.has(n));
    }

    return sortNumbers(excludeKilledNumbers(result, getKilledNumbers(excludeConditions)));
}

function calculateUnion() {
    const includeConditions = filterConditionsByType('include');
    const excludeConditions = filterConditionsByType('exclude');

    if (includeConditions.length === 0) return [];

    const unionSet = new Set();
    includeConditions.forEach(c => c.numbers.forEach(n => unionSet.add(n)));

    return sortNumbers(excludeKilledNumbers(Array.from(unionSet), getKilledNumbers(excludeConditions)));
}

// ========== 显示相关 ==========
function groupConditionsByCategory(conditionsList) {
    const grouped = {};
    conditionsList.forEach(c => {
        const cat = c.categoryName || '自定义';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(c);
    });
    return grouped;
}

function mergeConditionNumbers(items) {
    const merged = new Set();
    items.forEach(c => c.numbers.forEach(n => merged.add(n)));
    return sortNumbers(Array.from(merged));
}

function formatConditionsForDisplay(conditionsList, prefix = '') {
    let output = '';
    const grouped = groupConditionsByCategory(conditionsList);

    for (const cat in grouped) {
        const items = grouped[cat];
        const sortedNumbers = mergeConditionNumbers(items);
        const labels = items.map(c => c.label).join('+');
        output += `${prefix}${cat}: ${labels} → ${formatNumbers(sortedNumbers)} (${sortedNumbers.length}个)\n`;
    }
    return output;
}

// 带删除按钮的 HTML 版条件显示
function formatConditionsForHTML(conditionsList, prefix = '') {
    let html = '';
    const grouped = groupConditionsByCategory(conditionsList);

    for (const cat in grouped) {
        const items = grouped[cat];
        const sortedNumbers = mergeConditionNumbers(items);
        const labels = items.map(c => c.label).join('+');
        const conditionIds = items.map(c => c.id);
        const conditionText = `${prefix}${cat}: ${labels} → ${formatNumbers(sortedNumbers)} (${sortedNumbers.length}个)`;
        html += `<div class="condition-line">`;
        html += `<span class="condition-text">${escapeHTML(conditionText)}</span>`;
        // 为该组的每个条件添加删除按钮
        conditionIds.forEach(id => {
            html += `<button class="condition-remove-btn" onclick="removeCondition(${id})" title="删除此条件">✕</button>`;
        });
        html += `</div>`;
    }
    return html;
}

function getDetailedStatistics(numbers) {
    if (numbers.length === 0) return '';

    let redCount = 0, blueCount = 0, greenCount = 0;
    let bigCount = 0, smallCount = 0;
    let oddCount = 0, evenCount = 0;
    let tailBigCount = 0, tailSmallCount = 0;
    let wildCount = 0, domesticCount = 0;
    const elementStats = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    const headStats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const segmentStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    const tailStats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const zodiacOrder = filterCategories['zodiac'];
    const zodiacStats = {};

    zodiacOrder.forEach(z => {
        zodiacStats[z] = 0;
    });

    numbers.forEach(n => {
        if (waveRedSet.has(n)) redCount++;
        else if (waveBlueSet.has(n)) blueCount++;
        else if (waveGreenSet.has(n)) greenCount++;

        if (n >= 25) bigCount++; else smallCount++;
        if (n % 2 === 1) oddCount++; else evenCount++;
        if (tailBigSet.has(n)) tailBigCount++; else tailSmallCount++;
        if (wildSet.has(n)) wildCount++; else domesticCount++;

        const element = numberToElement[n];
        if (element) elementStats[element]++;

        // 头数统计：十位数字（1-9号头数为0）
        const headDigit = Math.floor(n / 10);
        headStats[headDigit]++;

        // 七段统计：第几段 = Math.ceil(n/7)
        const seg = Math.ceil(n / 7);
        if (seg >= 1 && seg <= 7) segmentStats[seg]++;

        // 尾数统计：个位数字
        const tailDigit = n % 10;
        tailStats[tailDigit]++;

        const zodiac = numberToZodiac[n];
        if (zodiac) zodiacStats[zodiac]++;
    });

    let info = '📈 分类统计：\n';
    info += `  波色: 🔴红(${redCount}) 🔵蓝(${blueCount}) 🟢绿(${greenCount})\n`;
    info += `  大小: 大(${bigCount}) 小(${smallCount})\n`;
    info += `  单双: 单(${oddCount}) 双(${evenCount})\n`;
    info += `  尾大小: 尾大(${tailBigCount}) 尾小(${tailSmallCount})\n`;
    info += `  家野: 野肖(${wildCount}) 家肖(${domesticCount})\n`;
    info += `  五行: 金(${elementStats['金']}) 木(${elementStats['木']}) 水(${elementStats['水']}) 火(${elementStats['火']}) 土(${elementStats['土']})\n`;
    info += `  头数: 0头(${headStats[0]}) 1头(${headStats[1]}) 2头(${headStats[2]}) 3头(${headStats[3]}) 4头(${headStats[4]})\n`;
    info += `  七段: 一(${segmentStats[1]}) 二(${segmentStats[2]}) 三(${segmentStats[3]}) 四(${segmentStats[4]}) 五(${segmentStats[5]}) 六(${segmentStats[6]}) 七(${segmentStats[7]})\n`;

    const zodiacList = zodiacOrder.map(z => `${z}(${zodiacStats[z]})`);
    info += `  生肖: ${zodiacList.join(' ')}\n`;

    const tailList = [0,1,2,3,4,5,6,7,8,9].map(t => `${t}尾(${tailStats[t]})`);
    info += `  尾数: ${tailList.join(' ')}\n`;

    return info;
}

// ========== 结果显示 ==========
function updateResultDisplay() {
    const resultContent = dom.resultContent;

    if (state.conditions.length === 0) {
        const placeholder = isDragMode()
            ? '拖式模式：请先添加拖胆号码，再添加拖码号码...'
            : '添加选号条件后自动显示统计结果...';
        resultContent.innerHTML = `<span class="placeholder-text">${placeholder}</span>`;
        state.lastResult = createLastResult(state.currentMode);
        return;
    }

    let result;

    if (state.currentMode === 'single') {
        result = renderSingleMode();
    } else if (isCompoundMode()) {
        result = renderCompoundMode();
    } else if (isDragMode()) {
        result = renderDragMode();
    }

    // 如果返回的是对象 { html, text }，使用 innerHTML
    if (result && typeof result === 'object' && result.html) {
        resultContent.innerHTML = result.html;
    } else {
        resultContent.textContent = result;
    }
}

function renderSingleMode() {
    const includeConditions = filterConditionsByType('include');
    const excludeConditions = filterConditionsByType('exclude');
    const intersectionNumbers = calculateIntersection();
    const unionNumbers = calculateUnion();

    // 纯文本部分
    let textTop = `📊 统计交集结果：`;
    textTop += intersectionNumbers.length > 0
        ? `${formatNumbers(intersectionNumbers)}（共${intersectionNumbers.length}个）\n`
        : `无（没有符合所有条件的号码）\n`;

    textTop += `📊 统计合集结果：`;
    textTop += unionNumbers.length > 0
        ? `${formatNumbers(unionNumbers)}（共${unionNumbers.length}个）\n`
        : `无\n`;

    // 构建 HTML
    let html = `<div class="result-text">${escapeHTML(textTop)}</div>`;
    html += '<div class="result-divider"></div>';

    // 选号条件（带删除按钮）
    if (includeConditions.length > 0) {
        html += '<div class="conditions-section">';
        html += '<div class="conditions-title">📋 选号条件：</div>';
        html += formatConditionsForHTML(includeConditions, '  ');
        html += '</div>';
    }

    // 杀号条件（带删除按钮）
    if (excludeConditions.length > 0) {
        html += '<div class="conditions-section">';
        html += '<div class="conditions-title">🚫 杀号条件：</div>';
        html += formatConditionsForHTML(excludeConditions, '  ');
        html += '</div>';
    }

    state.lastResult = {
        ...createLastResult(state.currentMode),
        numbers: intersectionNumbers
    };

    // 分类统计
    if (intersectionNumbers.length > 0) {
        html += `<div class="result-text">${escapeHTML(getDetailedStatistics(intersectionNumbers))}</div>`;
    }

    return { html };
}

// HTML 转义，防止 XSS
function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

function renderCompoundMode() {
    const n = getModeNumber();
    const includeConditions = filterConditionsByType('include');
    const unionNumbers = calculateUnion();

    // 条件部分用 HTML（带删除按钮）
    let html = '<div class="conditions-section">';
    html += '<div class="conditions-title">选择条件</div>';
    html += formatConditionsForHTML(includeConditions, '');
    html += '</div>';

    // 结果部分用纯文本
    let resultText = '';
    if (unionNumbers.length >= n) {
        const combinationCount = countCombinations(unionNumbers.length, n);
        const previewCombinations = generateCombinationPreview(unionNumbers, n);
        state.lastResult = {
            ...createLastResult(state.currentMode),
            numbers: unionNumbers,
            combinations: previewCombinations,
            combinationCount,
            buildCopyText: () => buildCombinationCopyText(unionNumbers, n, combinationCount),
            copyWarning: combinationCount > MAX_COPY_COMBINATIONS
                ? `结果共${combinationCount}注，数量过大，为保证稳定仅复制前${previewCombinations.length}注预览。`
                : ''
        };

        resultText += `\n统计结果（复式${n}）：\n`;
        resultText += `共${combinationCount}注\n\n`;

        previewCombinations.forEach(combo => {
            resultText += `${formatNumbers(combo)}\n`;
        });
        if (combinationCount > PREVIEW_COMBINATION_LIMIT) {
            resultText += `\n...(仅显示前${PREVIEW_COMBINATION_LIMIT}注，剩余${combinationCount - PREVIEW_COMBINATION_LIMIT}注)\n`;
        }
    } else {
        state.lastResult = {
            ...createLastResult(state.currentMode),
            numbers: unionNumbers
        };
        resultText += `\n统计结果（复式${n}）：\n`;
        resultText += `号码不足${n}个，无法生成组合\n`;
    }

    html += `<div class="result-text">${escapeHTML(resultText)}</div>`;
    return { html };
}

function renderDragMode() {
    const n = getModeNumber();
    const bankerConditions = filterConditionsByType('banker');
    const legConditions = filterConditionsByType('leg');
    const dragExcludeConditions = filterConditionsByType('dragExclude');

    // 收集号码
    const bankerNumbers = new Set();
    bankerConditions.forEach(c => c.numbers.forEach(num => bankerNumbers.add(num)));
    const bankerArr = sortNumbers(Array.from(bankerNumbers));

    const legNumbers = new Set();
    legConditions.forEach(c => c.numbers.forEach(num => legNumbers.add(num)));
    const legArr = sortNumbers(Array.from(legNumbers));

    const excludeNumbers = getKilledNumbers(dragExcludeConditions);
    const filteredBankerArr = excludeKilledNumbers(bankerArr, excludeNumbers);
    const filteredLegArr = excludeKilledNumbers(legArr, excludeNumbers);

    // 构建 HTML
    let html = `<div class="result-text">${escapeHTML(`统计结果（拖式${n}）：`)}</div>`;

    // 拖胆（带删除按钮）
    html += '<div class="conditions-section">';
    html += '<div class="conditions-title">拖胆：</div>';
    if (bankerConditions.length > 0) {
        html += formatConditionsForHTML(bankerConditions, '  ');
    } else {
        html += '<div class="condition-text">  （请添加拖胆号码）</div>';
    }
    html += '</div>';

    // 拖码（带删除按钮）
    html += '<div class="conditions-section">';
    html += '<div class="conditions-title">拖码：</div>';
    if (legConditions.length > 0) {
        html += formatConditionsForHTML(legConditions, '  ');
    } else {
        html += '<div class="condition-text">  （请添加拖码号码）</div>';
    }
    html += '</div>';

    // 杀码（带删除按钮）
    if (dragExcludeConditions.length > 0) {
        html += '<div class="conditions-section">';
        html += '<div class="conditions-title">杀码：</div>';
        html += formatConditionsForHTML(dragExcludeConditions, '  ');
        html += '</div>';
    }

    // 组合结果部分用纯文本
    let resultText = '';
    if (filteredBankerArr.length > 0 && filteredLegArr.length > 0) {
        const dragContext = buildDragContext(filteredBankerArr, filteredLegArr);
        const combinationCount = countDragCombinations(dragContext, n);
        const previewCombinations = generateDragCombinationPreview(dragContext, n);
        const resultNumbers = sortNumbers([...new Set([...filteredBankerArr, ...filteredLegArr])]);

        if (combinationCount > 0) {
            state.lastResult = {
                ...createLastResult(state.currentMode),
                numbers: resultNumbers,
                combinations: previewCombinations,
                combinationCount,
                buildCopyText: () => buildDragCopyText(dragContext, n, combinationCount),
                copyWarning: combinationCount > MAX_COPY_COMBINATIONS
                    ? `结果共${combinationCount}注，数量过大，为保证稳定仅复制前${previewCombinations.length}注预览。`
                    : ''
            };

            resultText += `\n共${combinationCount}注\n\n`;

            previewCombinations.forEach(combo => {
                resultText += `${formatNumbers(combo)}\n`;
            });
            if (combinationCount > PREVIEW_COMBINATION_LIMIT) {
                resultText += `\n...(仅显示前${PREVIEW_COMBINATION_LIMIT}注，剩余${combinationCount - PREVIEW_COMBINATION_LIMIT}注)\n`;
            }
        } else {
            state.lastResult = {
                ...createLastResult(state.currentMode),
                numbers: resultNumbers
            };
            resultText += `\n号码不足，无法生成${n}个号码的组合\n`;
        }
    } else {
        state.lastResult = {
            ...createLastResult(state.currentMode),
            numbers: sortNumbers([...new Set([...filteredBankerArr, ...filteredLegArr])])
        };

        if (filteredBankerArr.length === 0 && bankerArr.length > 0) {
            resultText += `\n拖胆号码全部被杀，无法生成组合\n`;
        } else if (filteredBankerArr.length === 0) {
            resultText += `\n请先添加拖胆号码\n`;
        } else if (filteredLegArr.length === 0 && legArr.length > 0) {
            resultText += `\n拖码号码全部被杀，无法生成组合\n`;
        } else if (filteredLegArr.length === 0) {
            resultText += `\n请添加拖码号码\n`;
        } else {
            resultText += `\n号码不足，无法生成${n}个号码的组合\n`;
        }
    }

    html += `<div class="result-text">${escapeHTML(resultText)}</div>`;
    return { html };
}

// ========== 解析号码输入 ==========
function parseNumberInput(input) {
    const numbers = new Set();
    if (!input) return [];

    // 1. 处理范围表达式
    const rangePattern = /(\d+)\s*[-~]\s*(\d+)/g;
    let match;
    while ((match = rangePattern.exec(input)) !== null) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        if (!isNaN(start) && !isNaN(end)) {
            const min = Math.min(start, end);
            const max = Math.max(start, end);
            for (let i = min; i <= max; i++) {
                if (i >= 1 && i <= 49) numbers.add(i);
            }
        }
    }

    const tokenSet = new Set(
        input
            .split(/[\s,，、;；|/]+/)
            .map(part => part.trim())
            .filter(Boolean)
    );

    // 2. 处理关键字
    for (const zodiac in numberData.zodiac) {
        if (input.includes(zodiac)) {
            numberData.zodiac[zodiac].forEach(n => numbers.add(n));
        }
    }

    FILTER_KEYWORD_CONFIGS.forEach(({ filter, keywords }) => {
        if (keywords.some(keyword => tokenSet.has(keyword))) {
            (filterMap[filter] || []).forEach(n => numbers.add(n));
        }
    });

    for (const element in numberData.element) {
        if (input.includes(element)) {
            numberData.element[element].forEach(n => numbers.add(n));
        }
    }

    // 3. 处理单个号码
    const remaining = input.replace(/(\d+)\s*[-~]\s*(\d+)/g, '');
    remaining.split(/[,.\s]+/).forEach(part => {
        const num = parseInt(part.trim());
        if (!isNaN(num) && num >= 1 && num <= 49) {
            numbers.add(num);
        }
    });

    return sortNumbers(Array.from(numbers));
}

// ========== 剪贴板 ==========
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('复制成功！');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('复制成功！');
        } catch (e) {
            alert('复制失败，请手动复制');
        }
        document.body.removeChild(textarea);
    });
}
