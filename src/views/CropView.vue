<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 功能区域添加虚线边框 -->
    <div class="bg-white rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-300">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">图片裁剪</h2>

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
            <label for="crop-file-input"
              class="mt-2 inline-block cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              选择文件
            </label>
            <input id="crop-file-input" ref="fileInput" type="file" accept="image/*" @change="handleFileSelect"
              class="sr-only" hidden />
          </div>
          <p class="text-sm text-gray-500">支持 PNG, JPG, JPEG, WebP 格式</p>
        </div>
      </div>
    </div>

    <!-- 裁剪设置 -->
    <div v-if="selectedImage" class="mb-8 p-4 border border-dashed border-green-200 rounded-lg bg-green-50/30">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">裁剪设置</h3>
      <div class="flex flex-col md:flex-row gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目标宽度 (px)</label>
          <input v-model.number="targetWidth" type="number" min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目标高度 (px)</label>
          <input v-model.number="targetHeight" type="number" min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div class="mt-4 flex items-center space-x-4">
        <button @click="setCommonSize('1:1')"
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
          1:1 正方形
        </button>
        <button @click="setCommonSize('4:3')"
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
          4:3
        </button>
        <button @click="setCommonSize('16:9')"
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
          16:9
        </button>
        <button @click="setCommonSize('3:4')"
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
          3:4 竖屏
        </button>
      </div>
    </div>

    <!-- 图片预览和裁剪 -->
    <div v-if="selectedImage" class="mb-8 p-4 border border-dashed border-purple-200 rounded-lg bg-purple-50/30">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">图片预览</h3>
      <div class="flex flex-col lg:flex-row gap-6">
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700 mb-2">原图</p>
          <div class="relative inline-block">
            <img ref="originalImage" :src="selectedImage.original" :alt="selectedImage.name"
              class="max-w-full max-h-96 object-contain rounded-md" @load="onImageLoad" />
          </div>
          <p class="text-xs text-gray-500 mt-2">{{ selectedImage.name }}</p>
          <p class="text-xs text-gray-500">
            {{ originalDimensions.width }} × {{ originalDimensions.height }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700 mb-2">裁剪预览</p>
          <canvas ref="previewCanvas" class="max-w-full max-h-96 object-contain rounded-md border mx-auto"></canvas>
          <p class="text-xs text-gray-500 mt-2">{{ targetWidth }} × {{ targetHeight }}</p>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="selectedImage"
      class="flex justify-center space-x-4 p-4 border border-dashed border-orange-200 rounded-lg bg-orange-50/30">
      <button @click="cropImage"
        class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
        裁剪图片
      </button>
      <button @click="downloadCropped" :disabled="!croppedImage"
        class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
        下载图片
      </button>
      <button @click="clearImage" class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
        清空
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

interface ImageData {
  file: File
  name: string
  original: string
}

const fileInput = ref<HTMLInputElement>()
const originalImage = ref<HTMLImageElement>()
const previewCanvas = ref<HTMLCanvasElement>()
const selectedImage = ref<ImageData | null>(null)
const croppedImage = ref<string>('')
const targetWidth = ref(400)
const targetHeight = ref(400)
const originalDimensions = ref({ width: 0, height: 0 })



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

  // 设置默认裁剪尺寸为原图尺寸的较小值
  const minDimension = Math.min(originalDimensions.value.width, originalDimensions.value.height)
  targetWidth.value = minDimension
  targetHeight.value = minDimension

  cropImage()
}

const setCommonSize = (ratio: string) => {
  const baseSize = Math.min(originalDimensions.value.width, originalDimensions.value.height)

  switch (ratio) {
    case '1:1':
      targetWidth.value = baseSize
      targetHeight.value = baseSize
      break
    case '4:3':
      targetWidth.value = Math.min(baseSize, Math.floor(baseSize * 4 / 3))
      targetHeight.value = Math.floor(targetWidth.value * 3 / 4)
      break
    case '16:9':
      targetWidth.value = Math.min(originalDimensions.value.width, Math.floor(baseSize * 16 / 9))
      targetHeight.value = Math.floor(targetWidth.value * 9 / 16)
      break
    case '3:4':
      targetHeight.value = Math.min(originalDimensions.value.height, Math.floor(baseSize * 4 / 3))
      targetWidth.value = Math.floor(targetHeight.value * 3 / 4)
      break
  }
}

const cropImage = async () => {
  if (!selectedImage.value || !previewCanvas.value || !originalImage.value) return

  await nextTick()

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = targetWidth.value
  canvas.height = targetHeight.value

  const img = originalImage.value

  // 计算裁剪区域（居中裁剪）
  const sourceWidth = originalDimensions.value.width
  const sourceHeight = originalDimensions.value.height
  const targetRatio = targetWidth.value / targetHeight.value
  const sourceRatio = sourceWidth / sourceHeight

  let sx, sy, swidth, sheight

  if (sourceRatio > targetRatio) {
    // 原图更宽，以高度为准
    sheight = sourceHeight
    swidth = sheight * targetRatio
    sx = (sourceWidth - swidth) / 2
    sy = 0
  } else {
    // 原图更高，以宽度为准
    swidth = sourceWidth
    sheight = swidth / targetRatio
    sx = 0
    sy = (sourceHeight - sheight) / 2
  }

  ctx.drawImage(img, sx, sy, swidth, sheight, 0, 0, targetWidth.value, targetHeight.value)

  croppedImage.value = canvas.toDataURL('image/png')
}

const downloadCropped = () => {
  if (!croppedImage.value || !selectedImage.value) return

  const link = document.createElement('a')
  link.download = `cropped_${selectedImage.value.name.split('.')[0]}.png`
  link.href = croppedImage.value
  link.click()
}

const clearImage = () => {
  selectedImage.value = null
  croppedImage.value = ''
  originalDimensions.value = { width: 0, height: 0 }
}

// 监听尺寸变化，实时更新预览
watch([targetWidth, targetHeight], () => {
  if (selectedImage.value) {
    cropImage()
  }
})
</script>
