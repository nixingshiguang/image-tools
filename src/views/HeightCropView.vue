<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 功能区域添加虚线边框 -->
    <div class="rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-300">
      <h2 class="text-3xl font-bold text-purple-900 mb-6">等高裁剪</h2>

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
            <label for="height-crop-file-input"
              class="mt-2 inline-block cursor-pointer bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition-colors">
              选择文件
            </label>
            <input id="height-crop-file-input" ref="fileInput" type="file" accept="image/*" @change="handleFileSelect"
              class="sr-only" hidden />
          </div>
          <p class="text-sm text-gray-500">支持 PNG, JPG, JPEG, WebP, BMP, GIF 格式</p>
        </div>
      </div>
    </div>

    <!-- 裁剪设置 -->
    <div v-if="selectedImage" class="mb-8 p-4 border border-dashed border-green-200 rounded-lg bg-green-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">裁剪设置</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">裁剪模式</label>
          <select v-model="cropMode"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="equal">等分裁剪</option>
            <option value="custom">自定义高度</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
          <select v-model="outputFormat"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="original">保持原格式</option>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>
      
      <!-- 等分模式设置 -->
      <div v-if="cropMode === 'equal'" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">高度等分数</label>
        <select v-model="cropCount"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="2">2 等分</option>
          <option value="3">3 等分</option>
          <option value="4">4 等分</option>
          <option value="5">5 等分</option>
          <option value="6">6 等分</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">将图片高度分成 {{ cropCount }} 等份，每份高度: {{ Math.floor(originalDimensions.height / cropCount) }}px</p>
        
        <!-- 等分详细参考信息 -->
        <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm text-blue-800 font-medium mb-2">等分详细分析:</p>
          <div class="text-xs text-blue-700 space-y-1">
            <div>• 原图总高度: {{ originalDimensions.height }}px</div>
            <div>• 等分数: {{ cropCount }} 份</div>
            <div>• 每份理论高度: {{ Math.floor(originalDimensions.height / cropCount) }}px</div>
            <div>• 剩余像素: {{ originalDimensions.height % cropCount }}px</div>
            <div v-if="originalDimensions.height % cropCount > 0" class="text-orange-600">
              • 注意: 有 {{ originalDimensions.height % cropCount }}px 无法均匀分配，最后一份会多出这部分像素
            </div>
            <div v-else class="text-green-600">
              • 可以完全均匀分配
            </div>
          </div>
        </div>
      </div>
      
      <!-- 自定义高度模式设置 -->
      <div v-if="cropMode === 'custom'" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">自定义高度设置</label>
        
        <!-- 均分参考信息 -->
        <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p class="text-sm text-yellow-800 font-medium mb-2">均分参考值（方便微调）:</p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div class="bg-yellow-100 px-2 py-1 rounded">2等分: {{ Math.floor(originalDimensions.height / 2) }}px</div>
            <div class="bg-yellow-100 px-2 py-1 rounded">3等分: {{ Math.floor(originalDimensions.height / 3) }}px</div>
            <div class="bg-yellow-100 px-2 py-1 rounded">4等分: {{ Math.floor(originalDimensions.height / 4) }}px</div>
            <div class="bg-yellow-100 px-2 py-1 rounded">5等分: {{ Math.floor(originalDimensions.height / 5) }}px</div>
            <div class="bg-yellow-100 px-2 py-1 rounded">6等分: {{ Math.floor(originalDimensions.height / 6) }}px</div>
            <div class="bg-yellow-100 px-2 py-1 rounded">8等分: {{ Math.floor(originalDimensions.height / 8) }}px</div>
          </div>
        </div>
        
        <div class="space-y-3">
          <div v-for="(height, index) in customHeights" :key="index" class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-600 w-8">第{{ index + 1 }}部分</span>
            <input v-model.number="customHeights[index]" type="number" min="1" :max="originalDimensions.height"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="高度 (px)" />
            <button @click="removeCustomHeight(index)" v-if="customHeights.length > 1"
              class="px-3 py-2 text-red-600 hover:text-red-700 transition-colors">
              删除
            </button>
          </div>
          <button @click="addCustomHeight"
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            + 添加部分
          </button>
          <div class="text-sm text-gray-600">
            <p>当前总高度: {{ customHeights.reduce((sum, h) => sum + h, 0) }}px</p>
            <p :class="['mt-1', totalHeightStatus === 'ok' ? 'text-green-600' : 'text-red-600']">
              {{ heightStatusMessage }}
            </p>
          </div>
        </div>
      </div>
      <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p class="text-sm text-blue-800" v-if="cropMode === 'equal'">
          <strong>提示：</strong> 图片将被按高度平均分成 {{ cropCount }} 等份，每份宽度保持不变，高度为原高度的 1/{{ cropCount }}。
        </p>
        <p class="text-sm text-blue-800" v-if="cropMode === 'custom'">
          <strong>提示：</strong> 可自定义每个部分的高度，确保总高度不超过原图高度。当前原图高度: {{ originalDimensions.height }}px。
        </p>
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="selectedImage" class="mb-8 p-4 border border-dashed border-purple-200 rounded-lg bg-purple-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">图片预览</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700 mb-2">原图</p>
          <div class="relative inline-block">
            <img ref="originalImage" :src="selectedImage.original" :alt="selectedImage.name"
              class="max-w-full max-h-96 object-contain rounded-md" @load="onImageLoad" />
          </div>
          <p class="text-xs text-gray-500 mt-2">{{ selectedImage.name }}</p>
          <p class="text-xs text-gray-500">
            {{ originalDimensions.width }} × {{ originalDimensions.height }} px
          </p>
          <p class="text-xs text-gray-500">{{ formatFileSize(selectedImage.originalSize) }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700 mb-2">裁剪预览</p>
          <div class="space-y-2">
            <div v-for="(part, index) in cropPreviewParts" :key="index"
              class="border border-gray-300 rounded-md p-2 bg-white">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-700">第 {{ index + 1 }} 部分</span>
                <span class="text-xs text-gray-500">{{ part.width }} × {{ part.height }} px</span>
              </div>
              <div class="w-full h-32 flex items-center justify-center bg-gray-100 rounded border">
                <canvas :ref="el => setPreviewCanvas(el, index)" class="max-w-full max-h-full object-contain"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 裁剪结果 -->
    <div v-if="croppedParts.length > 0" class="mb-8 p-4 border border-dashed border-orange-200 rounded-lg bg-orange-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">裁剪结果</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(part, index) in croppedParts" :key="index"
          class="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
          <div class="text-center">
            <img :src="part.dataUrl" :alt="`裁剪部分 ${index + 1}`"
              class="w-full h-32 object-contain rounded mb-2" />
            <p class="text-sm font-medium text-gray-700">{{ part.name }}</p>
            <p class="text-xs text-gray-500">{{ part.width }} × {{ part.height }} px</p>
            <p class="text-xs text-gray-400">{{ formatFileSize(part.size) }}</p>
            <button @click="downloadSingle(index)" 
              class="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors">
              下载单张
            </button>
          </div>
        </div>
      </div>
      <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p class="text-sm text-green-800">
          <strong>裁剪完成：</strong> 图片已被成功分为 {{ croppedParts.length }} 个部分
        </p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="selectedImage"
      class="p-4 border border-dashed border-orange-200 rounded-lg bg-orange-50/30">
      <div class="flex flex-col space-y-4">
        <div class="flex justify-center space-x-4">
          <button @click="cropImage" :disabled="isCropping"
            class="bg-violet-500 text-white px-6 py-2 rounded-md hover:bg-violet-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            {{ isCropping ? '裁剪中...' : '开始裁剪' }}
          </button>
          <button @click="clearImage"
            class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
            清空
          </button>
        </div>
        
        <!-- 下载选项 -->
        <div v-if="croppedParts.length > 0" class="border-t pt-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center space-x-4">
              <span class="text-sm font-medium text-gray-700">下载方式：</span>
              <div class="flex space-x-2">
                <label class="inline-flex items-center">
                  <input v-model="downloadMode" type="radio" value="single" class="mr-2" />
                  <span class="text-sm">单张下载</span>
                </label>
                <label class="inline-flex items-center">
                  <input v-model="downloadMode" type="radio" value="zip" class="mr-2" />
                  <span class="text-sm">打包下载</span>
                </label>
              </div>
            </div>
            
            <button @click="handleDownload" :disabled="croppedParts.length === 0"
              class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              {{ downloadMode === 'single' ? '下载全部单张' : '打包下载全部' }}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            单张下载：{{ croppedParts.length }} 张图片分别下载 \
            打包下载：所有图片压缩为一个 zip 文件
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface ImageData {
  file: File
  name: string
  original: string
  originalSize: number
}

interface CropPart {
  dataUrl: string
  name: string
  width: number
  height: number
  size: number
}

interface PreviewPart {
  width: number
  height: number
}

const fileInput = ref<HTMLInputElement>()
const originalImage = ref<HTMLImageElement>()
const selectedImage = ref<ImageData | null>(null)
const croppedParts = ref<CropPart[]>([])
const cropPreviewParts = ref<PreviewPart[]>([])
const cropCount = ref(2)
const cropMode = ref<'equal' | 'custom'>('equal')
const outputFormat = ref<'original' | 'png' | 'jpeg' | 'webp'>('original')
const isCropping = ref(false)
const originalDimensions = ref({ width: 0, height: 0 })
const previewCanvases = ref<HTMLCanvasElement[]>([])
const customHeights = ref<number[]>([100, 100])
const downloadMode = ref<'single' | 'zip'>('zip') // 默认打包下载

const downloadSingle = (index: number) => {
  const part = croppedParts.value[index]
  if (!part) return
  
  const link = document.createElement('a')
  link.download = part.name
  link.href = part.dataUrl
  link.click()
}

const handleDownload = async () => {
  if (downloadMode.value === 'single') {
    // 单张下载：分别下载每张图片
    croppedParts.value.forEach((_, index) => {
      // 添加延迟以避免浏览器同时下载过多文件
      setTimeout(() => {
        downloadSingle(index)
      }, index * 300)
    })
  } else {
    // 打包下载
    const zip = new JSZip()

    croppedParts.value.forEach((part) => {
      if (!part) return
      const base64Data = part.dataUrl.split(',')[1]
      if (base64Data) {
        zip.file(part.name, base64Data, { base64: true })
      }
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${selectedImage.value?.name.split('.')[0] || 'height_cropped'}_parts.zip`)
  }
}

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
      original: e.target?.result as string,
      originalSize: file.size
    }
  }
  reader.readAsDataURL(file)
}

const onImageLoad = async () => {
  if (!originalImage.value) return

  originalDimensions.value = {
    width: originalImage.value.naturalWidth,
    height: originalImage.value.naturalHeight
  }

  // 计算预览部分信息
  updatePreviewParts()

  // 更新预览画布
  await nextTick()
  updatePreviewImages()
}



const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}



const getFileExtension = (mimeType: string): string => {
  const extensionMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp'
  }
  return extensionMap[mimeType] || 'jpg'
}

const downloadAll = async () => {
  if (croppedParts.value.length === 0) return

  if (croppedParts.value.length === 1) {
    // 单个文件直接下载
    const firstPart = croppedParts.value[0]
    if (!firstPart) return
    
    const link = document.createElement('a')
    link.download = firstPart.name
    link.href = firstPart.dataUrl
    link.click()
  } else {
    // 多个文件打包下载
    const zip = new JSZip()

    croppedParts.value.forEach((part) => {
      if (!part) return
      const base64Data = part.dataUrl.split(',')[1]
      if (base64Data) {
        zip.file(part.name, base64Data, { base64: true })
      }
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${selectedImage.value?.name.split('.')[0] || 'height_cropped'}_parts.zip`)
  }
}

const clearImage = () => {
  selectedImage.value = null
  croppedParts.value = []
  cropPreviewParts.value = []
  originalDimensions.value = { width: 0, height: 0 }
}

const setPreviewCanvas = (el: HTMLCanvasElement | null, index: number) => {
  if (el) {
    previewCanvases.value[index] = el
  }
}

const updatePreviewImages = () => {
  if (!selectedImage.value || !originalImage.value) return

  const img = originalImage.value
  
  if (cropMode.value === 'equal') {
    // 等分模式
    const partHeight = Math.floor(img.naturalHeight / cropCount.value)
    
    previewCanvases.value.forEach((canvas, index) => {
      if (!canvas || index >= cropCount.value) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 设置画布尺寸
      canvas.width = img.naturalWidth
      canvas.height = partHeight

      // 计算裁剪区域
      const sourceX = 0
      const sourceY = index * partHeight
      const sourceWidth = img.naturalWidth
      const sourceHeight = partHeight

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制预览图像
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    })
  } else if (cropMode.value === 'custom') {
    // 自定义高度模式
    let currentY = 0
    
    previewCanvases.value.forEach((canvas, index) => {
      if (!canvas || index >= customHeights.value.length) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 获取当前部分的高度
      const height = Math.min(customHeights.value[index], img.naturalHeight - currentY)
      
      // 设置画布尺寸
      canvas.width = img.naturalWidth
      canvas.height = height

      // 计算裁剪区域
      const sourceX = 0
      const sourceY = currentY
      const sourceWidth = img.naturalWidth
      const sourceHeight = height

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制预览图像
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
      
      // 更新当前位置
      currentY += height
    })
  }
}

// 监听裁剪数量变化，更新预览
watch(cropCount, () => {
  if (selectedImage.value) {
    updatePreviewParts()
    nextTick().then(() => {
      updatePreviewImages()
    })
  }
})

// 监听图片加载完成，更新预览
watch(originalImage, () => {
  if (originalImage.value && selectedImage.value) {
    nextTick().then(() => {
      updatePreviewImages()
    })
  }
}, { deep: true })

// 自定义高度模式相关函数
const addCustomHeight = () => {
  customHeights.value.push(100)
}

const removeCustomHeight = (index: number) => {
  if (customHeights.value.length > 1) {
    customHeights.value.splice(index, 1)
  }
}

// 计算总高度状态
const totalHeightStatus = computed(() => {
  const totalHeight = customHeights.value.reduce((sum, h) => sum + h, 0)
  if (totalHeight > originalDimensions.value.height) {
    return 'exceed'
  } else if (totalHeight < originalDimensions.value.height) {
    return 'less'
  } else {
    return 'ok'
  }
})

const heightStatusMessage = computed(() => {
  const totalHeight = customHeights.value.reduce((sum, h) => sum + h, 0)
  const diff = Math.abs(totalHeight - originalDimensions.value.height)
  
  if (totalHeightStatus.value === 'exceed') {
    return `总高度超出原图 ${diff}px，裁剪将只保留原图范围内的部分`
  } else if (totalHeightStatus.value === 'less') {
    return `总高度不足原图 ${diff}px，裁剪后底部将保留空白`
  } else {
    return '总高度与原图完全匹配'
  }
})

// 监听裁剪模式变化，重置预览
watch(cropMode, (newMode) => {
  if (selectedImage.value && newMode === 'custom') {
    // 切换到自定义模式时，根据原图高度设置默认高度
    const defaultHeight = Math.floor(originalDimensions.value.height / 2)
    customHeights.value = [defaultHeight, defaultHeight]
    updatePreviewParts()
  } else if (selectedImage.value && newMode === 'equal') {
    updatePreviewParts()
    nextTick().then(() => {
      updatePreviewImages()
    })
  }
})

// 监听自定义高度变化，更新预览
watch(customHeights, () => {
  if (cropMode.value === 'custom' && selectedImage.value) {
    updatePreviewParts()
    nextTick().then(() => {
      updatePreviewImages()
    })
  }
}, { deep: true })

// 修改预览更新函数以支持自定义高度
const updatePreviewParts = () => {
  cropPreviewParts.value = []
  
  if (cropMode.value === 'equal') {
    const partHeight = Math.floor(originalDimensions.value.height / cropCount.value)
    for (let i = 0; i < cropCount.value; i++) {
      cropPreviewParts.value.push({
        width: originalDimensions.value.width,
        height: partHeight
      })
    }
  } else if (cropMode.value === 'custom') {
    let currentY = 0
    for (let i = 0; i < customHeights.value.length; i++) {
      const height = customHeights.value[i]
      cropPreviewParts.value.push({
        width: originalDimensions.value.width,
        height: Math.min(height, originalDimensions.value.height - currentY)
      })
      currentY += height
    }
  }
}



// 修改裁剪函数以支持自定义高度和等分模式
const cropImage = async () => {
  if (!selectedImage.value || !originalImage.value) return

  isCropping.value = true
  croppedParts.value = []

  await nextTick()

  const img = originalImage.value
  
  let parts: { startY: number; height: number }[] = []
  
  if (cropMode.value === 'equal') {
    const partHeight = Math.floor(img.naturalHeight / cropCount.value)
    for (let i = 0; i < cropCount.value; i++) {
      parts.push({ startY: i * partHeight, height: partHeight })
    }
  } else if (cropMode.value === 'custom') {
    let currentY = 0
    for (let i = 0; i < customHeights.value.length; i++) {
      const height = Math.min(customHeights.value[i], img.naturalHeight - currentY)
      parts.push({ startY: currentY, height: height })
      currentY += height
    }
  }

  for (let i = 0; i < parts.length; i++) {
    const { startY, height } = parts[i]
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) continue

    // 设置画布尺寸
    canvas.width = img.naturalWidth
    canvas.height = height

    // 裁剪图片
    ctx.drawImage(img, 0, startY, img.naturalWidth, height, 0, 0, canvas.width, canvas.height)

    // 确定输出格式
    let mimeType = selectedImage.value.file.type
    if (outputFormat.value !== 'original') {
      mimeType = `image/${outputFormat.value}`
    }

    // 如果是 JPEG，需要设置白色背景
    if (mimeType === 'image/jpeg') {
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        tempCtx.fillStyle = '#ffffff'
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        tempCtx.drawImage(canvas, 0, 0)
        canvas.width = tempCanvas.width
        canvas.height = tempCanvas.height
        ctx.drawImage(tempCanvas, 0, 0)
      }
    }

    // 获取裁剪后的数据
    const dataUrl = canvas.toDataURL(mimeType, 0.92)
    const size = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75)

    // 添加到结果列表
    croppedParts.value.push({
      dataUrl,
      name: `${selectedImage.value.name.split('.')[0]}_part${i + 1}.${getFileExtension(mimeType)}`,
      width: canvas.width,
      height: canvas.height,
      size
    })
  }

  isCropping.value = false
}
</script>