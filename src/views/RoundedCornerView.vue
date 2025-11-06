<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 功能区域添加虚线边框 -->
    <div class="rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-300">
      <h2 class="text-3xl font-bold mb-6 text-purple-900">圆角图片处理</h2>

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
            <label for="rounded-file-input"
              class="mt-2 inline-block cursor-pointer bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition-colors">
              选择文件
            </label>
            <input id="rounded-file-input" ref="fileInput" type="file" multiple accept="image/*"
              @change="handleFileSelect" class="sr-only" hidden />
          </div>
          <p class="text-sm text-gray-500">支持 PNG, JPG, JPEG, WebP 格式</p>
        </div>
      </div>

      <!-- 圆角设置 -->
      <div v-if="selectedImages.length > 0"
        class="mb-8 p-4 border border-dashed border-green-200 rounded-lg bg-green-50/30">
        <h3 class="text-xl font-semibold text-purple-900 mb-4">圆角设置</h3>
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700">圆角半径:</label>
          <input v-model="borderRadius" type="range" min="0" max="50"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          <span class="text-sm font-medium text-purple-900 w-12">{{ borderRadius }}px</span>
        </div>
      </div>

      <!-- 图片预览 -->
      <div v-if="selectedImages.length > 0"
        class="mb-8 p-4 border border-dashed border-purple-200 rounded-lg bg-purple-50/30">
        <h3 class="text-xl font-semibold text-purple-900 mb-4">图片预览</h3>
        <div class="flex flex-wrap gap-6">
          <div v-for="(image, index) in selectedImages" :key="index" class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-4">
              <div class="text-center">
                <p class="text-sm font-medium text-gray-700 mb-2">原图</p>
                <img :src="image.original" :alt="`原图 ${index + 1}`" class="max-w-full h-32 object-cover mx-auto" />
              </div>
              <div class="text-center">
                <p class="text-sm font-medium text-gray-700 mb-2">圆角处理后</p>
                <canvas :ref="(el) => { if (el) canvasRefs[index] = el as HTMLCanvasElement }"
                  class="max-w-full h-32 object-cover rounded-md mx-auto border"></canvas>
              </div>
              <p class="text-xs text-gray-500 text-center">{{ image.name }}</p>
              <div class="text-center mt-2">
                <button v-if="processedImages[index]" @click="downloadSingle(index)"
                  class="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors">
                  下载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量操作按钮 -->
      <div v-if="selectedImages.length > 0"
        class="p-4 border border-dashed border-orange-200 rounded-lg bg-orange-50/30">
        <div class="flex flex-col space-y-4">
          <div class="flex justify-center space-x-4">
            <button @click="processImages"
              class="bg-violet-500 text-white px-6 py-2 rounded-md hover:bg-violet-600 transition-colors">
              处理图片
            </button>
            <button @click="clearImages"
              class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
              清空
            </button>
          </div>
          
          <!-- 下载选项 -->
          <div v-if="processedImages.filter(Boolean).length > 0" class="border-t pt-4">
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
              
              <button @click="handleDownload" :disabled="processedImages.filter(Boolean).length === 0"
                class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                {{ downloadMode === 'single' ? '下载全部单张' : '打包下载全部' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              单张下载：{{ processedImages.filter(Boolean).length }} 张图片分别下载 \
              打包下载：所有图片压缩为一个 zip 文件
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface ImageData {
  file: File
  name: string
  original: string
}

const fileInput = ref<HTMLInputElement>()
const selectedImages = ref<ImageData[]>([])
const processedImages = ref<string[]>([])
const borderRadius = ref(20)
const canvasRefs = ref<HTMLCanvasElement[]>([])
const downloadMode = ref<'single' | 'zip'>('zip') // 默认打包下载

const handleDownload = async () => {
  const validImages = processedImages.value.filter(Boolean)
  if (validImages.length === 0) return

  if (downloadMode.value === 'single') {
    // 单张下载：分别下载每张图片
    processedImages.value.forEach((_, index) => {
      // 添加延迟以避免浏览器同时下载过多文件
      setTimeout(() => {
        downloadSingle(index)
      }, index * 300)
    })
  } else {
    // 打包下载
    const zip = new JSZip()

    processedImages.value.forEach((dataUrl, index) => {
      const image = selectedImages.value[index]
      if (dataUrl && image) {
        const base64Data = dataUrl.split(',')[1]
        const fileName = `rounded_${image.name.split('.')[0]}.png`
        if (base64Data) {
          zip.file(fileName, base64Data, { base64: true })
        }
      }
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'rounded_images.zip')
  }
}

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
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  imageFiles.forEach(file => {
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

const processImages = async () => {
  await nextTick()
  processedImages.value = []

  for (let i = 0; i < selectedImages.value.length; i++) {
    const canvas = canvasRefs.value[i]
    if (!canvas) continue

    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height

      // 创建圆角矩形路径
      ctx.beginPath()
      ctx.roundRect(0, 0, img.width, img.height, borderRadius.value)
      ctx.clip()

      // 绘制图片
      ctx.drawImage(img, 0, 0, img.width, img.height)

      // 保存处理后的图片数据
      const processedDataUrl = canvas.toDataURL('image/png')
      processedImages.value[i] = processedDataUrl
    }
    const currentImage = selectedImages.value[i]
    if (currentImage) {
      img.src = currentImage.original
    }
  }
}

const downloadSingle = (index: number) => {
  const processedImage = processedImages.value[index]
  const originalImage = selectedImages.value[index]

  if (processedImage && originalImage) {
    const link = document.createElement('a')
    link.download = `rounded_${originalImage.name.split('.')[0]}.png`
    link.href = processedImage
    link.click()
  }
}

const downloadAll = async () => {
  if (processedImages.value.length === 0) return

  if (processedImages.value.length === 1) {
    // 单个文件直接下载
    const link = document.createElement('a')
    const firstImage = selectedImages.value[0]
    const firstProcessed = processedImages.value[0]
    if (firstImage && firstProcessed) {
      link.download = `rounded_${firstImage.name.split('.')[0]}.png`
      link.href = firstProcessed
      link.click()
    }
  } else {
    // 多个文件打包下载
    const zip = new JSZip()

    processedImages.value.forEach((dataUrl, index) => {
      const image = selectedImages.value[index]
      if (dataUrl && image) {
        const base64Data = dataUrl.split(',')[1]
        const fileName = `rounded_${image.name.split('.')[0]}.png`
        if (base64Data) {
          zip.file(fileName, base64Data, { base64: true })
        }
      }
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'rounded_images.zip')
  }
}

const clearImages = () => {
  selectedImages.value = []
  processedImages.value = []
}

// 监听圆角半径变化，实时更新预览
watch(borderRadius, () => {
  if (selectedImages.value.length > 0) {
    processImages()
  }
})
</script>
