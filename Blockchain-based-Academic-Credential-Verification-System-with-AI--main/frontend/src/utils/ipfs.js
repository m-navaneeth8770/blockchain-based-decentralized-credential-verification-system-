/**
 * IPFS Desktop Integration
 * Uses local IPFS node running on localhost:5001
 */

const IPFS_API_URL = 'http://localhost:5001/api/v0';
const IPFS_GATEWAY_URL = 'http://localhost:8080/ipfs';

/**
 * Upload file to IPFS Desktop
 * @param {File} file - File object to upload
 * @returns {Promise<string>} - IPFS hash (CID)
 */
const uploadFileToIPFS = async (file) => {
  try {
    console.log('📄 Uploading file to IPFS Desktop:', file.name, file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${IPFS_API_URL}/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const cid = data.Hash;
    
    console.log('✅ File uploaded to IPFS, CID:', cid);
    return cid;
  } catch (error) {
    console.error('❌ Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Upload JSON data to IPFS Desktop
 * @param {Object} data - JSON object to upload
 * @returns {Promise<string>} - IPFS hash (CID)
 */
const uploadJSONToIPFS = async (data) => {
  try {
    console.log('📝 Uploading JSON metadata to IPFS...');
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${IPFS_API_URL}/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    const cid = result.Hash;
    
    console.log('✅ JSON uploaded to IPFS, CID:', cid);
    return cid;
  } catch (error) {
    console.error('❌ Error uploading JSON to IPFS:', error);
    throw error;
  }
};

/**
 * Get IPFS gateway URL for a CID
 * @param {string} cid - IPFS CID
 * @returns {string} - Gateway URL
 */
const getIPFSUrl = (cid) => {
  if (!cid) return '';
  return `${IPFS_GATEWAY_URL}/${cid}`;
};

/**
 * Fetch data from IPFS
 * @param {string} cid - IPFS CID
 * @returns {Promise<any>} - Data from IPFS
 */
const fetchFromIPFS = async (cid) => {
  try {
    const response = await fetch(getIPFSUrl(cid));
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
};

/**
 * Upload grade sheet with metadata to IPFS
 * @param {File} file - Grade sheet file
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} - Object with file CID and metadata CID
 */
const uploadGradeSheet = async (file, metadata) => {
  try {
    console.log('📚 Starting grade sheet upload to IPFS...', file.name);
    
    // Upload the file
    const fileCID = await uploadFileToIPFS(file);
    console.log('✅ File uploaded, CID:', fileCID);
    
    // Create metadata object
    const gradeSheetData = {
      fileCID,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      ...metadata,
    };
    
    // Upload metadata
    const metadataCID = await uploadJSONToIPFS(gradeSheetData);
    console.log('✅ Metadata uploaded, CID:', metadataCID);
    
    return {
      fileCID,
      metadataCID,
      data: gradeSheetData,
    };
  } catch (error) {
    console.error('❌ Error uploading grade sheet:', error);
    throw error;
  }
};

const uploadStudentProfile = async (studentData, profilePhoto = null) => {
  try {
    let photoCID = null;
    if (profilePhoto) {
      photoCID = await uploadFileToIPFS(profilePhoto);
    }
    const profileData = { ...studentData, photoCID, createdAt: new Date().toISOString() };
    return await uploadJSONToIPFS(profileData);
  } catch (error) {
    console.error('Error uploading student profile:', error);
    throw error;
  }
};

const uploadUniversityProfile = async (universityData, logo = null) => {
  try {
    let logoCID = null;
    if (logo) {
      logoCID = await uploadFileToIPFS(logo);
    }
    const profileData = { ...universityData, logoCID, createdAt: new Date().toISOString() };
    return await uploadJSONToIPFS(profileData);
  } catch (error) {
    console.error('Error uploading university profile:', error);
    throw error;
  }
};

const uploadCompanyProfile = async (companyData, logo = null) => {
  try {
    let logoCID = null;
    if (logo) {
      logoCID = await uploadFileToIPFS(logo);
    }
    const profileData = { ...companyData, logoCID, createdAt: new Date().toISOString() };
    return await uploadJSONToIPFS(profileData);
  } catch (error) {
    console.error('Error uploading company profile:', error);
    throw error;
  }
};

/**
 * Get the actual file CID from an IPFS hash (handles both direct files and metadata)
 * @param {string} ipfsHash - IPFS hash (could be metadata or direct file)
 * @returns {Promise<string>} - The actual file CID
 */
const getFileCID = async (ipfsHash) => {
  try {
    const response = await fetch(getIPFSUrl(ipfsHash));
    const contentType = response.headers.get('content-type');
    
    // If it's JSON, it's metadata - extract the fileCID
    if (contentType && contentType.includes('application/json')) {
      const metadata = await response.json();
      return metadata.fileCID || ipfsHash;
    }
    
    // Otherwise, it's the direct file
    return ipfsHash;
  } catch (error) {
    console.error('Error getting file CID:', error);
    return ipfsHash; // Return original hash as fallback
  }
};

// Export all functions
export {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  getIPFSUrl,
  fetchFromIPFS,
  uploadGradeSheet,
  uploadStudentProfile,
  uploadUniversityProfile,
  uploadCompanyProfile,
  getFileCID,
};

// Default export
const ipfsUtils = {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  getIPFSUrl,
  fetchFromIPFS,
  uploadGradeSheet,
  uploadStudentProfile,
  uploadUniversityProfile,
  uploadCompanyProfile,
  getFileCID,
};

export default ipfsUtils;
