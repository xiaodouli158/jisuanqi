// ========== 号码数据定义 ==========
const numberData = {
    numbers: Array.from({ length: 49 }, (_, i) => i + 1),

    // 生肖
    zodiac: {
        '蛇': [1, 13, 25, 37, 49],
        '龙': [2, 14, 26, 38],
        '兔': [3, 15, 27, 39],
        '虎': [4, 16, 28, 40],
        '牛': [5, 17, 29, 41],
        '鼠': [6, 18, 30, 42],
        '猪': [7, 19, 31, 43],
        '狗': [8, 20, 32, 44],
        '鸡': [9, 21, 33, 45],
        '猴': [10, 22, 34, 46],
        '羊': [11, 23, 35, 47],
        '马': [12, 24, 36, 48]
    },

    // 野兽和家畜
    beast: {
        '野兽': [1, 2, 3, 4, 6, 10, 13, 14, 15, 16, 18, 22, 25, 26, 27, 28, 30, 34, 37, 38, 39, 40, 42, 46, 49],
        '家畜': [5, 7, 8, 9, 11, 12, 17, 19, 20, 21, 23, 24, 29, 31, 32, 33, 35, 36, 41, 43, 44, 45, 47, 48]
    },

    // 五行
    element: {
        '金': [3, 4, 11, 12, 25, 26, 33, 34, 41, 42],
        '木': [7, 8, 15, 16, 23, 24, 37, 38, 45, 46],
        '水': [13, 14, 21, 22, 29, 30, 43, 44],
        '火': [1, 2, 9, 10, 17, 18, 31, 32, 39, 40, 47, 48],
        '土': [5, 6, 19, 20, 27, 28, 35, 36, 49]
    },

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
    }
};

// ========== 预计算映射表 ==========
const numberToZodiac = {};
const numberToWave = {};
const numberToElement = {};
const waveRedSet = new Set(numberData.wave.red);
const waveBlueSet = new Set(numberData.wave.blue);
const waveGreenSet = new Set(numberData.wave.green);

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
    'wild': numberData.beast['野兽'],
    'domestic': numberData.beast['家畜'],
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
    'earth': numberData.element['土']
};

const filterCategories = {
    'bigSmall': ['big', 'small'],
    'oddEven': ['odd', 'even'],
    'wildDomestic': ['wild', 'domestic'],
    'tailBigSmall': ['tailBig', 'tailSmall'],
    'wave': ['red', 'blue', 'green'],
    'element': ['gold', 'wood', 'water', 'fire', 'earth'],
    'head': ['head0', 'head1', 'head2', 'head3', 'head4'],
    'tail': ['tail0', 'tail1', 'tail2', 'tail3', 'tail4', 'tail5', 'tail6', 'tail7', 'tail8', 'tail9'],
    'zodiac': ['蛇', '龙', '兔', '虎', '牛', '鼠', '猪', '狗', '鸡', '猴', '羊', '马']
};

const categoryNames = {
    'bigSmall': '大小',
    'oddEven': '单双',
    'wildDomestic': '野家',
    'tailBigSmall': '尾大小',
    'wave': '波色',
    'element': '五行',
    'head': '头数',
    'tail': '尾数',
    'zodiac': '生肖'
};

// ========== 核心状态 ==========
const state = {
    conditions: [],
    nextConditionId: 1,
    nextCustomNumberId: 1,    // 选号盘点击 -> 号码x
    nextDefinitionId: 1,      // 输入框输入 -> 定义x
    currentMode: 'single',
    lastResult: { mode: 'single', numbers: [], combinations: [] }
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

    initNumberGrid();
    initFilterButtons();
    initOperationButtons();
    initModeSelect();
    updateResultDisplay();
});

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
    const filter = btn.dataset.filter;

    if (filter === 'clear') {
        clearAllConditions();
        return;
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

    // 杀号按钮
    document.getElementById('killNumbersBtn').addEventListener('click', handleKillNumbers);

    // 复制结果
    document.getElementById('copyResultBtn').addEventListener('click', handleCopyResult);

    // 回车添加
    dom.customInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddNumbers();
    });
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
    const { numbers, combinations } = state.lastResult;

    if (numbers.length === 0 && combinations.length === 0) {
        alert('没有可复制的内容');
        return;
    }

    const textToCopy = state.currentMode === 'single'
        ? formatNumbers(numbers)
        : combinations.map(formatNumbers).join('\n');

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

function generateCombinations(arr, n) {
    if (n === 1) return arr.map(x => [x]);
    if (n > arr.length) return [];

    const result = [];
    function combine(start, combo) {
        if (combo.length === n) {
            result.push([...combo]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            combo.push(arr[i]);
            combine(i + 1, combo);
            combo.pop();
        }
    }
    combine(0, []);
    return result;
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

function getDetailedStatistics(numbers) {
    if (numbers.length === 0) return '';

    let redCount = 0, blueCount = 0, greenCount = 0;
    let bigCount = 0, smallCount = 0;
    let oddCount = 0, evenCount = 0;
    const elementStats = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    const zodiacStats = {};

    for (const z in numberData.zodiac) zodiacStats[z] = 0;

    numbers.forEach(n => {
        if (waveRedSet.has(n)) redCount++;
        else if (waveBlueSet.has(n)) blueCount++;
        else if (waveGreenSet.has(n)) greenCount++;

        if (n >= 25) bigCount++; else smallCount++;
        if (n % 2 === 1) oddCount++; else evenCount++;

        const element = numberToElement[n];
        if (element) elementStats[element]++;

        const zodiac = numberToZodiac[n];
        if (zodiac) zodiacStats[zodiac]++;
    });

    let info = '📈 分类统计：\n';
    info += `  波色: 🔴红${redCount} 🔵蓝${blueCount} 🟢绿${greenCount}\n`;
    info += `  大小: 大${bigCount} 小${smallCount}\n`;
    info += `  单双: 单${oddCount} 双${evenCount}\n`;
    info += `  五行: 金${elementStats['金']} 木${elementStats['木']} 水${elementStats['水']} 火${elementStats['火']} 土${elementStats['土']}\n`;

    const zodiacList = Object.entries(zodiacStats).map(([z, c]) => `${z}${c}`);
    info += `  生肖: ${zodiacList.join(' ')}\n`;

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
        state.lastResult = { mode: state.currentMode, numbers: [], combinations: [] };
        return;
    }

    let output = '';

    if (state.currentMode === 'single') {
        output = renderSingleMode();
    } else if (isCompoundMode()) {
        output = renderCompoundMode();
    } else if (isDragMode()) {
        output = renderDragMode();
    }

    resultContent.textContent = output;
}

function renderSingleMode() {
    const includeConditions = filterConditionsByType('include');
    const excludeConditions = filterConditionsByType('exclude');
    const intersectionNumbers = calculateIntersection();
    const unionNumbers = calculateUnion();

    let output = `📊 统计交集结果：`;
    output += intersectionNumbers.length > 0
        ? `${formatNumbers(intersectionNumbers)}（共${intersectionNumbers.length}个）\n`
        : `无（没有符合所有条件的号码）\n`;

    output += `📊 统计合集结果：`;
    output += unionNumbers.length > 0
        ? `${formatNumbers(unionNumbers)}（共${unionNumbers.length}个）\n`
        : `无\n`;

    output += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    if (includeConditions.length > 0) {
        output += '📋 选号条件：\n';
        output += formatConditionsForDisplay(includeConditions, '  ');
    }

    if (excludeConditions.length > 0) {
        output += '\n🚫 杀号条件：\n';
        output += formatConditionsForDisplay(excludeConditions, '  ');
    }

    state.lastResult = { mode: state.currentMode, numbers: intersectionNumbers, combinations: [] };

    if (intersectionNumbers.length > 0) {
        output += '\n' + getDetailedStatistics(intersectionNumbers);
    }

    return output;
}

function renderCompoundMode() {
    const n = getModeNumber();
    const includeConditions = filterConditionsByType('include');
    const unionNumbers = calculateUnion();

    let output = '选择条件\n';
    const grouped = groupConditionsByCategory(includeConditions);
    for (const cat in grouped) {
        const sortedNumbers = mergeConditionNumbers(grouped[cat]);
        output += `${cat}：${formatNumbers(sortedNumbers)}（共${sortedNumbers.length}个）\n`;
    }

    if (unionNumbers.length >= n) {
        const combinations = generateCombinations(unionNumbers, n);
        state.lastResult = { mode: state.currentMode, numbers: unionNumbers, combinations };

        output += `\n统计结果（复式${n}）：\n`;
        output += `共${combinations.length}注\n\n`;

        combinations.slice(0, 100).forEach(combo => {
            output += `${formatNumbers(combo)}\n`;
        });
        if (combinations.length > 100) {
            output += `\n...(还有${combinations.length - 100}注)\n`;
        }
    } else {
        state.lastResult = { mode: state.currentMode, numbers: unionNumbers, combinations: [] };
        output += `\n统计结果（复式${n}）：\n`;
        output += `号码不足${n}个，无法生成组合\n`;
    }

    return output;
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

    let output = `统计结果（拖式${n}）：\n`;
    output += `拖胆：\n`;
    output += bankerConditions.length > 0
        ? formatConditionsForDisplay(bankerConditions, '  ')
        : `  （请添加拖胆号码）\n`;

    output += `拖码：\n`;
    output += legConditions.length > 0
        ? formatConditionsForDisplay(legConditions, '  ')
        : `  （请添加拖码号码）\n`;

    if (dragExcludeConditions.length > 0) {
        output += `杀码：\n`;
        output += formatConditionsForDisplay(dragExcludeConditions, '  ');
    }

    // 生成拖式组合
    if (filteredBankerArr.length > 0 && filteredLegArr.length > 0) {
        const bankerSet = new Set(filteredBankerArr);
        const legSet = new Set(filteredLegArr);
        const pureBankers = filteredBankerArr.filter(num => !legSet.has(num));
        const pureBankerSet = new Set(pureBankers);

        const allNumbers = sortNumbers([...new Set([...filteredBankerArr, ...filteredLegArr])]);
        const allPossibleCombos = generateCombinations(allNumbers, n);

        const allCombinations = allPossibleCombos.filter(combo => {
            const hasBanker = combo.some(num => bankerSet.has(num));
            const hasLeg = combo.some(num => legSet.has(num));
            const pureBankerCount = combo.filter(num => pureBankerSet.has(num)).length;
            return hasBanker && hasLeg && pureBankerCount <= 1;
        });

        state.lastResult = {
            mode: state.currentMode,
            numbers: [...filteredBankerArr, ...filteredLegArr],
            combinations: allCombinations
        };

        output += `\n共${allCombinations.length}注\n\n`;

        allCombinations.slice(0, 100).forEach(combo => {
            output += `${formatNumbers(combo)}\n`;
        });
        if (allCombinations.length > 100) {
            output += `\n...(还有${allCombinations.length - 100}注)\n`;
        }
    } else {
        state.lastResult = {
            mode: state.currentMode,
            numbers: [...filteredBankerArr, ...filteredLegArr],
            combinations: []
        };

        if (filteredBankerArr.length === 0 && bankerArr.length > 0) {
            output += `\n拖胆号码全部被杀，无法生成组合\n`;
        } else if (filteredBankerArr.length === 0) {
            output += `\n请先添加拖胆号码\n`;
        } else if (filteredLegArr.length === 0 && legArr.length > 0) {
            output += `\n拖码号码全部被杀，无法生成组合\n`;
        } else if (filteredLegArr.length === 0) {
            output += `\n请添加拖码号码\n`;
        } else {
            output += `\n号码不足，无法生成${n}个号码的组合\n`;
        }
    }

    return output;
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

    // 2. 处理关键字
    for (const zodiac in numberData.zodiac) {
        if (input.includes(zodiac)) {
            numberData.zodiac[zodiac].forEach(n => numbers.add(n));
        }
    }

    if (input.includes('红')) numberData.wave.red.forEach(n => numbers.add(n));
    if (input.includes('蓝')) numberData.wave.blue.forEach(n => numbers.add(n));
    if (input.includes('绿')) numberData.wave.green.forEach(n => numbers.add(n));

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
