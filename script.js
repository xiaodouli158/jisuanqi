// 号码数据定义
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

// 号码映射
const numberToZodiac = {};
for (let zodiac in numberData.zodiac) {
    numberData.zodiac[zodiac].forEach(num => {
        numberToZodiac[num] = zodiac;
    });
}

const numberToWave = {};
numberData.wave.red.forEach(num => numberToWave[num] = 'red');
numberData.wave.blue.forEach(num => numberToWave[num] = 'blue');
numberData.wave.green.forEach(num => numberToWave[num] = 'green');

const numberToElement = {};
for (let element in numberData.element) {
    numberData.element[element].forEach(num => {
        numberToElement[num] = element;
    });
}

// ========== 核心状态管理 ==========
// 当前预览的号码（输入框/按钮高亮的号码，尚未添加为条件）
let previewNumbers = new Set();

// 选号条件列表（每个条件是一个对象：{id, label, numbers, type, category, categoryName}）
// type: 'include' 选中 | 'exclude' 杀号 | 'banker' 拖胆 | 'leg' 拖码
let conditions = [];
let nextConditionId = 1;

// 计算模式
let currentMode = 'single';

// 拖式模式：当前添加阶段 ('banker' 或 'leg')
let dragPhase = 'banker';

// 最终计算结果
let lastResult = {
    mode: 'single',
    numbers: [],
    combinations: []
};

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function () {
    initNumberGrid();
    initFilterButtons();
    initOperationButtons();
    initModeSelect();
    updateResultDisplay();
});

// 生成号码球网格
function initNumberGrid() {
    const grid = document.getElementById('numberGrid');
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

        ball.addEventListener('click', () => togglePreviewNumber(i));
        grid.appendChild(ball);
    }
}

// 切换预览号码
function togglePreviewNumber(num) {
    const ball = document.querySelector(`.number-ball[data-number="${num}"]`);

    if (previewNumbers.has(num)) {
        previewNumbers.delete(num);
        ball.classList.remove('highlight');
    } else {
        previewNumbers.add(num);
        ball.classList.add('highlight');
    }
}

// 获取当前激活的筛选按钮标签
function getActiveFilterLabels() {
    const activeButtons = document.querySelectorAll('.filter-btn.active');
    if (activeButtons.length === 0) return '';

    const labels = [];
    activeButtons.forEach(btn => {
        // 获取按钮的文本内容作为标签
        const text = btn.textContent.trim();
        if (text && text !== '清空选号') {
            labels.push(text);
        }
    });

    return labels.join('+');
}

// 初始化筛选按钮
function initFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilterClick(btn));
    });
}

// 定义筛选按钮的分类（互斥组）
const filterCategories = {
    'wave': ['red', 'blue', 'green'],
    'size': ['big', 'small', 'odd', 'even', 'wild', 'domestic', 'tailBig', 'tailSmall'],
    'head': ['head0', 'head1', 'head2', 'head3', 'head4'],
    'tail': ['tail0', 'tail1', 'tail2', 'tail3', 'tail4', 'tail5', 'tail6', 'tail7', 'tail8', 'tail9'],
    'element': ['gold', 'wood', 'water', 'fire', 'earth'],
    'zodiac': ['蛇', '龙', '兔', '虎', '牛', '鼠', '猪', '狗', '鸡', '猴', '羊', '马']
};

// 获取按钮所属分类
function getButtonCategory(btn) {
    const filter = btn.dataset.filter;
    const zodiac = btn.dataset.zodiac;

    if (zodiac) return 'zodiac';

    for (let category in filterCategories) {
        if (filterCategories[category].includes(filter)) {
            return category;
        }
    }
    return null;
}

// 清除指定分类以外的所有按钮
function clearOtherCategories(currentCategory) {
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        const btnCategory = getButtonCategory(btn);
        if (btnCategory && btnCategory !== currentCategory) {
            btn.classList.remove('active');
        }
    });

    // 重新计算预览号码（只保留当前分类的）
    previewNumbers.clear();
    document.querySelectorAll('.number-ball.highlight').forEach(ball => {
        ball.classList.remove('highlight');
    });

    // 重新添加当前分类中仍然激活的按钮的号码
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        const numbers = getButtonNumbers(btn);
        numbers.forEach(num => {
            previewNumbers.add(num);
            const ball = document.querySelector(`.number-ball[data-number="${num}"]`);
            if (ball) ball.classList.add('highlight');
        });
    });
}

// 获取按钮对应的号码
function getButtonNumbers(btn) {
    const filter = btn.dataset.filter;
    const zodiac = btn.dataset.zodiac;

    if (zodiac) {
        return numberData.zodiac[zodiac] || [];
    }

    switch (filter) {
        case 'red': return numberData.wave.red;
        case 'blue': return numberData.wave.blue;
        case 'green': return numberData.wave.green;
        case 'big': return numberData.size.big;
        case 'small': return numberData.size.small;
        case 'odd': return numberData.parity.odd;
        case 'even': return numberData.parity.even;
        case 'wild': return numberData.beast['野兽'];
        case 'domestic': return numberData.beast['家畜'];
        case 'tailBig': return numberData.tailSize.big;
        case 'tailSmall': return numberData.tailSize.small;
        case 'head0': return numberData.head[0];
        case 'head1': return numberData.head[1];
        case 'head2': return numberData.head[2];
        case 'head3': return numberData.head[3];
        case 'head4': return numberData.head[4];
        case 'tail0': return numberData.tail[0];
        case 'tail1': return numberData.tail[1];
        case 'tail2': return numberData.tail[2];
        case 'tail3': return numberData.tail[3];
        case 'tail4': return numberData.tail[4];
        case 'tail5': return numberData.tail[5];
        case 'tail6': return numberData.tail[6];
        case 'tail7': return numberData.tail[7];
        case 'tail8': return numberData.tail[8];
        case 'tail9': return numberData.tail[9];
        case 'gold': return numberData.element['金'];
        case 'wood': return numberData.element['木'];
        case 'water': return numberData.element['水'];
        case 'fire': return numberData.element['火'];
        case 'earth': return numberData.element['土'];
        default: return [];
    }
}

// 处理筛选按钮点击 - 切换高亮对应号码（分类互斥）
function handleFilterClick(btn) {
    const filter = btn.dataset.filter;
    const zodiac = btn.dataset.zodiac;

    if (filter === 'clear') {
        clearAllConditions();
        return;
    }

    // 获取当前按钮的分类
    const currentCategory = getButtonCategory(btn);

    // 判断按钮当前是否已选中
    const isActive = btn.classList.contains('active');

    // 获取该按钮对应的号码
    const numbersToToggle = getButtonNumbers(btn);

    if (isActive) {
        // 取消选中：移除这些号码的高亮
        numbersToToggle.forEach(num => {
            previewNumbers.delete(num);
            const ball = document.querySelector(`.number-ball[data-number="${num}"]`);
            if (ball) ball.classList.remove('highlight');
        });
        btn.classList.remove('active');
    } else {
        // 选中前：先清除其他分类的选择（互斥）
        clearOtherCategories(currentCategory);

        // 选中：添加这些号码的高亮
        numbersToToggle.forEach(num => {
            previewNumbers.add(num);
            const ball = document.querySelector(`.number-ball[data-number="${num}"]`);
            if (ball) ball.classList.add('highlight');
        });
        btn.classList.add('active');
    }
}

// 初始化操作按钮
function initOperationButtons() {
    const customInput = document.getElementById('customInput');

    // 输入框实时高亮
    customInput.addEventListener('input', function () {
        const input = this.value.trim();

        // 清除之前的预览高亮（不清除输入框）
        clearPreviewHighlightsOnly();

        if (input) {
            const numbersToHighlight = parseNumberInput(input);
            numbersToHighlight.forEach(num => {
                previewNumbers.add(num);
                const ball = document.querySelector(`.number-ball[data-number="${num}"]`);
                if (ball) ball.classList.add('highlight');
            });
        }
    });

    // 添加按钮
    document.getElementById('addNumbersBtn').addEventListener('click', () => {
        const input = customInput.value.trim();

        // 优先使用输入框，否则使用预览的号码
        let numbersToAdd = [];
        let label = '';

        if (input) {
            numbersToAdd = parseNumberInput(input);
            label = input;
        } else if (previewNumbers.size > 0) {
            numbersToAdd = Array.from(previewNumbers);
            // 收集当前激活的筛选按钮名称作为标签
            label = getActiveFilterLabels();
            if (!label) {
                label = `${numbersToAdd.length}个号码`;
            }
        }

        if (numbersToAdd.length === 0) {
            alert('请先输入或选择号码');
            return;
        }

        // 根据模式决定添加类型
        if (currentMode.startsWith('drag')) {
            // 拖式模式：弹出选择拖胆或拖码
            showDragTypeDialog(numbersToAdd, label);
        } else {
            // 单式/复式模式：添加为选号条件
            addCondition(numbersToAdd, label, 'include');
            // 清空输入和预览（自动复位）
            clearPreviewHighlights();
        }
    });

    // 杀号按钮
    document.getElementById('killNumbersBtn').addEventListener('click', () => {
        const input = customInput.value.trim();

        let numbersToKill = [];
        let label = '';

        if (input) {
            numbersToKill = parseNumberInput(input);
            label = input;
        } else if (previewNumbers.size > 0) {
            numbersToKill = Array.from(previewNumbers);
            // 收集当前激活的筛选按钮名称作为标签
            label = getActiveFilterLabels();
            if (!label) {
                label = `${numbersToKill.length}个号码`;
            }
        }

        if (numbersToKill.length === 0) {
            alert('请先输入或选择要杀的号码');
            return;
        }

        if (currentMode.startsWith('drag')) {
            // 拖式模式：添加为拖式杀号条件
            addCondition(numbersToKill, label, 'dragExclude');
        } else {
            // 添加为杀号条件
            addCondition(numbersToKill, label, 'exclude');
        }

        // 清空输入和预览（自动复位）
        clearPreviewHighlights();
    });

    // 复制结果
    document.getElementById('copyResultBtn').addEventListener('click', () => {
        if (lastResult.numbers.length === 0 && lastResult.combinations.length === 0) {
            alert('没有可复制的内容');
            return;
        }

        let textToCopy = '';
        if (currentMode === 'single') {
            textToCopy = formatNumbers(lastResult.numbers);
        } else {
            textToCopy = lastResult.combinations.map(combo => formatNumbers(combo)).join('\n');
        }

        copyToClipboard(textToCopy);
    });

    // 回车添加
    customInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('addNumbersBtn').click();
        }
    });

    // 清空杀码
    const clearKillBtn = document.getElementById('clearKillBtn');
    if (clearKillBtn) {
        clearKillBtn.addEventListener('click', () => {
            conditions = conditions.filter(c => c.type !== 'exclude');
            updateResultDisplay();
            updateBallStates();
        });
    }
}

// 初始化模式选择
function initModeSelect() {
    document.getElementById('calcMode').addEventListener('change', function () {
        currentMode = this.value;

        // 切换模式时清空所有数据和状态
        clearAllConditions();

        // 重置拖式阶段
        dragPhase = 'banker';

        updateResultDisplay();
    });
}

// ========== 条件管理 ==========
// 添加条件（带分类信息）
function addCondition(numbers, label, type, category = null) {
    // 如果没有指定分类，尝试从当前激活的按钮获取
    if (!category) {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) {
            category = getButtonCategory(activeBtn);
        }
    }

    // 分类名称映射
    const categoryNames = {
        'wave': '波色',
        'size': '两面',
        'head': '头数',
        'tail': '尾数',
        'element': '五行',
        'zodiac': '生肖'
    };

    const categoryName = categoryNames[category] || '自定义';

    conditions.push({
        id: nextConditionId++,
        label: label,
        category: category,
        categoryName: categoryName,
        numbers: numbers.sort((a, b) => a - b),
        type: type
    });

    updateResultDisplay();
    updateBallStates();
}

// 移除条件
function removeCondition(id) {
    conditions = conditions.filter(c => c.id !== id);
    updateResultDisplay();
    updateBallStates();
}

// 显示拖式类型选择对话框
function showDragTypeDialog(numbers, label) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'drag-type-modal';
    modal.innerHTML = `
        <div class="drag-type-dialog">
            <h3>选择添加类型</h3>
            <p>将 ${numbers.length} 个号码添加为：</p>
            <div class="drag-type-buttons">
                <button class="drag-type-btn banker-btn" id="addAsBanker">🎯 拖胆</button>
                <button class="drag-type-btn leg-btn" id="addAsLeg">📋 拖码</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 添加事件监听
    document.getElementById('addAsBanker').addEventListener('click', () => {
        addCondition(numbers, label, 'banker');
        closeDragTypeDialog(modal);
    });

    document.getElementById('addAsLeg').addEventListener('click', () => {
        addCondition(numbers, label, 'leg');
        closeDragTypeDialog(modal);
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDragTypeDialog(modal);
        }
    });
}

// 关闭对话框
function closeDragTypeDialog(modal) {
    modal.remove();
    clearPreviewHighlights();
}

// 从拖胆和拖码中移除号码
function removeNumbersFromDrag(numbersToRemove) {
    const removeSet = new Set(numbersToRemove);

    // 遍历所有拖胆和拖码条件，移除指定号码
    conditions = conditions.map(c => {
        if (c.type === 'banker' || c.type === 'leg') {
            const filteredNumbers = c.numbers.filter(n => !removeSet.has(n));
            return { ...c, numbers: filteredNumbers };
        }
        return c;
    }).filter(c => {
        // 移除空的条件
        if ((c.type === 'banker' || c.type === 'leg') && c.numbers.length === 0) {
            return false;
        }
        return true;
    });

    updateResultDisplay();
    updateBallStates();
}

// 清空所有条件
function clearAllConditions() {
    conditions = [];
    previewNumbers.clear();

    // 重置拖式阶段
    dragPhase = 'banker';

    // 清除所有高亮和选中状态
    document.querySelectorAll('.number-ball').forEach(ball => {
        ball.classList.remove('highlight', 'selected', 'killed');
    });

    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });

    // 清空输入框
    const customInput = document.getElementById('customInput');
    if (customInput) {
        customInput.value = '';
    }

    updateResultDisplay();
}

// 清除预览高亮（可选是否清除输入框）
function clearPreviewHighlights(clearInput = true) {
    previewNumbers.clear();

    // 清除所有号码球的高亮（但保留selected和killed状态）
    document.querySelectorAll('.number-ball.highlight').forEach(ball => {
        ball.classList.remove('highlight');
    });

    // 重置所有筛选按钮的激活状态
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });

    // 根据参数决定是否清空输入框
    if (clearInput) {
        const customInput = document.getElementById('customInput');
        if (customInput) customInput.value = '';
    }
}

// 仅清除高亮（不清除输入框，用于输入时的实时预览）
function clearPreviewHighlightsOnly() {
    clearPreviewHighlights(false);
}

// 更新球的状态显示（只显示杀号状态）
function updateBallStates() {
    // 获取所有杀号
    let killedNumbers = new Set();

    if (currentMode.startsWith('drag')) {
        // 拖式模式：使用拖式杀码
        const dragExcludeConditions = conditions.filter(c => c.type === 'dragExclude');
        dragExcludeConditions.forEach(c => c.numbers.forEach(n => killedNumbers.add(n)));
    } else {
        // 单式/复式模式：使用普通杀码
        const excludeConditions = conditions.filter(c => c.type === 'exclude');
        excludeConditions.forEach(c => c.numbers.forEach(n => killedNumbers.add(n)));
    }

    // 更新每个球的状态
    for (let i = 1; i <= 49; i++) {
        const ball = document.querySelector(`.number-ball[data-number="${i}"]`);
        if (!ball) continue;

        ball.classList.remove('selected', 'killed');

        if (killedNumbers.has(i)) {
            ball.classList.add('killed');
        }
    }

    // 更新杀码区域显示
    updateKillDisplay();
}



// 更新杀码显示
function updateKillDisplay() {
    const killSection = document.getElementById('killSection');
    const killTags = document.getElementById('killTags');
    const excludeConditions = conditions.filter(c => c.type === 'exclude');

    if (excludeConditions.length === 0) {
        killSection.style.display = 'none';
        return;
    }

    killSection.style.display = 'block';
    killTags.innerHTML = '';

    excludeConditions.forEach(item => {
        const tag = document.createElement('div');
        tag.className = 'kill-tag';
        tag.innerHTML = `
            <span>杀: ${item.label} (${item.numbers.length}个)</span>
            <span class="remove-kill" onclick="removeCondition(${item.id})">✕</span>
        `;
        killTags.appendChild(tag);
    });
}

// ========== 核心计算逻辑 ==========
// 计算交集号码（同分类内并集，不同分类间交集）
function calculateIntersection() {
    const includeConditions = conditions.filter(c => c.type === 'include');
    const excludeConditions = conditions.filter(c => c.type === 'exclude');

    if (includeConditions.length === 0) {
        return [];
    }

    // 按分类分组
    const groupedByCategory = {};
    includeConditions.forEach(c => {
        const cat = c.category || 'custom';
        if (!groupedByCategory[cat]) {
            groupedByCategory[cat] = new Set();
        }
        // 同分类内取并集
        c.numbers.forEach(n => groupedByCategory[cat].add(n));
    });

    // 不同分类间取交集
    const categories = Object.keys(groupedByCategory);
    if (categories.length === 0) {
        return [];
    }

    let result = Array.from(groupedByCategory[categories[0]]);
    for (let i = 1; i < categories.length; i++) {
        const catNumbers = groupedByCategory[categories[i]];
        result = result.filter(n => catNumbers.has(n));
    }

    // 排除杀号
    const killedNumbers = new Set();
    excludeConditions.forEach(c => c.numbers.forEach(n => killedNumbers.add(n)));
    result = result.filter(n => !killedNumbers.has(n));

    return result.sort((a, b) => a - b);
}

// 计算合集号码（任一条件满足）
function calculateUnion() {
    const includeConditions = conditions.filter(c => c.type === 'include');
    const excludeConditions = conditions.filter(c => c.type === 'exclude');

    if (includeConditions.length === 0) {
        return [];
    }

    // 选号条件取并集
    const unionSet = new Set();
    includeConditions.forEach(c => {
        c.numbers.forEach(n => unionSet.add(n));
    });

    // 排除杀号
    const killedNumbers = new Set();
    excludeConditions.forEach(c => c.numbers.forEach(n => killedNumbers.add(n)));

    let result = Array.from(unionSet).filter(n => !killedNumbers.has(n));

    return result.sort((a, b) => a - b);
}

// 保持兼容性的包装函数
function calculateFinalNumbers() {
    return calculateIntersection();
}

// 更新结果显示
function updateResultDisplay() {
    const resultContent = document.getElementById('resultContent');
    const includeConditions = conditions.filter(c => c.type === 'include');
    const excludeConditions = conditions.filter(c => c.type === 'exclude');
    const bankerConditions = conditions.filter(c => c.type === 'banker');
    const legConditions = conditions.filter(c => c.type === 'leg');

    if (conditions.length === 0) {
        // 根据模式显示不同的提示
        if (currentMode.startsWith('drag')) {
            resultContent.innerHTML = '<span class="placeholder-text">拖式模式：请先添加拖胆号码，再添加拖码号码...</span>';
        } else {
            resultContent.innerHTML = '<span class="placeholder-text">添加选号条件后自动显示统计结果...</span>';
        }
        lastResult = { mode: currentMode, numbers: [], combinations: [] };
        return;
    }

    let output = '';

    // 计算合集（用于复式）
    const unionNumbers = calculateUnion();

    // 根据不同模式显示不同格式
    if (currentMode === 'single') {
        // ========== 单式模式 ==========
        const intersectionNumbers = calculateIntersection();

        // 显示交集结果
        output += `📊 统计交集结果：`;
        if (intersectionNumbers.length > 0) {
            output += `${formatNumbers(intersectionNumbers)}（共${intersectionNumbers.length}个）\n`;
        } else {
            output += `无（没有符合所有条件的号码）\n`;
        }

        // 显示合集结果
        output += `📊 统计合集结果：`;
        if (unionNumbers.length > 0) {
            output += `${formatNumbers(unionNumbers)}（共${unionNumbers.length}个）\n`;
        } else {
            output += `无\n`;
        }

        output += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        // 显示选号条件
        output += formatConditionsDisplay(includeConditions, excludeConditions);

        lastResult = { mode: currentMode, numbers: intersectionNumbers, combinations: [] };

        // 显示分类统计
        if (intersectionNumbers.length > 0) {
            output += '\n' + getDetailedStatistics(intersectionNumbers);
        }

    } else if (currentMode.startsWith('compound')) {
        // ========== 复式模式 ==========
        const n = parseInt(currentMode.replace('compound', ''));

        // 选择条件（按分类显示）
        output += '选择条件\n';
        output += formatConditionsForCompound(includeConditions);

        // 使用合集生成组合
        if (unionNumbers.length >= n) {
            const combinations = generateCombinations(unionNumbers, n);
            lastResult = { mode: currentMode, numbers: unionNumbers, combinations: combinations };

            output += `\n统计结果（复式${n}）：\n`;
            output += `共${combinations.length}注\n\n`;

            // 显示所有组合
            combinations.slice(0, 100).forEach(combo => {
                output += `${formatNumbers(combo)}\n`;
            });
            if (combinations.length > 100) {
                output += `\n...(还有${combinations.length - 100}注)\n`;
            }
        } else {
            lastResult = { mode: currentMode, numbers: unionNumbers, combinations: [] };
            output += `\n统计结果（复式${n}）：\n`;
            output += `号码不足${n}个，无法生成组合\n`;
        }

    } else if (currentMode.startsWith('drag')) {
        // ========== 拖式模式 ==========
        const n = parseInt(currentMode.replace('drag', ''));

        // 计算拖胆和拖码的号码（保留共享号码）
        const bankerNumbers = new Set();
        bankerConditions.forEach(c => c.numbers.forEach(num => bankerNumbers.add(num)));
        const bankerArr = Array.from(bankerNumbers).sort((a, b) => a - b);

        const legNumbers = new Set();
        legConditions.forEach(c => c.numbers.forEach(num => legNumbers.add(num)));
        // 不排除共享号码，保留原始拖码用于显示
        const legArr = Array.from(legNumbers).sort((a, b) => a - b);

        // 获取拖式杀码
        const dragExcludeConditions = conditions.filter(c => c.type === 'dragExclude');
        const excludeNumbers = new Set();
        dragExcludeConditions.forEach(c => c.numbers.forEach(num => excludeNumbers.add(num)));

        // 从拖胆和拖码中排除杀码
        const filteredBankerArr = bankerArr.filter(n => !excludeNumbers.has(n));
        const filteredLegArr = legArr.filter(n => !excludeNumbers.has(n));

        output += `统计结果（拖式${n}）：\n`;
        output += `拖胆：\n`;
        if (bankerConditions.length > 0) {
            output += formatConditionsForDrag(bankerConditions);
        } else {
            output += `  （请添加拖胆号码）\n`;
        }

        output += `拖码：\n`;
        if (legConditions.length > 0) {
            output += formatConditionsForDrag(legConditions);
        } else {
            output += `  （请添加拖码号码）\n`;
        }

        // 显示杀码条件
        if (dragExcludeConditions.length > 0) {
            output += `杀码：\n`;
            output += formatConditionsForDrag(dragExcludeConditions);
        }

        // 生成拖式组合
        // 规则：每个组合必须至少包含1个拖胆 + 至少1个拖码
        if (filteredBankerArr.length > 0 && filteredLegArr.length > 0) {
            // 找出共享号码（同时在拖胆和拖码中的）
            const bankerSet = new Set(filteredBankerArr);
            const legSet = new Set(filteredLegArr);

            // 纯拖胆（只在拖胆中）
            const pureBankers = filteredBankerArr.filter(n => !legSet.has(n));
            // 纯拖码（只在拖码中）
            const pureLegs = filteredLegArr.filter(n => !bankerSet.has(n));
            // 共享号码
            const sharedNumbers = filteredBankerArr.filter(n => legSet.has(n));

            // 所有可用号码
            const allNumbers = [...new Set([...filteredBankerArr, ...filteredLegArr])].sort((a, b) => a - b);

            // 生成所有n个号码的组合
            const allPossibleCombos = generateCombinations(allNumbers, n);

            // 过滤：必须至少1个拖胆 + 至少1个拖码 + 最多1个纯拖胆
            const pureBankerSet = new Set(pureBankers);
            const allCombinations = allPossibleCombos.filter(combo => {
                const hasBanker = combo.some(num => bankerSet.has(num));
                const hasLeg = combo.some(num => legSet.has(num));
                // 计算组合中纯拖胆的数量（不含共享号码的拖胆）
                const pureBankerCount = combo.filter(num => pureBankerSet.has(num)).length;
                // 规则：至少1个拖胆 + 至少1个拖码 + 最多1个纯拖胆
                return hasBanker && hasLeg && pureBankerCount <= 1;
            });

            lastResult = { mode: currentMode, numbers: [...filteredBankerArr, ...filteredLegArr], combinations: allCombinations };

            output += `\n共${allCombinations.length}注\n\n`;

            // 显示所有组合
            allCombinations.slice(0, 100).forEach(combo => {
                output += `${formatNumbers(combo)}\n`;
            });
            if (allCombinations.length > 100) {
                output += `\n...(还有${allCombinations.length - 100}注)\n`;
            }
        } else {
            lastResult = { mode: currentMode, numbers: [...filteredBankerArr, ...filteredLegArr], combinations: [] };
            output += `\n号码不足，无法生成${n}个号码的组合\n`;
        }
    } else {
        lastResult = { mode: currentMode, numbers: [], combinations: [] };
        if (filteredBankerArr.length === 0 && bankerArr.length > 0) {
            output += `\n拖胆号码全部被杀，无法生成组合\n`;
        } else if (filteredBankerArr.length === 0) {
            output += `\n请先添加拖胆号码\n`;
        } else if (filteredLegArr.length === 0 && legArr.length > 0) {
            output += `\n拖码号码全部被杀，无法生成组合\n`;
        } else if (filteredLegArr.length === 0) {
            output += `\n请添加拖码号码\n`;
        }
    }

    resultContent.textContent = output;
}

// ========== 通用工具函数 ==========
// 按分类分组条件
function groupConditionsByCategory(conditions) {
    const grouped = {};
    conditions.forEach(c => {
        const cat = c.categoryName || '自定义';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(c);
    });
    return grouped;
}

// 合并条件号码（取并集）
function mergeConditionNumbers(items) {
    const merged = new Set();
    items.forEach(c => c.numbers.forEach(n => merged.add(n)));
    return Array.from(merged).sort((a, b) => a - b);
}

// 格式化复式条件显示
function formatConditionsForCompound(conditions) {
    let output = '';
    const grouped = groupConditionsByCategory(conditions);

    for (let cat in grouped) {
        const items = grouped[cat];
        const sortedNumbers = mergeConditionNumbers(items);
        output += `${cat}：${formatNumbers(sortedNumbers)}（共${sortedNumbers.length}个）\n`;
    }
    return output;
}

// 格式化拖式条件显示（按分类合并）
function formatConditionsForDrag(conditions) {
    let output = '';
    const grouped = groupConditionsByCategory(conditions);

    for (let cat in grouped) {
        const items = grouped[cat];
        const sortedNumbers = mergeConditionNumbers(items);
        const labels = items.map(c => c.label).join('+');
        output += `  ${cat}: ${labels} → ${formatNumbers(sortedNumbers)} (${sortedNumbers.length}个)\n`;
    }
    return output;
}

// 格式化条件显示（单式模式）
function formatConditionsDisplay(includeConditions, excludeConditions) {
    let output = '';

    if (includeConditions.length > 0) {
        output += '📋 选号条件：\n';
        const grouped = groupConditionsByCategory(includeConditions);
        for (let cat in grouped) {
            const items = grouped[cat];
            const sortedNumbers = mergeConditionNumbers(items);
            const labels = items.map(c => c.label).join('+');
            output += `  ${cat}: ${labels} → ${formatNumbers(sortedNumbers)} (${sortedNumbers.length}个)\n`;
        }
    }

    if (excludeConditions.length > 0) {
        output += '\n🚫 杀号条件：\n';
        const grouped = groupConditionsByCategory(excludeConditions);
        for (let cat in grouped) {
            const items = grouped[cat];
            const sortedNumbers = mergeConditionNumbers(items);
            const labels = items.map(c => c.label).join('+');
            output += `  ${cat}: ${labels} → ${formatNumbers(sortedNumbers)} (${sortedNumbers.length}个)\n`;
        }
    }

    return output;
}


// 获取详细统计信息
function getDetailedStatistics(numbers) {
    if (numbers.length === 0) return '';

    let info = '📈 分类统计：\n';

    // 波色统计
    const redCount = numbers.filter(n => numberData.wave.red.includes(n)).length;
    const blueCount = numbers.filter(n => numberData.wave.blue.includes(n)).length;
    const greenCount = numbers.filter(n => numberData.wave.green.includes(n)).length;
    info += `  波色: 🔴红${redCount} 🔵蓝${blueCount} 🟢绿${greenCount}\n`;

    // 大小统计
    const bigCount = numbers.filter(n => n >= 25).length;
    const smallCount = numbers.filter(n => n < 25).length;
    info += `  大小: 大${bigCount} 小${smallCount}\n`;

    // 单双统计
    const oddCount = numbers.filter(n => n % 2 === 1).length;
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    info += `  单双: 单${oddCount} 双${evenCount}\n`;

    // 五行统计
    const elementStats = {};
    for (let element in numberData.element) {
        elementStats[element] = numbers.filter(n => numberData.element[element].includes(n)).length;
    }
    info += `  五行: 金${elementStats['金']} 木${elementStats['木']} 水${elementStats['水']} 火${elementStats['火']} 土${elementStats['土']}\n`;

    // 生肖统计
    const zodiacList = [];
    for (let zodiac in numberData.zodiac) {
        const count = numbers.filter(n => numberData.zodiac[zodiac].includes(n)).length;
        zodiacList.push(`${zodiac}${count}`);
    }
    info += `  生肖: ${zodiacList.join(' ')}\n`;

    return info;
}

// ========== 工具函数 ==========
// 生成组合
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

// 解析号码输入
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

    // 2. 处理关键字（生肖、波色、五行）
    for (let zodiac in numberData.zodiac) {
        if (input.includes(zodiac)) {
            numberData.zodiac[zodiac].forEach(n => numbers.add(n));
        }
    }

    if (input.includes('红')) numberData.wave.red.forEach(n => numbers.add(n));
    if (input.includes('蓝')) numberData.wave.blue.forEach(n => numbers.add(n));
    if (input.includes('绿')) numberData.wave.green.forEach(n => numbers.add(n));

    for (let element in numberData.element) {
        if (input.includes(element)) {
            numberData.element[element].forEach(n => numbers.add(n));
        }
    }

    // 3. 处理单个号码
    let remaining = input.replace(/(\d+)\s*[-~]\s*(\d+)/g, '');
    const parts = remaining.split(/[,.\s]+/);

    for (let part of parts) {
        part = part.trim();
        if (!part) continue;

        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= 49) {
            numbers.add(num);
        }
    }

    return Array.from(numbers).sort((a, b) => a - b);
}

// 格式化号码
function formatNumber(n) {
    return n.toString().padStart(2, '0');
}

// 格式化号码数组
function formatNumbers(numbers) {
    return numbers.map(n => formatNumber(n)).join(', ');
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('复制成功！');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('复制成功！');
        } catch (error) {
            alert('复制失败，请手动复制');
        }
        document.body.removeChild(textarea);
    });
}
