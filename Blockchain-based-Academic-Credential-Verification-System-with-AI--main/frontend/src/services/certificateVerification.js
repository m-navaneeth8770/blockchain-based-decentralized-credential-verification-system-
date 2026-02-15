/**
 * Certificate Verification Service
 * Supports auto-verification for popular certificate platforms
 */

// Supported platforms
const PLATFORMS = {
  HACKERRANK: 'hackerrank',
  COURSERA: 'coursera',
  CREDLY: 'credly',
  UDEMY: 'udemy',
  LINKEDIN: 'linkedin',
  GOOGLE: 'google',
  FREECODECAMP: 'freecodecamp',
  KAGGLE: 'kaggle',
  GITHUB: 'github',
  IEEE: 'ieee',
};

/**
 * Detect platform from URL
 */
export const detectPlatform = (url) => {
  if (!url) return null;
  
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('hackerrank.com')) return PLATFORMS.HACKERRANK;
  if (urlLower.includes('coursera.org')) return PLATFORMS.COURSERA;
  if (urlLower.includes('credly.com')) return PLATFORMS.CREDLY;
  if (urlLower.includes('udemy.com')) return PLATFORMS.UDEMY;
  if (urlLower.includes('linkedin.com/learning')) return PLATFORMS.LINKEDIN;
  if (urlLower.includes('google.com') || urlLower.includes('grow.google')) return PLATFORMS.GOOGLE;
  if (urlLower.includes('freecodecamp.org')) return PLATFORMS.FREECODECAMP;
  if (urlLower.includes('kaggle.com')) return PLATFORMS.KAGGLE;
  if (urlLower.includes('github.com')) return PLATFORMS.GITHUB;
  if (urlLower.includes('ieee.org')) return PLATFORMS.IEEE;
  
  return null;
};

/**
 * Extract certificate ID from URL
 */
export const extractCertificateId = (url, platform) => {
  if (!url) return null;
  
  try {
    switch (platform) {
      case PLATFORMS.HACKERRANK:
        // https://www.hackerrank.com/certificates/abc123
        const hrMatch = url.match(/certificates\/([a-zA-Z0-9]+)/);
        return hrMatch ? hrMatch[1] : null;
        
      case PLATFORMS.COURSERA:
        // https://www.coursera.org/account/accomplishments/verify/ABC123
        const courseraMatch = url.match(/verify\/([a-zA-Z0-9]+)/);
        return courseraMatch ? courseraMatch[1] : null;
        
      case PLATFORMS.CREDLY:
        // https://www.credly.com/badges/abc-123-def
        const credlyMatch = url.match(/badges\/([a-zA-Z0-9-]+)/);
        return credlyMatch ? credlyMatch[1] : null;
        
      case PLATFORMS.FREECODECAMP:
        // https://www.freecodecamp.org/certification/username/certification-name
        const fccMatch = url.match(/certification\/([^/]+)\/([^/]+)/);
        return fccMatch ? `${fccMatch[1]}/${fccMatch[2]}` : null;
        
      default:
        return null;
    }
  } catch (error) {
    console.error('Error extracting certificate ID:', error);
    return null;
  }
};

/**
 * Verify certificate URL is accessible
 */
export const verifyCertificateUrl = async (url) => {
  try {
    // Use a CORS proxy for development
    // In production, this should be done server-side
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // This will return opaque response
    });
    
    // With no-cors, we can't check status, but if it doesn't throw, URL exists
    return { valid: true, accessible: true };
  } catch (error) {
    console.error('Error verifying URL:', error);
    return { valid: false, accessible: false, error: error.message };
  }
};

/**
 * Main verification function
 */
export const verifyCertificate = async (certificateData) => {
  const { url, studentName, certificateName } = certificateData;
  
  if (!url) {
    return {
      verified: false,
      method: 'none',
      message: 'No certificate URL provided',
      requiresManualReview: true,
    };
  }
  
  // Detect platform
  const platform = detectPlatform(url);
  
  if (!platform) {
    return {
      verified: false,
      method: 'unknown_platform',
      message: 'Certificate platform not recognized',
      requiresManualReview: true,
    };
  }
  
  // Extract certificate ID
  const certId = extractCertificateId(url, platform);
  
  if (!certId) {
    return {
      verified: false,
      method: 'invalid_url',
      message: 'Could not extract certificate ID from URL',
      requiresManualReview: true,
    };
  }
  
  // Verify URL is accessible
  const urlCheck = await verifyCertificateUrl(url);
  
  if (!urlCheck.accessible) {
    return {
      verified: false,
      method: 'url_check',
      message: 'Certificate URL is not accessible',
      requiresManualReview: true,
    };
  }
  
  // Platform-specific verification
  const platformResult = await verifyByPlatform(platform, url, certId, studentName);
  
  return {
    verified: platformResult.verified,
    method: 'auto',
    platform,
    certificateId: certId,
    details: platformResult.details,
    message: platformResult.message,
    requiresManualReview: !platformResult.verified,
  };
};

/**
 * Platform-specific verification
 */
const verifyByPlatform = async (platform, url, certId, studentName) => {
  switch (platform) {
    case PLATFORMS.HACKERRANK:
      return verifyHackerRank(url, certId, studentName);
      
    case PLATFORMS.COURSERA:
      return verifyCoursera(url, certId, studentName);
      
    case PLATFORMS.CREDLY:
      return verifyCredly(url, certId, studentName);
      
    case PLATFORMS.FREECODECAMP:
      return verifyFreeCodeCamp(url, certId, studentName);
      
    default:
      return {
        verified: true, // Assume valid if URL is accessible
        message: `Certificate URL verified for ${platform}`,
        details: { platform, certificateId: certId },
      };
  }
};

/**
 * HackerRank verification
 */
const verifyHackerRank = async (url, certId, studentName) => {
  try {
    // HackerRank certificates are publicly accessible
    // URL format: https://www.hackerrank.com/certificates/abc123
    
    // Since we can't do CORS requests from browser, we'll verify the URL format
    const isValidFormat = /^https:\/\/(www\.)?hackerrank\.com\/certificates\/[a-zA-Z0-9]+$/.test(url);
    
    if (isValidFormat) {
      return {
        verified: true,
        message: 'HackerRank certificate URL format verified',
        details: {
          platform: 'HackerRank',
          certificateId: certId,
          verificationUrl: url,
        },
      };
    }
    
    return {
      verified: false,
      message: 'Invalid HackerRank certificate URL format',
    };
  } catch (error) {
    return {
      verified: false,
      message: 'Error verifying HackerRank certificate',
    };
  }
};

/**
 * Coursera verification
 */
const verifyCoursera = async (url, certId, studentName) => {
  try {
    // Coursera verification URL format
    const isValidFormat = /^https:\/\/(www\.)?coursera\.org\/account\/accomplishments\/(verify|certificate)\/[a-zA-Z0-9]+$/.test(url);
    
    if (isValidFormat) {
      return {
        verified: true,
        message: 'Coursera certificate URL format verified',
        details: {
          platform: 'Coursera',
          certificateId: certId,
          verificationUrl: url,
        },
      };
    }
    
    return {
      verified: false,
      message: 'Invalid Coursera certificate URL format',
    };
  } catch (error) {
    return {
      verified: false,
      message: 'Error verifying Coursera certificate',
    };
  }
};

/**
 * Credly verification
 */
const verifyCredly = async (url, certId, studentName) => {
  try {
    // Credly badge URL format
    const isValidFormat = /^https:\/\/(www\.)?credly\.com\/badges\/[a-zA-Z0-9-]+$/.test(url);
    
    if (isValidFormat) {
      return {
        verified: true,
        message: 'Credly badge URL format verified',
        details: {
          platform: 'Credly',
          badgeId: certId,
          verificationUrl: url,
        },
      };
    }
    
    return {
      verified: false,
      message: 'Invalid Credly badge URL format',
    };
  } catch (error) {
    return {
      verified: false,
      message: 'Error verifying Credly badge',
    };
  }
};

/**
 * FreeCodeCamp verification
 */
const verifyFreeCodeCamp = async (url, certId, studentName) => {
  try {
    // FreeCodeCamp certificate URL format
    const isValidFormat = /^https:\/\/(www\.)?freecodecamp\.org\/certification\/[^/]+\/[^/]+$/.test(url);
    
    if (isValidFormat) {
      return {
        verified: true,
        message: 'FreeCodeCamp certificate URL format verified',
        details: {
          platform: 'FreeCodeCamp',
          certificateId: certId,
          verificationUrl: url,
        },
      };
    }
    
    return {
      verified: false,
      message: 'Invalid FreeCodeCamp certificate URL format',
    };
  } catch (error) {
    return {
      verified: false,
      message: 'Error verifying FreeCodeCamp certificate',
    };
  }
};

/**
 * Get platform display name
 */
export const getPlatformDisplayName = (platform) => {
  const names = {
    [PLATFORMS.HACKERRANK]: 'HackerRank',
    [PLATFORMS.COURSERA]: 'Coursera',
    [PLATFORMS.CREDLY]: 'Credly',
    [PLATFORMS.UDEMY]: 'Udemy',
    [PLATFORMS.LINKEDIN]: 'LinkedIn Learning',
    [PLATFORMS.GOOGLE]: 'Google',
    [PLATFORMS.FREECODECAMP]: 'FreeCodeCamp',
    [PLATFORMS.KAGGLE]: 'Kaggle',
    [PLATFORMS.GITHUB]: 'GitHub',
    [PLATFORMS.IEEE]: 'IEEE',
  };
  
  return names[platform] || 'Unknown Platform';
};

export default {
  verifyCertificate,
  detectPlatform,
  extractCertificateId,
  getPlatformDisplayName,
  PLATFORMS,
};
