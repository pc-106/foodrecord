// AI 营养分析 — DeepSeek API + 本地算法兜底

interface NutritionInput {
  foodName: string
  mealType: string
  servings: number
  calories: number
}

interface NutritionReport {
  score: number
  level: string
  analysis: string
  suggestions: string[]
  warnings: string[]
}

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''

async function deepSeekAnalyze(input: NutritionInput): Promise<NutritionReport | null> {
  if (!DEEPSEEK_KEY || DEEPSEEK_KEY.includes('你的')) return null

  try {
    const prompt = `你是营养分析师。分析以下食物：
- 名称：${input.foodName}
- 类别：${input.mealType}（drink=饮品 food=食物 snack=小吃 dessert=甜点）
- 份数：${input.servings}
- 热量：${input.calories} kcal

请返回纯 JSON（不要 markdown）：
{
  "score": 0-100的整数,
  "level": "优秀/良好/一般/注意",
  "analysis": "50字以内的简洁评价",
  "suggestions": ["建议1", "建议2"],
  "warnings": ["警告1，没有则为空数组"]
}`

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      }),
    })

    const data = await res.json() as any
    const text = data.choices?.[0]?.message?.content || ''
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())
    return { ...json, score: Math.min(100, Math.max(0, json.score || 50)) }
  } catch {
    return null
  }
}

// 本地算法兜底
function localAnalyze(input: NutritionInput): NutritionReport {
  const foodDB: Record<string, { score: number; tags: string[]; caution?: string; tip: string }> = {
    '鸡胸肉': { score: 85, tags: ['高蛋白', '低脂'], tip: '优质蛋白来源，健身首选' },
    '白米饭': { score: 55, tags: ['主食', '碳水'], caution: '升糖较快', tip: '搭配蔬菜和蛋白质更均衡' },
    '薯条': { score: 30, tags: ['油炸', '高热量'], caution: '油炸食品', tip: '偶尔享用，搭配沙拉平衡' },
    '薯片': { score: 25, tags: ['加工食品', '高钠'], caution: '高钠高脂', tip: '用坚果替代更健康' },
    '巧克力蛋糕': { score: 35, tags: ['高糖', '甜点'], caution: '糖分偏高', tip: '作为奖励偶尔吃' },
    '冰淇淋': { score: 35, tags: ['高糖', '乳制品'], tip: '选低糖版本更好' },
    '可乐': { score: 15, tags: ['含糖饮料', '空热量'], caution: '空热量饮料', tip: '用白开水或无糖茶替代' },
    '橙汁': { score: 60, tags: ['维生素C', '天然果糖'], tip: '鲜榨更好，市售含糖注意' },
    '拿铁咖啡': { score: 55, tags: ['咖啡因', '乳制品'], tip: '选脱脂奶降低热量' },
    '三明治': { score: 70, tags: ['主食+蛋白'], tip: '营养均衡的便捷选择' },
    '蛋挞': { score: 50, tags: ['蛋奶', '烘焙'], tip: '小巧但热量不低' },
    '坚果': { score: 90, tags: ['健康脂肪', '维生素E'], tip: '每天一小把，营养密度高' },
  }

  const key = Object.keys(foodDB).find(k => input.foodName.includes(k))
  const info = foodDB[key || ''] || { score: 50, tags: ['未分类'], tip: '保持饮食多样化' }

  const calsPerServing = input.calories / Math.max(1, input.servings)
  if (input.calories > 800) info.caution = (info.caution || '') + ' 单餐热量偏高'

  const levels = [{ min: 80, level: '优秀' }, { min: 60, level: '良好' }, { min: 40, level: '一般' }, { min: 0, level: '注意' }]
  const { level } = levels.find(l => info.score >= l.min)!

  return {
    score: info.score,
    level,
    analysis: `${info.tags.join(' · ')}。${info.tip}`,
    suggestions: [info.tip, '每餐尽量蛋白质+蔬菜+主食搭配'],
    warnings: info.caution ? [info.caution.trim()] : [],
  }
}

export async function analyzeNutrition(input: NutritionInput): Promise<NutritionReport> {
  const ai = await deepSeekAnalyze(input)
  return ai || localAnalyze(input)
}
