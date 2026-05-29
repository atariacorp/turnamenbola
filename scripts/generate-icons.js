// scripts/generate-icons.js
import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = path.join(__dirname, '../public/icons')

// Create icons directory if not exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Colors
const primaryColor = '#667eea'
const secondaryColor = '#764ba2'

sizes.forEach(size => {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, primaryColor)
  gradient.addColorStop(1, secondaryColor)
  
  // Draw background
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  // Draw trophy icon
  ctx.fillStyle = 'white'
  ctx.font = `bold ${size * 0.45}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🏆', size / 2, size / 2)
  
  // Draw border
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = size * 0.02
  ctx.strokeRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9)
  
  // Save to file
  const buffer = canvas.toBuffer('image/png')
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`)
  fs.writeFileSync(filename, buffer)
  console.log(`Generated: ${filename}`)
})

console.log('All icons generated successfully!')