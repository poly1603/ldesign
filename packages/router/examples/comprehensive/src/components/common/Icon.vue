<template>
  <i :class="iconClass" :style="iconStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: string | number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '1em',
  color: 'currentColor'
})

const iconClass = computed(() => {
  // 这里使用简单的图标映射，实际项目中可以使用 Iconify 或其他图标库
  const iconMap: Record<string, string> = {
    // 基础图标
    home: '🏠',
    dashboard: '📊',
    users: '👥',
    products: '📦',
    settings: '⚙️',
    demo: '🎪',
    
    // 设备图标
    mobile: '📱',
    tablet: '📱',
    desktop: '🖥️',
    device: '📱',
    
    // 功能图标
    animation: '🎬',
    cache: '💾',
    performance: '⚡',
    preload: '🔄',
    typescript: '📘',
    
    // 导航图标
    menu: '☰',
    arrow-right: '→',
    arrow-left: '←',
    arrow-up: '↑',
    arrow-down: '↓',
    
    // 用户相关
    user: '👤',
    profile: '👤',
    login: '🔑',
    logout: '🚪',
    register: '📝',
    
    // 状态图标
    loading: '⏳',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    
    // 其他
    search: '🔍',
    filter: '🔽',
    sort: '↕️',
    edit: '✏️',
    delete: '🗑️',
    add: '➕',
    close: '✖️',
    check: '✓',
    star: '⭐',
    heart: '❤️',
    share: '📤',
    download: '⬇️',
    upload: '⬆️',
    link: '🔗',
    copy: '📋',
    print: '🖨️',
    email: '📧',
    phone: '📞',
    location: '📍',
    calendar: '📅',
    clock: '🕐',
    tag: '🏷️',
    bookmark: '🔖',
    flag: '🚩',
    bell: '🔔',
    lock: '🔒',
    unlock: '🔓',
    key: '🔑',
    shield: '🛡️',
    eye: '👁️',
    'eye-off': '🙈',
    refresh: '🔄',
    sync: '🔄',
    backup: '💾',
    restore: '📥',
    export: '📤',
    import: '📥',
    database: '🗄️',
    server: '🖥️',
    cloud: '☁️',
    wifi: '📶',
    bluetooth: '📶',
    battery: '🔋',
    power: '⚡',
    volume: '🔊',
    'volume-off': '🔇',
    camera: '📷',
    video: '📹',
    image: '🖼️',
    file: '📄',
    folder: '📁',
    'folder-open': '📂',
    zip: '🗜️',
    code: '💻',
    terminal: '⌨️',
    bug: '🐛',
    gear: '⚙️',
    tool: '🔧',
    wrench: '🔧',
    hammer: '🔨',
    scissors: '✂️',
    paperclip: '📎',
    pin: '📌',
    magnet: '🧲',
    compass: '🧭',
    map: '🗺️',
    globe: '🌍',
    translate: '🌐',
    language: '🌐',
    currency: '💰',
    chart: '📈',
    graph: '📊',
    pie: '🥧',
    calculator: '🧮',
    ruler: '📏',
    scale: '⚖️',
    trophy: '🏆',
    medal: '🏅',
    award: '🎖️',
    gift: '🎁',
    party: '🎉',
    celebration: '🎊',
    balloon: '🎈',
    cake: '🎂',
    candle: '🕯️',
    fire: '🔥',
    water: '💧',
    snow: '❄️',
    sun: '☀️',
    moon: '🌙',
    star: '⭐',
    rainbow: '🌈',
    cloud: '☁️',
    lightning: '⚡',
    umbrella: '☂️',
    tree: '🌳',
    flower: '🌸',
    leaf: '🍃',
    apple: '🍎',
    orange: '🍊',
    banana: '🍌',
    grape: '🍇',
    strawberry: '🍓',
    cherry: '🍒',
    peach: '🍑',
    pineapple: '🍍',
    coconut: '🥥',
    kiwi: '🥝',
    tomato: '🍅',
    eggplant: '🍆',
    avocado: '🥑',
    broccoli: '🥦',
    cucumber: '🥒',
    pepper: '🌶️',
    corn: '🌽',
    carrot: '🥕',
    onion: '🧅',
    garlic: '🧄',
    potato: '🥔',
    sweet_potato: '🍠',
    bread: '🍞',
    croissant: '🥐',
    bagel: '🥯',
    pretzel: '🥨',
    cheese: '🧀',
    meat: '🥩',
    bacon: '🥓',
    hamburger: '🍔',
    fries: '🍟',
    pizza: '🍕',
    hotdog: '🌭',
    sandwich: '🥪',
    taco: '🌮',
    burrito: '🌯',
    salad: '🥗',
    soup: '🍲',
    stew: '🍛',
    curry: '🍛',
    spaghetti: '🍝',
    ramen: '🍜',
    sushi: '🍣',
    bento: '🍱',
    rice: '🍚',
    rice_ball: '🍙',
    rice_cracker: '🍘',
    fish: '🐟',
    shrimp: '🍤',
    crab: '🦀',
    lobster: '🦞',
    squid: '🦑',
    oyster: '🦪',
    ice_cream: '🍦',
    cake: '🍰',
    pie: '🥧',
    chocolate: '🍫',
    candy: '🍬',
    lollipop: '🍭',
    honey: '🍯',
    milk: '🥛',
    coffee: '☕',
    tea: '🍵',
    wine: '🍷',
    beer: '🍺',
    cocktail: '🍸',
    juice: '🧃',
    water: '💧',
    bottle: '🍼'
  }
  
  return `icon icon-${props.name}`
})

const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color,
  display: 'inline-block',
  lineHeight: 1,
  verticalAlign: 'middle'
}))

// 获取图标字符
const getIconChar = (name: string): string => {
  const iconMap: Record<string, string> = {
    // 基础图标
    home: '🏠',
    dashboard: '📊',
    users: '👥',
    products: '📦',
    settings: '⚙️',
    demo: '🎪',
    
    // 设备图标
    mobile: '📱',
    tablet: '📱',
    desktop: '🖥️',
    device: '📱',
    
    // 功能图标
    animation: '🎬',
    cache: '💾',
    performance: '⚡',
    preload: '🔄',
    typescript: '📘',
    
    // 导航图标
    menu: '☰',
    'arrow-right': '→',
    'arrow-left': '←',
    'arrow-up': '↑',
    'arrow-down': '↓',
    
    // 用户相关
    user: '👤',
    profile: '👤',
    login: '🔑',
    logout: '🚪',
    register: '📝',
    
    // 状态图标
    loading: '⏳',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  
  return iconMap[name] || '❓'
}
</script>

<script lang="ts">
export default {
  name: 'Icon'
}
</script>

<style scoped>
.icon {
  display: inline-block;
  font-style: normal;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  user-select: none;
}

.icon::before {
  content: attr(data-icon);
}

/* 特定图标的样式 */
.icon-loading {
  animation: icon-spin 1s linear infinite;
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
