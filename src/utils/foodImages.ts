const foodNameToFile: Record<string, string> = {
  '白米饭': '白米饭.png',
  'rice': '白米饭.png',
  '鸡胸肉': '鸡胸肉.png',
  'chicken breast': '鸡胸肉.png',
  '拿铁咖啡': '拿铁咖啡.png',
  'latte': '拿铁咖啡.png',
  '可乐': '可乐.png',
  'cola': '可乐.png',
  '橙汁': '橙汁.png',
  'orange juice': '橙汁.png',
  '薯条': '薯条.png',
  'fries': '薯条.png',
  '薯片': '薯片.png',
  'chips': '薯片.png',
  '巧克力蛋糕': '巧克力蛋糕.png',
  'chocolate cake': '巧克力蛋糕.png',
  '冰淇淋': '冰淇淋.png',
  'ice cream': '冰淇淋.png',
  '三明治': '三明治.png',
  'sandwich': '三明治.png',
  '蛋挞': '蛋挞.png',
  'egg tart': '蛋挞.png',
  '坚果': '坚果.png',
  'nuts': '坚果.png',
}

export function getFoodImage(foodName: string): string | null {
  if (!foodName) return null
  const key = foodName.trim().toLowerCase()
  const file = foodNameToFile[key]
  if (file) return `/foods/${file}`
  // 模糊匹配
  for (const [k, v] of Object.entries(foodNameToFile)) {
    if (key.includes(k) || k.includes(key)) return `/foods/${v}`
  }
  return null
}

export default foodNameToFile
