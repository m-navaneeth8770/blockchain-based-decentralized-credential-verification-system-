require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = 3002;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper: Convert PDF to image using system poppler
const convertPDFToImage = async (pdfBuffer) => {
  let tempDir;
  try {
    console.log('📄 Converting PDF to image...');
    
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cert-verify-'));
    const pdfPath = path.join(tempDir, 'certificate.pdf');
    const outputPath = path.join(tempDir, 'page');
    
    await fs.writeFile(pdfPath, pdfBuffer);
    
    const command = `pdftoppm -png -f 1 -l 1 -scale-to 1024 "${pdfPath}" "${outputPath}"`;
    await execPromise(command);
    
    const imagePath = path.join(tempDir, 'page-1.png');
    const imageBuffer = await fs.readFile(imagePath);
    
    console.log('✅ PDF converted to image');
    return imageBuffer;
  } catch (error) {
    console.error('Error converting PDF:', error);
    throw new Error(`PDF conversion failed: ${error.message}`);
  } finally {
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }
};

// Helper: Analyze certificate using Gemini Vision (Direct REST API)
const analyzeCertificateWithAI = async (imageBuffer, studentName) => {
  try {
    console.log('🤖 Analyzing certificate with Gemini AI...');
    
    const prompt = `You are a certificate verification expert. Analyze this certificate image and extract the following information in JSON format:

{
  "recipientName": "Full name of the person who received the certificate",
  "courseName": "Name of the course or certification",
  "issuer": "Organization that issued the certificate (e.g., IBM, Coursera, etc.)",
  "issueDate": "Date when certificate was issued",
  "verificationUrl": "Any URL shown on the certificate for verification (look carefully at bottom or corners)",
  "hasQRCode": true/false,
  "certificateType": "Type of certificate (e.g., Course Completion, Professional Certificate, etc.)",
  "additionalInfo": "Any other relevant information"
}

IMPORTANT:
1. Look very carefully for ANY URLs on the certificate - they might be at the bottom, in small text, or near "Verify at:" text
2. The recipient name might be in different formats (e.g., "M Navaneeth" or "Navaneeth M")
3. Extract the EXACT name as shown on the certificate
4. If you see a QR code, set hasQRCode to true

Expected student name for verification: "${studentName}"

Please analyze and return ONLY the JSON object, no other text.`;

    // Use direct REST API call
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBuffer.toString('base64')
              }
            }
          ]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        }
      }
    );
    
    const text = response.data.candidates[0].content.parts[0].text;
    console.log('📝 AI Response:', text);
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }
    
    const extractedData = JSON.parse(jsonMatch[0]);
    console.log('✅ AI extraction complete');
    
    return extractedData;
  } catch (error) {
    console.error('Error analyzing with AI:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    throw error;
  }
};

// Helper: Compare names intelligently
const compareNames = (name1, name2) => {
  if (!name1 || !name2) return { match: false, confidence: 0, method: 'missing' };
  
  const normalize = (name) => name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
  
  const normalized1 = normalize(name1);
  const normalized2 = normalize(name2);
  
  // Exact match
  if (normalized1 === normalized2) {
    return { match: true, confidence: 100, method: 'exact' };
  }
  
  // Split into parts
  const parts1 = normalized1.split(' ').filter(p => p.length > 0);
  const parts2 = normalized2.split(' ').filter(p => p.length > 0);
  
  // Check if all parts match (any order)
  const allParts1InName2 = parts1.every(part => parts2.includes(part));
  const allParts2InName1 = parts2.every(part => parts1.includes(part));
  
  if ((allParts1InName2 || allParts2InName1) && parts1.length >= 2 && parts2.length >= 2) {
    return { match: true, confidence: 95, method: 'parts_match_any_order' };
  }
  
  // Check substring match
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return { match: true, confidence: 85, method: 'substring' };
  }
  
  // Calculate similarity percentage
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  const confidence = Math.round((matches / longer.length) * 100);
  
  return {
    match: confidence >= 70,
    confidence: confidence,
    method: 'character_similarity'
  };
};

// Main verification endpoint
app.post('/api/verify-certificate', upload.single('certificate'), async (req, res) => {
  console.log('\n🎓 Starting AI-powered certificate verification...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No certificate file provided' });
    }
    
    const { studentName, studentId } = req.body;
    
    if (!studentName) {
      return res.status(400).json({ error: 'Student name is required' });
    }
    
    console.log('📄 File received:', req.file.originalname, `(${Math.round(req.file.size / 1024)}KB)`);
    console.log('👤 Student name:', studentName);
    
    // Convert PDF to image if needed
    let imageBuffer = req.file.buffer;
    if (req.file.mimetype === 'application/pdf') {
      console.log('🔄 PDF detected, converting to image...');
      imageBuffer = await convertPDFToImage(req.file.buffer);
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      studentName: studentName,
      studentId: studentId,
      method: 'AI_VISION',
      steps: [],
      fileInfo: {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }
    };
    
    // Step 1: AI Analysis
    results.steps.push({ step: 1, name: 'AI Vision Analysis', status: 'processing' });
    
    let aiData;
    try {
      aiData = await analyzeCertificateWithAI(imageBuffer, studentName);
      results.aiExtraction = aiData;
      results.steps[0].status = 'success';
    } catch (err) {
      console.error('AI analysis error:', err.message);
      results.aiExtraction = { error: err.message };
      results.steps[0].status = 'failed';
      
      return res.status(500).json({
        error: 'AI analysis failed',
        message: err.message,
        results: results
      });
    }
    
    // Step 2: Name Matching
    results.steps.push({ step: 2, name: 'Name Verification', status: 'processing' });
    const nameComparison = compareNames(studentName, aiData.recipientName);
    results.nameMatch = nameComparison;
    results.steps[1].status = nameComparison.match ? 'success' : 'failed';
    
    console.log(`🔍 Name comparison: "${studentName}" vs "${aiData.recipientName}" = ${nameComparison.confidence}% (${nameComparison.method})`);
    
    // Step 3: URL Verification (if available)
    let urlVerified = false;
    let urlContainsName = false;
    
    if (aiData.verificationUrl && aiData.verificationUrl !== 'Not found' && aiData.verificationUrl !== 'None') {
      results.steps.push({ step: 3, name: 'URL Verification', status: 'processing' });
      results.verificationUrl = aiData.verificationUrl;
      console.log('🔗 Verification URL found:', aiData.verificationUrl);
      
      // Actually visit the URL and verify
      try {
        console.log('🌐 Visiting URL to verify certificate...');
        const urlResponse = await axios.get(aiData.verificationUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (urlResponse.status === 200) {
          urlVerified = true;
          const pageContent = urlResponse.data.toLowerCase();
          
          // Check if the page contains the student's name
          const nameParts = studentName.toLowerCase().split(' ');
          urlContainsName = nameParts.some(part => pageContent.includes(part));
          
          results.urlVerification = {
            valid: true,
            status: urlResponse.status,
            nameFound: urlContainsName
          };
          
          results.steps[2].status = 'success';
          console.log('✅ URL verified successfully');
          console.log('👤 Name found on verification page:', urlContainsName);
        } else {
          results.urlVerification = { valid: false, status: urlResponse.status };
          results.steps[2].status = 'failed';
          console.log('❌ URL verification failed with status:', urlResponse.status);
        }
      } catch (urlError) {
        console.log('⚠️ Could not verify URL:', urlError.message);
        results.urlVerification = { 
          valid: false, 
          error: urlError.message,
          note: 'URL exists but could not be accessed (may require authentication)'
        };
        results.steps[2].status = 'warning';
        // Don't fail completely if URL can't be accessed - certificate might still be valid
      }
    } else {
      results.steps.push({ step: 3, name: 'URL Verification', status: 'not_found' });
      console.log('🔗 No verification URL found');
    }
    
    // Final Decision
    let finalStatus = 'PENDING';
    let trustLevel = 'LOW';
    let verificationMethod = 'AI_ONLY';
    
    const hasUrl = aiData.verificationUrl && aiData.verificationUrl !== 'Not found' && aiData.verificationUrl !== 'None';
    const hasQR = aiData.hasQRCode === true;
    
    if (nameComparison.match) {
      // Best case: URL verified + name found on verification page
      if (nameComparison.confidence >= 95 && urlVerified && urlContainsName) {
        finalStatus = 'APPROVED';
        trustLevel = 'HIGHEST';
        verificationMethod = 'AI_URL_VERIFIED_WITH_NAME';
      }
      // Good case: URL verified but name not found (might be formatted differently on page)
      else if (nameComparison.confidence >= 95 && urlVerified) {
        finalStatus = 'APPROVED';
        trustLevel = 'HIGH';
        verificationMethod = 'AI_URL_VERIFIED';
      }
      // URL exists but couldn't verify (authentication required, etc.)
      else if (nameComparison.confidence >= 95 && hasUrl) {
        finalStatus = 'APPROVED';
        trustLevel = 'HIGH';
        verificationMethod = 'AI_URL_EXISTS';
      }
      // QR code present
      else if (nameComparison.confidence >= 95 && hasQR) {
        finalStatus = 'APPROVED';
        trustLevel = 'HIGH';
        verificationMethod = 'AI_QR_CODE';
      }
      // Good name match with URL
      else if (nameComparison.confidence >= 90 && hasUrl) {
        finalStatus = 'APPROVED';
        trustLevel = 'MEDIUM';
        verificationMethod = 'AI_URL';
      }
      // Decent name match
      else if (nameComparison.confidence >= 85) {
        finalStatus = 'PENDING';
        trustLevel = 'MEDIUM';
        verificationMethod = 'AI_NAME_MATCH';
      }
      // Lower confidence
      else if (nameComparison.confidence >= 70) {
        finalStatus = 'PENDING';
        trustLevel = 'LOW';
        verificationMethod = 'AI_PARTIAL_MATCH';
      }
    } else {
      finalStatus = 'REJECTED';
      trustLevel = 'NONE';
      verificationMethod = 'NAME_MISMATCH';
    }
    
    results.finalDecision = {
      status: finalStatus,
      trustLevel: trustLevel,
      verificationMethod: verificationMethod,
      confidence: nameComparison.confidence,
      autoApproved: finalStatus === 'APPROVED',
      requiresManualReview: finalStatus === 'PENDING',
      rejected: finalStatus === 'REJECTED',
      reason: finalStatus === 'APPROVED' ? 'Certificate verified successfully' :
              finalStatus === 'PENDING' ? 'Requires manual review' :
              'Name mismatch - certificate may not belong to this student'
    };
    
    console.log('✅ Verification complete:', finalStatus);
    console.log('📊 Trust Level:', trustLevel);
    console.log('🎯 Confidence:', nameComparison.confidence + '%');
    
    res.json(results);
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    console.error('Stack trace:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Verification failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI-powered certificate verification service is running',
    aiProvider: 'Google Gemini',
    features: ['Vision Analysis', 'Smart Name Matching', 'URL Detection']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AI Certificate Verification Service running on http://localhost:${PORT}`);
  console.log(`🤖 Using Google Gemini Vision API`);
  console.log(`📋 Features: AI Vision Analysis, Smart Name Matching, URL Detection`);
});
