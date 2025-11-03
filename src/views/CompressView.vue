<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 功能区域添加虚线边框 -->
    <div class="rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-300">
      <h2 class="text-3xl font-bold text-purple-900 mb-6">图片压缩</h2>

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
            <label for="compress-file-input"
              class="mt-2 inline-block cursor-pointer bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition-colors">
              选择文件
            </label>
            <input id="compress-file-input" ref="fileInput" type="file" multiple accept="image/*"
              @change="handleFileSelect" class="sr-only" hidden />
          </div>
          <p class="text-sm text-gray-500">支持 PNG, JPG, JPEG, WebP, BMP, GIF 格式</p>
        </div>
      </div>
    </div>

    <!-- 压缩设置 -->
    <div v-if="selectedImages.length > 0"
      class="mb-8 p-4 border border-dashed border-green-200 rounded-lg bg-green-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">压缩设置</h3>
      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            压缩质量 ({{ quality }}%)
          </label>
          <input v-model="quality" type="range" min="10" max="100"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>最小文件</span>
            <span>最佳质量</span>
          </div>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">最大宽度</label>
          <div class="flex items-center gap-2">
            <input v-model="maxWidth" type="number" min="100" max="5000" step="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <span class="text-gray-500">px</span>
          </div>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
          <select v-model="outputFormat"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="original">保持原格式</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>
      <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p class="text-sm text-yellow-800">
          <strong>提示：</strong> WebP 格式通常能提供更好的压缩效果，但兼容性稍差。JPEG 适合照片类图片，PNG 适合需要透明背景的图片。
        </p>
      </div>
    </div>

    <!-- 图片列表 -->
    <div v-if="selectedImages.length > 0"
      class="mb-8 p-4 border border-dashed border-purple-200 rounded-lg bg-purple-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">图片列表</h3>
      <div class="space-y-4">
        <div v-for="(image, index) in selectedImages" :key="index"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <img :src="image.original" :alt="image.name" class="w-16 h-16 object-cover rounded-md" />
            <div class="flex-1">
              <p class="font-medium text-purple-900">{{ image.name }}</p>
              <p class="text-sm text-gray-500">
                原尺寸: {{ image.originalWidth }}×{{ image.originalHeight }}px
              </p>
              <p class="text-xs text-gray-400">原大小: {{ formatFileSize(image.originalSize) }}</p>
              <div v-if="compressedImages[index]" class="mt-1">
                <p class="text-xs text-green-600">
                  压缩后: {{ formatFileSize(compressedImages[index].size) }}
                  ({{ calculateCompressionRate(image.originalSize, compressedImages[index].size) }}%)
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span v-if="compressedImages[index]" class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              已压缩
            </span>
            <button @click="removeImage(index)" class="p-1 text-red-600 hover:text-red-800 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="selectedImages.length > 0"
      class="flex justify-center space-x-4 p-4 border border-dashed border-orange-200 rounded-lg bg-orange-50/30">
      <button @click="compressImages" :disabled="isCompressing"
        class="bg-violet-500 text-white px-6 py-2 rounded-md hover:bg-violet-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
        {{ isCompressing ? '压缩中...' : '开始压缩' }}
      </button>
      <button @click="downloadAll" :disabled="compressedImages.filter(Boolean).length === 0"
        class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
        下载全部
      </button>
      <button @click="clearImages"
        class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
        清空
      </button>
    </div>

    <!-- 压缩统计 -->
    <div v-if="compressedImages.filter(Boolean).length > 0"
      class="mt-8 p-4 border border-dashed border-blue-200 rounded-lg bg-blue-50/30">
      <h3 class="text-xl font-semibold text-purple-900 mb-4">压缩统计</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-white rounded-lg shadow-sm">
          <p class="text-2xl font-bold text-purple-900">{{ compressedImages.filter(Boolean).length }}</p>
          <p class="text-sm text-gray-600">已压缩图片</p>
        </div>
        <div class="text-center p-4 bg-white rounded-lg shadow-sm">
          <p class="text-2xl font-bold text-green-600">{{ calculateTotalCompressionRate() }}%</p>
          <p class="text-sm text-gray-600">平均压缩率</p>
        </div>
        <div class="text-center p-4 bg-white rounded-lg shadow-sm">
          <p class="text-2xl font-bold text-blue-600">{{ formatFileSize(calculateTotalSizeSaved()) }}</p>
          <p class="text-sm text-gray-600">总节省空间</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface ImageData {
  file: File
  name: string
  original: string
  originalWidth: number
  originalHeight: number
  originalSize: number
}

interface CompressedImage {
  dataUrl: string
  size: number
  width: number
  height: number
}

const fileInput = ref<HTMLInputElement>()
const selectedImages = ref<ImageData[]>([])
const compressedImages = ref<CompressedImage[]>([])
const quality = ref(80)
const maxWidth = ref(1920)
const outputFormat = ref<'original' | 'jpeg' | 'webp' | 'png'>('original')
const isCompressing = ref(false)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addImages(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    addImages(Array.from(event.dataTransfer.files))
  }
}

const addImages = async (files: File[]) => {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  for (const file of imageFiles) {
    const imageData = await loadImageData(file)
    selectedImages.value.push(imageData)
  }
}

const loadImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          file,
          name: file.name,
          original: e.target?.result as string,
          originalWidth: img.width,
          originalHeight: img.height,
          originalSize: file.size
        })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
  compressedImages.value.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const calculateCompressionRate = (originalSize: number, compressedSize: number): number => {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

const compressImages = async () => {
  if (selectedImages.value.length === 0) return

  isCompressing.value = true
  compressedImages.value = []

  for (let i = 0; i < selectedImages.value.length; i++) {
    const image = selectedImages.value[i]
    if (image) {
      const compressedImage = await compressImage(image)
      compressedImages.value[i] = compressedImage
    }
  }

  isCompressing.value = false
}

const compressImage = (imageData: ImageData): Promise<CompressedImage> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve({
          dataUrl: '',
          size: 0,
          width: 0,
          height: 0
        })
        return
      }

      // 计算新尺寸
      let newWidth = img.width
      let newHeight = img.height
      
      if (img.width > maxWidth.value) {
        newWidth = maxWidth.value
        newHeight = (img.height * maxWidth.value) / img.width
      }

      canvas.width = newWidth
      canvas.height = newHeight

      // 设置画布质量
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      // 确定输出格式
      let mimeType = imageData.file.type
      if (outputFormat.value !== 'original') {
        mimeType = `image/${outputFormat.value}`
      }

      // 如果是 JPEG，需要设置白色背景
      if (mimeType === 'image/jpeg') {
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCanvas.width = newWidth
          tempCanvas.height = newHeight
          tempCtx.fillStyle = '#ffffff'
          tempCtx.fillRect(0, 0, newWidth, newHeight)
          tempCtx.drawImage(canvas, 0, 0)
          canvas.width = newWidth
          canvas.height = newHeight
          ctx.drawImage(tempCanvas, 0, 0)
        }
      }

      // 获取压缩后的数据
      const qualityValue = quality.value / 100
      const dataUrl = canvas.toDataURL(mimeType, qualityValue)
      
      // 计算压缩后的大小
      const size = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75)

      resolve({
        dataUrl,
        size,
        width: newWidth,
        height: newHeight
      })
    }
    img.onerror = () => resolve({
      dataUrl: '',
      size: 0,
      width: 0,
      height: 0
    })
    img.src = imageData.original
  })
}

const calculateTotalCompressionRate = (): number => {
  const validImages = compressedImages.value.filter(Boolean)
  if (validImages.length === 0) return 0

  let totalRate = 0
  validImages.forEach((compressed, index) => {
    const original = selectedImages.value[index]
    if (original) {
      totalRate += calculateCompressionRate(original.originalSize, compressed.size)
    }
  })

  return Math.round(totalRate / validImages.length)
}

const calculateTotalSizeSaved = (): number => {
  let totalSaved = 0
  compressedImages.value.forEach((compressed, index) => {
    const original = selectedImages.value[index]
    if (original && compressed) {
      totalSaved += (original.originalSize - compressed.size)
    }
  })

  return totalSaved
}

const downloadAll = async () => {
  const validImages = compressedImages.value.filter(Boolean)
  if (validImages.length === 0) return

  if (validImages.length === 1) {
    // 单个文件直接下载
    const index = compressedImages.value.findIndex(Boolean)
    const link = document.createElement('a')
    const image = selectedImages.value[index]
    const compressedImage = compressedImages.value[index]
    if (image && compressedImage) {
      const originalName = image.name.split('.')[0]
      const format = outputFormat.value === 'original' 
        ? getFileExtension(image.file.type) 
        : outputFormat.value
      link.download = `${originalName}_compressed.${format}`
      link.href = compressedImage.dataUrl
      link.click()
    }
  } else {
    // 多个文件打包下载
    const zip = new JSZip()

    compressedImages.value.forEach((compressed, index) => {
      const image = selectedImages.value[index]
      if (compressed && image) {
        const base64Data = compressed.dataUrl.split(',')[1]
        const originalName = image.name.split('.')[0]
        const format = outputFormat.value === 'original' 
          ? getFileExtension(image.file.type) 
          : outputFormat.value
        const fileName = `${originalName}_compressed.${format}`
        if (base64Data) {
          zip.file(fileName, base64Data, { base64: true })
        }
      }
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'compressed_images.zip')
  }
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

const clearImages = () => {
  selectedImages.value = []
  compressedImages.value = []
}
</script>