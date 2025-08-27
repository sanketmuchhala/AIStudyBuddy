import { NextRequest } from 'next/server'

// Dynamically import pdf-parse to avoid initialization issues
const parsePdf = async (buffer: Buffer) => {
  const pdfParse = (await import('pdf-parse')).default
  return pdfParse(buffer)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    let extractedText = ''

    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const data = await parsePdf(buffer)
        extractedText = data.text || ''
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError)
        return Response.json({ 
          error: 'Failed to parse PDF file. Please ensure it contains readable text or try uploading a text file instead.' 
        }, { status: 400 })
      }
    } else if (file.type === 'text/plain') {
      extractedText = await file.text()
    } else {
      return Response.json({ error: 'Unsupported file type. Please upload PDF or TXT files.' }, { status: 400 })
    }

    // Ensure we have some text to work with
    if (!extractedText.trim()) {
      return Response.json({ 
        error: 'No readable text found in the uploaded file. Please try a different file or upload a text version.' 
      }, { status: 400 })
    }

    // Extract basic information using simple pattern matching
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
    
    const emails = extractedText.match(emailRegex) || []
    const phones = extractedText.match(phoneRegex) || []

    // Extract skills (look for common skill section indicators)
    const skillsSection = extractedText.match(/(?:Skills?|Technologies?|Technical Skills?)[\s\S]*?(?=\n[A-Z]|\n\n|$)/gi) || []
    const skills = skillsSection.join(' ').replace(/Skills?|Technologies?|Technical Skills?/gi, '').trim()

    // Extract experience years (rough estimate)
    const yearMatches = extractedText.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi) || []
    
    return Response.json({
      text: extractedText,
      parsed: {
        emails: emails.slice(0, 3), // Limit to first 3 emails
        phones: phones.slice(0, 3), // Limit to first 3 phones
        skills,
        experienceYears: yearMatches.length,
        wordCount: extractedText.split(/\s+/).length
      }
    })
  } catch (error) {
    console.error('Resume parsing error:', error)
    return Response.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}