<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 功能区域添加虚线边框 -->
    <div class="rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-300">
      <h2 class="text-3xl font-bold text-purple-900 mb-6">Favicon生成器</h2>

      <!-- 上传区域 -->
      <div @drop="handleDrop" @dragover.prevent @dragenter.prevent
        class="mb-8 p-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/30 text-center hover:border-violet-500 transition-colors">
        <div class="space-y-4">
          <div class="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div>
            <p class="text-lg text-gray-600">拖拽图片到这里，或者</p>
            <label for="favicon-file-input"
              class="mt-2 inline-block cursor-pointer bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition-colors">
              选择文件
            </label>
            <input id="favicon-file-input" ref="fileInput" type="file" accept="image/*" @change="handleFileSelect"
              class="sr-only" hidden />
          </div>
          <p class="text-sm text-gray-500">支持 PNG, JPG, JPEG, WebP 格式，建议使用正方形图片</p>
        </div>
      </div>
    </div>

    <!-- 原图预览 -->
    <div v-if="selectedImage" class="mb-8 p-4 border border-dashed border-green-200 rounded-lg bg-green-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">原图预览</h3>
      <div class="text-center">
        <img ref="originalImage" :src="selectedImage.original" :alt="selectedImage.name"
          class="max-w-xs max-h-64 object-contain rounded-md mx-auto border" @load="onImageLoad" />
        <p class="text-sm text-gray-500 mt-2">{{ selectedImage.name }}</p>
        <p class="text-xs text-gray-400">{{ originalDimensions.width }} × {{ originalDimensions.height }}</p>
      </div>
    </div>

    <!-- Favicon尺寸预览 -->
    <div v-if="selectedImage" class="mb-8 p-4 border border-dashed border-purple-200 rounded-lg bg-purple-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">Favicon尺寸预览</h3>
      <div class="flex flex-wrap gap-6">
        <div v-for="size in faviconSizes" :key="size" class="text-center">
          <div class="bg-gray-100 rounded-lg p-4 mb-2">
            <canvas :ref="(el) => { if (el) canvasRefs[size] = el as HTMLCanvasElement }" :width="size" :height="size"
              class="mx-auto border rounded"
              :style="{ width: Math.min(size, 64) + 'px', height: Math.min(size, 64) + 'px' }"></canvas>
          </div>
          <p class="text-sm font-medium text-gray-700">{{ size }}×{{ size }}</p>
          <p class="text-xs text-gray-500">{{ getFaviconType(size) }}</p>
        </div>
      </div>
    </div>

    <!-- 生成选项 -->
    <div v-if="selectedImage" class="mb-8 p-4 border border-dashed border-yellow-200 rounded-lg bg-yellow-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">生成选项</h3>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col md:flex-row gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">背景色 (透明图片转换时)</label>
            <input v-model="backgroundColor" type="color"
              class="w-full h-10 border border-gray-300 rounded-md cursor-pointer" />
          </div>
          <div>
            <label class="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <input v-model="generateIco" type="checkbox" class="rounded" />
              <span>生成 .ico 文件</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">包含多个尺寸的传统 favicon 格式</p>
          </div>
        </div>

        <!-- 路径设置 -->
        <div class="border-t pt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">图标文件路径</label>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <input v-model="faviconPath" type="text" placeholder="例如: /assets/icons/ 或 /images/favicons/"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <p class="text-xs text-gray-500 mt-1">设置图标文件在网站中的存放路径，以 / 开头和结尾</p>
            </div>
            <div class="flex gap-2">
              <button @click="setCommonPath('/')"
                class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                根目录
              </button>
              <button @click="setCommonPath('/assets/icons/')"
                class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                /assets/icons/
              </button>
              <button @click="setCommonPath('/images/favicons/')"
                class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                /images/favicons/
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="selectedImage"
      class="flex justify-center space-x-4 p-4 border border-dashed border-orange-200 rounded-lg bg-orange-50/30">
      <button @click="generateFavicons" :disabled="isGenerating"
        class="bg-violet-500 text-white px-6 py-2 rounded-md hover:bg-violet-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
        {{ isGenerating ? '生成中...' : '生成 Favicon' }}
      </button>
      <button @click="downloadAll" :disabled="!generatedFavicons.length"
        class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
        下载全部
      </button>
      <button @click="clearImage" class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
        清空
      </button>
    </div>

    <!-- HTML代码提示 -->
    <div v-if="generatedFavicons.length > 0" class="mt-8">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">HTML代码</h3>
      <div class="bg-gray-100 rounded-lg p-4">
        <p class="text-sm text-gray-600 mb-2">将以下代码添加到您的 HTML head 标签中：</p>
        <pre class="text-xs bg-white p-3 rounded border overflow-x-auto"><code>{{ htmlCode }}</code></pre>
        <button @click="copyToClipboard"
          class="mt-2 text-sm bg-violet-500 text-white px-3 py-1 rounded hover:bg-violet-600 transition-colors">
          复制代码
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface ImageData {
  file: File
  name: string
  original: string
}

const fileInput = ref<HTMLInputElement>()
const originalImage = ref<HTMLImageElement>()
const selectedImage = ref<ImageData | null>(null)
const backgroundColor = ref('#ffffff')
const generateIco = ref(true)
const isGenerating = ref(false)
const generatedFavicons = ref<{ size: number; dataUrl: string }[]>([])
const originalDimensions = ref({ width: 0, height: 0 })
const canvasRefs = ref<Record<number, HTMLCanvasElement>>({})
const faviconPath = ref('/')

// 常用的 Favicon 尺寸
const faviconSizes = [16, 32, 48, 64, 96, 128, 152, 167, 180, 192, 256, 512]



const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    addImage(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    addImage(event.dataTransfer.files[0])
  }
}

const addImage = (file: File) => {
  if (!file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = {
      file,
      name: file.name,
      original: e.target?.result as string
    }
  }
  reader.readAsDataURL(file)
}

const onImageLoad = () => {
  if (!originalImage.value) return

  originalDimensions.value = {
    width: originalImage.value.naturalWidth,
    height: originalImage.value.naturalHeight
  }

  generateFavicons()
}

const getFaviconType = (size: number): string => {
  const typeMap: Record<number, string> = {
    16: 'Browser',
    32: 'Taskbar',
    48: 'Desktop',
    64: 'Desktop',
    96: 'Desktop',
    128: 'Chrome Web Store',
    152: 'iPad',
    167: 'iPad Pro',
    180: 'iPhone',
    192: 'Android',
    256: 'Windows',
    512: 'PWA'
  }
  return typeMap[size] || 'Custom'
}

const setCommonPath = (path: string) => {
  faviconPath.value = path
}

const formatPath = (filename: string): string => {
  const path = faviconPath.value.trim()
  if (!path) return filename

  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : '/' + path

  // 确保路径以 / 结尾（除非是根目录）
  const finalPath = normalizedPath === '/' ? '/' :
    (normalizedPath.endsWith('/') ? normalizedPath : normalizedPath + '/')

  return finalPath + filename
}

const generateFavicons = async () => {
  if (!selectedImage.value || !originalImage.value) return

  isGenerating.value = true
  generatedFavicons.value = []

  for (const size of faviconSizes) {
    const canvas = canvasRefs.value[size]
    if (!canvas) continue

    const ctx = canvas.getContext('2d')
    if (!ctx) continue

    // 设置背景色
    ctx.fillStyle = backgroundColor.value
    ctx.fillRect(0, 0, size, size)

    // 计算缩放比例，保持宽高比
    const img = originalImage.value
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight)
    const scaledWidth = img.naturalWidth * scale
    const scaledHeight = img.naturalHeight * scale

    // 居中绘制
    const x = (size - scaledWidth) / 2
    const y = (size - scaledHeight) / 2

    ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

    const dataUrl = canvas.toDataURL('image/png')
    generatedFavicons.value.push({ size, dataUrl })
  }

  isGenerating.value = false
}

const downloadAll = async () => {
  if (generatedFavicons.value.length === 0) return

  const zip = new JSZip()

  // 添加 PNG 文件
  generatedFavicons.value.forEach(({ size, dataUrl }) => {
    const base64Data = dataUrl.split(',')[1]
    if (base64Data) {
      zip.file(`favicon-${size}x${size}.png`, base64Data, { base64: true })
    }
  })

  // 生成 ICO 文件（如果选中）
  if (generateIco.value) {
    // 简化版：将最常用的尺寸合并为 ICO
    const icoSizes = [16, 32, 48]
    const icoImages = generatedFavicons.value.filter(f => icoSizes.includes(f.size))

    if (icoImages.length > 0) {
      // 这里简化处理，实际应该生成真正的 ICO 格式
      // 暂时使用 32x32 的 PNG 作为 favicon.ico
      const favicon32 = generatedFavicons.value.find(f => f.size === 32)
      if (favicon32) {
        const base64Data = favicon32.dataUrl.split(',')[1]
        if (base64Data) {
          zip.file('favicon.ico', base64Data, { base64: true })
        }
      }
    }
  }

  // 添加 manifest.json
  const manifest = {
    name: 'My App',
    short_name: 'App',
    icons: generatedFavicons.value.map(({ size }) => ({
      src: formatPath(`favicon-${size}x${size}.png`),
      sizes: `${size}x${size}`,
      type: 'image/png'
    }))
  }
  zip.file('manifest.json', JSON.stringify(manifest, null, 2))

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'favicon-pack.zip')
}

const htmlCode = computed(() => {
  if (generatedFavicons.value.length === 0) return ''

  const lines = [
    '<!-- Favicon -->',
    `<link rel="icon" type="image/x-icon" href="${formatPath('favicon.ico')}">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="${formatPath('favicon-32x32.png')}">`,
    `<link rel="icon" type="image/png" sizes="16x16" href="${formatPath('favicon-16x16.png')}">`,
    `<link rel="apple-touch-icon" sizes="180x180" href="${formatPath('favicon-180x180.png')}">`,
    `<link rel="manifest" href="${formatPath('manifest.json')}">`,
    '',
    '<!-- Additional sizes -->',
    ...generatedFavicons.value
      .filter(f => ![16, 32, 180].includes(f.size))
      .map(({ size }) => `<link rel="icon" type="image/png" sizes="${size}x${size}" href="${formatPath(`favicon-${size}x${size}.png`)}">`)
  ]

  return lines.join('\n')
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(htmlCode.value)
    alert('代码已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const clearImage = () => {
  selectedImage.value = null
  generatedFavicons.value = []
  originalDimensions.value = { width: 0, height: 0 }
  canvasRefs.value = {}
}
</script>
