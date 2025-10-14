<script setup lang="ts">
import CropperDemo from './CropperDemo.vue'

// Tabs
const tabs = ['Component', 'Composable', 'Directive']
const activeTab = ref('Component')

// Shared config
const aspectRatio = ref(NaN)
const viewMode = ref<0 | 1 | 2 | 3>(0)
const cropBoxStyle = ref<'default' | 'rounded' | 'circle' | 'minimal'>('default')

// Sample image
const sampleImageUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200'

// Component Demo
const cropperRef = ref()
const fileInput = ref()
const imageSrc = ref('')
const cropData = ref({})
const croppedImageUrl = ref('')

const onReady = () => {
  console.log('Component: Cropper ready')
}

const onCrop = (event: CustomEvent) => {
  cropData.value = event.detail
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      imageSrc.value = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const loadSampleImage = () => {
  imageSrc.value = sampleImageUrl
}

const rotateImage = () => {
  cropperRef.value?.getCropper()?.rotate(90)
}

const resetImage = () => {
  cropperRef.value?.getCropper()?.reset()
}

const getCroppedImage = () => {
  const canvas = cropperRef.value?.getCroppedCanvas()
  if (canvas) {
    croppedImageUrl.value = canvas.toDataURL()
  }
}

const downloadCropped = () => {
  if (croppedImageUrl.value) {
    const link = document.createElement('a')
    link.download = 'cropped-image.png'
    link.href = croppedImageUrl.value
    link.click()
  }
}

// Composable Demo
const composableContainer = ref<HTMLElement>()
const composableCropData = ref({})
const composableReady = ref(false)

const {
  isReady,
  cropData: hookCropData,
  rotate,
  reset,
  getCroppedCanvas,
  setCropBoxStyle
} = useCropper(composableContainer, {
  src: sampleImageUrl,
  aspectRatio: aspectRatio.value,
  viewMode: viewMode.value,
  toolbar: true,
  onReady: () => {
    console.log('Composable: Cropper ready')
    composableReady.value = true
  },
  onCrop: (data) => {
    composableCropData.value = data
  }
})

watch([aspectRatio, viewMode], () => {
  if (isReady.value) {
    reset()
  }
})

const composableRotate = () => rotate(90)
const composableReset = () => reset()
const composableGetCropped = () => {
  const canvas = getCroppedCanvas()
  if (canvas) {
    canvas.toBlob((blob) => {
      console.log('Got cropped blob:', blob)
    })
  }
}
const composableChangeStyle = () => {
  const styles = ['default', 'rounded', 'circle', 'minimal'] as const
  const currentIndex = styles.indexOf(cropBoxStyle.value)
  const nextStyle = styles[(currentIndex + 1) % styles.length]
  cropBoxStyle.value = nextStyle
  setCropBoxStyle(nextStyle)
}

// Directive Demo
const directiveElement = ref<HTMLElement>()
const directiveCropData = ref({})
const directiveCropper = ref<any>()

const directiveOptions = computed(() => ({
  src: sampleImageUrl,
  aspectRatio: aspectRatio.value,
  viewMode: viewMode.value,
  toolbar: true,
  cropBoxStyle: cropBoxStyle.value,
  onReady: (cropper: any) => {
    directiveCropper.value = cropper
    console.log('Directive: Cropper ready')
  },
  onCrop: (data: any) => {
    directiveCropData.value = data
  }
}))

const onDirectiveReady = (event: CustomEvent) => {
  console.log('Directive ready event:', event.detail)
}

const onDirectiveCrop = (event: CustomEvent) => {
  directiveCropData.value = event.detail
}

const directiveAction = (action: string) => {
  if (!directiveElement.value) return
  
  const cropper = getCropperInstance(directiveElement.value)
  if (!cropper) return

  switch(action) {
    case 'rotate':
      cropper.rotate(90)
      break
    case 'reset':
      cropper.reset()
      break
    case 'crop':
      const canvas = cropper.getCroppedCanvas()
      if (canvas) {
        console.log('Got cropped canvas from directive')
      }
      break
  }
}
</script>

<template>
  <CropperDemo />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
