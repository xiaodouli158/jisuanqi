// 号码数据定义
const numberData = {
    // 1-49号码的各种属性
    numbers: Array.from({length: 49}, (_, i) => i + 1),
    
    // 生肖 (准确对应)
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
        // 野兽：鼠、虎、兔、龙、蛇、猴
        '野兽': [1, 2, 3, 4, 6, 10, 13, 14, 15, 16, 18, 22, 25, 26, 27, 28, 30, 34, 37, 38, 39, 40, 42, 46, 49],
        // 家畜：牛、马、羊、鸡、狗、猪
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
    
    // 大小: 大(25-49), 小(1-24)
    size: {
        big: Array.from({length: 25}, (_, i) => i + 25),
        small: Array.from({length: 24}, (_, i) => i + 1)
    },
    
    // 尾大尾小
    tailSize: {
        // 尾大：尾数为5-9
        big: [5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 25, 26, 27, 28, 29, 35, 36, 37, 38, 39, 45, 46, 47, 48, 49],
        // 尾小：尾数为0-4
        small: [1, 2, 3, 4, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34, 40, 41, 42, 43, 44]
    },
    
    // 单双
    parity: {
        odd: Array.from({length: 25}, (_, i) => i * 2 + 1).filter(n => n <= 49),
        even: Array.from({length: 24}, (_, i) => (i + 1) * 2).filter(n => n <= 49)
    },
    
    // 波色
    wave: {
        red: [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
        blue: [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
        green: [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
    }
};

// 当前选中的按钮分类
let selectedButtons = {
    number: new Set(),      // 号码
    zodiac: new Set(),      // 生肖
    element: new Set(),     // 五行
    wave: new Set(),        // 波色
    head: new Set(),        // 头数
    tail: new Set(),        // 尾数
    size: new Set(),        // 大小
    parity: new Set(),      // 单双
    beast: new Set(),       // 野兽/家畜
    'tail-size': new Set()  // 尾大/尾小
};

// 当前计算模式
let currentMode = 'single';

// 存储最后的计算结果（用于复制）
let lastResult = {
    mode: 'single',
    numbers: [],
    combinations: []
};

// 拖式模式下的拖胆和拖码
let dragBalls = new Set(); // 拖胆号码
let dragCodes = new Set(); // 拖码号码

// 当前等待处理的按钮信息
let pendingButton = null;

// 初始化按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const text = this.textContent;
            
            if (!this.classList.contains('btn-active')) {
                // 尝试添加选择
                this.classList.add('btn-active');
                if (selectedButtons[type]) {
                    selectedButtons[type].add(text);
                }
                
                // 获取当前按钮对应的号码
                const nums = getNumbersByCategory(type, text);
                
                // 如果是拖式模式，显示选择对话框
                if (currentMode.startsWith('drag')) {
                    pendingButton = {
                        element: this,
                        type: type,
                        text: text,
                        numbers: nums
                    };
                    showDragDialog();
                    return; // 等待用户选择
                } else if (currentMode === 'single') {
                    // 只在单式模式下检查交集
                    const finalNumbers = calculateFinalNumbers();
                    
                    // 如果没有交集且有多个分类，撤销选择
                    if (finalNumbers.length === 0 && hasMultipleCategories()) {
                        this.classList.remove('btn-active');
                        if (selectedButtons[type]) {
                            selectedButtons[type].delete(text);
                        }
                        alert('该选择与已选条件没有交集，请重新选择');
                        return;
                    }
                }
                
                // 自动计算并显示结果
                calculateAll();
                
            } else {
                // 取消选择
                this.classList.remove('btn-active');
                if (selectedButtons[type]) {
                    selectedButtons[type].delete(text);
                }
                
                // 如果是拖式模式，从拖胆和拖码中移除
                if (currentMode.startsWith('drag')) {
                    const nums = getNumbersByCategory(type, text);
                    nums.forEach(n => {
                        dragBalls.delete(n);
                        dragCodes.delete(n);
                    });
                }
                
                // 自动计算并显示结果
                calculateAll();
            }
        });
    });
    
    // 初始显示提示信息
    document.getElementById('statsOutput').textContent = '请选择分类条件...';
});

// 显示拖式选择对话框
function showDragDialog() {
    document.getElementById('dragDialog').style.display = 'flex';
}

// 隐藏拖式选择对话框
function hideDragDialog() {
    document.getElementById('dragDialog').style.display = 'none';
}

// 选择拖胆或拖码
function selectDragType(type) {
    if (!pendingButton) return;
    
    const nums = pendingButton.numbers;
    
    if (type === 'ball') {
        // 添加到拖胆
        nums.forEach(n => dragBalls.add(n));
    } else {
        // 添加到拖码
        nums.forEach(n => dragCodes.add(n));
    }
    
    // 隐藏对话框
    hideDragDialog();
    
    // 清空待处理按钮
    pendingButton = null;
    
    // 自动计算并显示结果
    calculateAll();
}

// 检查是否有多个分类被选中
function hasMultipleCategories() {
    let count = 0;
    for (let category in selectedButtons) {
        if (selectedButtons[category].size > 0) {
            count++;
        }
    }
    return count > 1;
}

// 模式切换
function onModeChange() {
    const oldMode = currentMode;
    currentMode = document.getElementById('calcMode').value;
    
    // 如果从拖式切换到其他模式，或从其他模式切换到拖式，清空拖胆拖码
    if (oldMode.startsWith('drag') !== currentMode.startsWith('drag')) {
        dragBalls.clear();
        dragCodes.clear();
    }
    
    calculateAll();
}

// 生成组合（从数组中选择n个元素的所有组合）
function getCombinations(arr, n) {
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

// 检查组合是否有重复号码
function hasNoDuplicates(combo) {
    const set = new Set(combo);
    return set.size === combo.length;
}

// 组合排序（用于去重）
function sortCombo(combo) {
    return [...combo].sort((a, b) => a - b);
}

// 组合转字符串（用于去重）
function comboToString(combo) {
    return sortCombo(combo).join(',');
}

// 生成复式组合
function generateCompoundCombinations(numbers, n) {
    if (numbers.length < n) return [];
    
    const combinations = getCombinations(numbers, n);
    const uniqueCombos = new Set();
    const result = [];
    
    combinations.forEach(combo => {
        if (hasNoDuplicates(combo)) {
            const key = comboToString(combo);
            if (!uniqueCombos.has(key)) {
                uniqueCombos.add(key);
                result.push(sortCombo(combo));
            }
        }
    });
    
    return result;
}

// 生成拖式组合（第一个分类作为拖胆，其他作为拖码）
function generateDragCombinations(categories, n) {
    if (categories.length < 2) return [];
    
    const dragBall = categories[0]; // 拖胆
    const dragCode = []; // 拖码
    
    for (let i = 1; i < categories.length; i++) {
        dragCode.push(...categories[i]);
    }
    
    // 去重拖码
    const uniqueDragCode = [...new Set(dragCode)];
    
    const result = [];
    const uniqueCombos = new Set();
    
    // 拖胆中的每个号码
    dragBall.forEach(ball => {
        // 从拖码中选择 n-1 个号码
        const codeCombos = getCombinations(uniqueDragCode, n - 1);
        
        codeCombos.forEach(codeCombo => {
            const combo = [ball, ...codeCombo];
            if (hasNoDuplicates(combo)) {
                const key = comboToString(combo);
                if (!uniqueCombos.has(key)) {
                    uniqueCombos.add(key);
                    result.push(sortCombo(combo));
                }
            }
        });
    });
    
    return result;
}

// 获取分类的号码
function getNumbersByCategory(category, value) {
    switch(category) {
        case 'number':
            return [parseInt(value)];
        case 'zodiac':
            return numberData.zodiac[value] || [];
        case 'element':
            return numberData.element[value] || [];
        case 'wave':
            if (value === '红波') return numberData.wave.red;
            if (value === '蓝波') return numberData.wave.blue;
            if (value === '绿波') return numberData.wave.green;
            return [];
        case 'head':
            const headNum = parseInt(value);
            return numberData.numbers.filter(n => Math.floor(n / 10) === headNum);
        case 'tail':
            const tailNum = parseInt(value);
            return numberData.numbers.filter(n => n % 10 === tailNum);
        case 'size':
            if (value === '大') return numberData.size.big;
            if (value === '小') return numberData.size.small;
            return [];
        case 'parity':
            if (value === '单') return numberData.parity.odd;
            if (value === '双') return numberData.parity.even;
            return [];
        case 'beast':
            return numberData.beast[value] || [];
        case 'tail-size':
            if (value === '尾大') return numberData.tailSize.big;
            if (value === '尾小') return numberData.tailSize.small;
            return [];
        default:
            return [];
    }
}

// 计算最终号码（同类并集，不同类交集）
function calculateFinalNumbers() {
    let categoryResults = [];
    
    // 遍历每个分类，计算该分类的并集
    for (let category in selectedButtons) {
        if (selectedButtons[category].size > 0) {
            let categoryNumbers = new Set();
            
            // 同类的号码做并集（叠加）
            selectedButtons[category].forEach(value => {
                const nums = getNumbersByCategory(category, value);
                nums.forEach(n => categoryNumbers.add(n));
            });
            
            categoryResults.push(Array.from(categoryNumbers));
        }
    }
    
    // 如果没有选择任何按钮
    if (categoryResults.length === 0) {
        return [];
    }
    
    // 如果只有一个分类，直接返回
    if (categoryResults.length === 1) {
        return categoryResults[0].sort((a, b) => a - b);
    }
    
    // 多个分类之间做交集（筛选）
    let result = categoryResults[0];
    for (let i = 1; i < categoryResults.length; i++) {
        result = result.filter(n => categoryResults[i].includes(n));
    }
    
    return result.sort((a, b) => a - b);
}

// 清空结果
function clearResult() {
    // 清空所有选中状态
    for (let category in selectedButtons) {
        selectedButtons[category].clear();
    }
    
    // 移除所有按钮的激活状态
    const buttons = document.querySelectorAll('.btn.btn-active');
    buttons.forEach(btn => {
        btn.classList.remove('btn-active');
    });
    
    // 清空显示
    document.getElementById('statsOutput').textContent = '请选择分类条件...';
    
    // 清空结果缓存
    lastResult = {
        mode: 'single',
        numbers: [],
        combinations: []
    };
    
    // 清空拖胆拖码
    dragBalls.clear();
    dragCodes.clear();
}

// 复制结果
function copyResult() {
    let textToCopy = '';
    
    if (lastResult.mode === 'single') {
        // 单式：复制号码
        if (lastResult.numbers.length === 0) {
            alert('没有可复制的内容');
            return;
        }
        textToCopy = formatNumbers(lastResult.numbers);
    } else {
        // 复式和拖式：复制注数
        if (lastResult.combinations.length === 0) {
            alert('没有可复制的内容');
            return;
        }
        textToCopy = lastResult.combinations.map(combo => formatNumbers(combo)).join('\n');
    }
    
    // 复制到剪贴板
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('复制成功！');
    }).catch(err => {
        // 降级方案：使用传统方法
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
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

// 计算所有统计
function calculateAll() {
    // 收集所有选中的文字和对应号码
    let selectedItems = [];
    let categoryNumbers = []; // 按分类存储号码
    
    for (let category in selectedButtons) {
        if (selectedButtons[category].size > 0) {
            let categoryNums = new Set();
            selectedButtons[category].forEach(text => {
                const nums = getNumbersByCategory(category, text);
                selectedItems.push({
                    text: text,
                    numbers: nums
                });
                nums.forEach(n => categoryNums.add(n));
            });
            categoryNumbers.push(Array.from(categoryNums).sort((a, b) => a - b));
        }
    }
    
    if (selectedItems.length === 0) {
        document.getElementById('statsOutput').textContent = '请选择分类条件...';
        lastResult = { mode: 'single', numbers: [], combinations: [] };
        return;
    }
    
    let output = '';
    
    // 根据模式计算结果
    if (currentMode === 'single') {
        // 单式：计算交集和并集
        const finalNumbers = calculateFinalNumbers(); // 交集
        
        // 计算并集
        const allNumbersSet = new Set();
        categoryNumbers.forEach(catNums => {
            catNums.forEach(num => allNumbersSet.add(num));
        });
        const unionNumbers = Array.from(allNumbersSet).sort((a, b) => a - b);
        
        if (finalNumbers.length === 0 && unionNumbers.length === 0) {
            document.getElementById('statsOutput').textContent = '统计结果：没有符合条件的号码';
            lastResult = { mode: 'single', numbers: [], combinations: [] };
            return;
        }
        
        // 保存结果用于复制（交集）
        lastResult = {
            mode: 'single',
            numbers: finalNumbers,
            combinations: []
        };
        
        // 显示交集结果
        if (finalNumbers.length > 0) {
            output += `统计交集结果：${formatNumbers(finalNumbers)}，（共${finalNumbers.length}个）\n\n`;
        } else {
            output += `统计交集结果：无交集\n\n`;
        }
        
        // 显示并集结果
        if (unionNumbers.length > 0) {
            output += `统计合集结果：${formatNumbers(unionNumbers)}，（共${unionNumbers.length}个）\n\n`;
        }
        
    } else if (currentMode.startsWith('compound')) {
        // 复式：使用并集（所有选中的号码）
        const n = parseInt(currentMode.replace('compound', ''));
        
        // 获取所有选中的号码（并集）
        const allNumbersSet = new Set();
        categoryNumbers.forEach(catNums => {
            catNums.forEach(num => allNumbersSet.add(num));
        });
        const allNumbers = Array.from(allNumbersSet).sort((a, b) => a - b);
        
        if (allNumbers.length === 0) {
            document.getElementById('statsOutput').textContent = '统计结果：没有选中的号码';
            lastResult = { mode: currentMode, numbers: [], combinations: [] };
            return;
        }
        
        if (allNumbers.length < n) {
            document.getElementById('statsOutput').textContent = `统计结果：号码数量不足（共${allNumbers.length}个），无法生成${n}个号码的组合`;
            lastResult = { mode: currentMode, numbers: [], combinations: [] };
            return;
        }
        
        const combinations = generateCompoundCombinations(allNumbers, n);
        
        // 保存结果用于复制
        lastResult = {
            mode: currentMode,
            numbers: allNumbers,
            combinations: combinations
        };
        
        output += `统计结果（复式${n}）：\n`;
        output += `共${combinations.length}注\n\n`;
        combinations.forEach((combo, index) => {
            if (index < 100) { // 限制显示前100注
                output += `${formatNumbers(combo)}\n`;
            }
        });
        if (combinations.length > 100) {
            output += `...(还有${combinations.length - 100}注)\n`;
        }
        output += '\n';
        
    } else if (currentMode.startsWith('drag')) {
        // 拖式：使用用户选择的拖胆和拖码
        const n = parseInt(currentMode.replace('drag', ''));
        
        const dragBallArray = Array.from(dragBalls).sort((a, b) => a - b);
        const dragCodeArray = Array.from(dragCodes).sort((a, b) => a - b);
        
        if (dragBallArray.length === 0) {
            document.getElementById('statsOutput').textContent = '拖式需要至少选择1个拖胆';
            lastResult = { mode: currentMode, numbers: [], combinations: [] };
            return;
        }
        
        if (dragCodeArray.length === 0) {
            document.getElementById('statsOutput').textContent = '拖式需要至少选择1个拖码';
            lastResult = { mode: currentMode, numbers: [], combinations: [] };
            return;
        }
        
        if (dragCodeArray.length < n - 1) {
            document.getElementById('statsOutput').textContent = `拖式${n}需要至少${n-1}个拖码（当前只有${dragCodeArray.length}个）`;
            lastResult = { mode: currentMode, numbers: [], combinations: [] };
            return;
        }
        
        // 生成拖式组合
        const combinations = [];
        const uniqueCombos = new Set();
        
        // 对每个拖胆号码
        dragBallArray.forEach(ball => {
            // 从拖码中选择 n-1 个号码
            const codeCombos = getCombinations(dragCodeArray, n - 1);
            
            codeCombos.forEach(codeCombo => {
                const combo = [ball, ...codeCombo];
                // 检查是否有重复号码
                if (hasNoDuplicates(combo)) {
                    const key = comboToString(combo);
                    if (!uniqueCombos.has(key)) {
                        uniqueCombos.add(key);
                        combinations.push(sortCombo(combo));
                    }
                }
            });
        });
        
        if (combinations.length === 0) {
            document.getElementById('statsOutput').textContent = `统计结果：拖胆和拖码有重复号码，无法生成有效组合`;
            lastResult = { mode: currentMode, numbers: [], combinations: [] };
            return;
        }
        
        // 保存结果用于复制
        lastResult = {
            mode: currentMode,
            numbers: [],
            combinations: combinations
        };
        
        output += `统计结果（拖式${n}）：\n`;
        output += `拖胆：${formatNumbers(dragBallArray)}，（共${dragBallArray.length}个）\n`;
        output += `拖码：${formatNumbers(dragCodeArray)}，（共${dragCodeArray.length}个）\n`;
        output += `共${combinations.length}注\n\n`;
        combinations.forEach((combo, index) => {
            if (index < 100) { // 限制显示前100注
                output += `${formatNumbers(combo)}\n`;
            }
        });
        if (combinations.length > 100) {
            output += `...(还有${combinations.length - 100}注)\n`;
        }
        output += '\n';
    }
    
    // 显示选择条件及各自对应的号码
    output += `选择条件\n`;
    selectedItems.forEach(item => {
        output += `${item.text}：${formatNumbers(item.numbers)}，（共${item.numbers.length}个）\n`;
    });
    
    document.getElementById('statsOutput').textContent = output;
}

// 格式化号码为两位数
function formatNumber(n) {
    return n.toString().padStart(2, '0');
}

// 格式化号码数组
function formatNumbers(numbers) {
    return numbers.map(n => formatNumber(n)).join(', ');
}
