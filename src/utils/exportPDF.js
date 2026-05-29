export const exportToPDF = async (elementId, filename = 'turnamen-report.pdf') => {
  try {
    // Dynamic import untuk mengurangi bundle size
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')
    
    const element = document.getElementById(elementId)
    if (!element) {
      console.error('Element not found')
      return
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 297 // A4 landscape width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`${filename}.pdf`)
    
    return true
  } catch (error) {
    console.error('Export PDF failed:', error)
    return false
  }
}