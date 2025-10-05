<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 功能区域添加虚线边框 -->
    <div class="bg-white rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-300">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">图片格式转换</h2>

      <!-- 上传区域 -->
      <div @drop="handleDrop" @dragover.prevent @dragenter.prevent
        class="mb-8 p-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/30 text-center hover:border-indigo-500 transition-colors">
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
            <label for="convert-file-input"
              class="mt-2 inline-block cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              选择文件
            </label>
            <input id="convert-file-input" ref="fileInput" type="file" multiple accept="image/*"
              @change="handleFileSelect" class="sr-only" hidden />
          </div>
          <p class="text-sm text-gray-500">支持 PNG, JPG, JPEG, WebP, BMP, GIF 格式</p>
        </div>
      </div>
    </div>

    <!-- 转换设置 -->
    <div v-if="selectedImages.length > 0"
      class="mb-8 p-4 border border-dashed border-green-200 rounded-lg bg-green-50/30">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">转换设置</h3>
      <div class="flex flex-col md:flex-row gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目标格式</label>
          <select v-model="targetFormat"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <div v-if="targetFormat === 'jpeg' || targetFormat === 'webp'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            质量 ({{ quality }}%)
          </label>
          <input v-model="quality" type="range" min="10" max="100"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">背景色 (PNG透明转换时)</label>
          <input v-model="backgroundColor" type="color"
            class="w-full h-10 border border-gray-300 rounded-md cursor-pointer" />
        </div>
      </div>
    </div>

    <!-- 图片列表 -->
    <div v-if="selectedImages.length > 0"
      class="mb-8 p-4 border border-dashed border-purple-200 rounded-lg bg-purple-50/30">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">图片列表</h3>
      <div class="space-y-4">
        <div v-for="(image, index) in selectedImages" :key="index"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <img :src="image.original" :alt="image.name" class="w-16 h-16 object-cover rounded-md" />
            <div>
              <p class="font-medium text-gray-900">{{ image.name }}</p>
              <p class="text-sm text-gray-500">
                {{ getFileFormat(image.file.type) }} → {{ targetFormat.toUpperCase() }}
              </p>
              <p class="text-xs text-gray-400">{{ formatFileSize(image.file.size) }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span v-if="convertedImages[index]" class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              已转换
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
      <button @click="convertImages" :disabled="isConverting"
        class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
        {{ isConverting ? '转换中...' : '开始转换' }}
      </button>
      <button @click="downloadAll" :disabled="convertedImages.filter(Boolean).length === 0"
        class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
        下载全部
      </button>
      <button @click="clearImages"
        class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
        清空
      </button>
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
}

const fileInput = ref<HTMLInputElement>()
const selectedImages = ref<ImageData[]>([])
const convertedImages = ref<string[]>([])
const targetFormat = ref<'png' | 'jpeg' | 'webp'>('png')
const quality = ref(90)
const backgroundColor = ref('#ffffff')
const isConverting = ref(false)


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

const addImages = (files: File[]) => {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  imageFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImages.value.push({
        file,
        name: file.name,
        original: e.target?.result as string
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
  convertedImages.value.splice(index, 1)
}

const getFileFormat = (mimeType: string): string => {
  const formatMap: Record<string, string> = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPG',
    'image/webp': 'WebP',
    'image/gif': 'GIF',
    'image/bmp': 'BMP'
  }
  return formatMap[mimeType] || 'Unknown'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const convertImages = async () => {
  if (selectedImages.value.length === 0) return

  isConverting.value = true
  convertedImages.value = []

  for (let i = 0; i < selectedImages.value.length; i++) {
    const image = selectedImages.value[i]
    if (image) {
      const convertedDataUrl = await convertImage(image.original)
      convertedImages.value[i] = convertedDataUrl
    }
  }

  isConverting.value = false
}

const convertImage = (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve('')
        return
      }

      canvas.width = img.width
      canvas.height = img.height

      // 如果目标格式是 JPEG，需要设置背景色（因为 JPEG 不支持透明）
      if (targetFormat.value === 'jpeg') {
        ctx.fillStyle = backgroundColor.value
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)

      const mimeType = `image/${targetFormat.value}`
      const qualityValue = targetFormat.value === 'png' ? undefined : quality.value / 100

      const convertedDataUrl = canvas.toDataURL(mimeType, qualityValue)
      resolve(convertedDataUrl)
    }
    img.onerror = () => resolve('')
    img.src = imageDataUrl
  })
}

const downloadAll = async () => {
  const validImages = convertedImages.value.filter(Boolean)
  if (validImages.length === 0) return

  if (validImages.length === 1) {
    // 单个文件直接下载
    const index = convertedImages.value.findIndex(Boolean)
    const link = document.createElement('a')
    const image = selectedImages.value[index]
    const convertedImage = convertedImages.value[index]
    if (image && convertedImage) {
      const originalName = image.name.split('.')[0]
      link.download = `${originalName}.${targetFormat.value}`
      link.href = convertedImage
      link.click()
    }
  } else {
    // 多个文件打包下载
    const zip = new JSZip()

    convertedImages.value.forEach((dataUrl, index) => {
      const image = selectedImages.value[index]
      if (dataUrl && image) {
        const base64Data = dataUrl.split(',')[1]
        const originalName = image.name.split('.')[0]
        const fileName = `${originalName}.${targetFormat.value}`
        if (base64Data) {
          zip.file(fileName, base64Data, { base64: true })
        }
      }
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `converted_images_${targetFormat.value}.zip`)
  }
}

const clearImages = () => {
  selectedImages.value = []
  convertedImages.value = []
}
</script>
