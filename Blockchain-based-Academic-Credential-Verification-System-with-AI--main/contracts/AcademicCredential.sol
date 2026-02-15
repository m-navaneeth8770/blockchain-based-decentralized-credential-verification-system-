// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AcademicCredential
 * @dev Enhanced smart contract with role-based access control
 * @dev Supports Admin, University, Student, and Verifier roles
 */
contract AcademicCredential is Ownable {
    using Strings for uint256;

    // Enums
    enum CertificateType { ACADEMIC, NON_ACADEMIC }
    enum CertificateStatus { PENDING, APPROVED, REJECTED }

    // Structs
    struct University {
        string name;
        string registrationNumber;
        string contactEmail;
        address walletAddress;
        bool isActive;
        uint256 registeredAt;
        string ipfsHash; // IPFS hash for university profile data
    }

    struct Verifier {
        string companyName;
        string registrationNumber;
        string contactEmail;
        address walletAddress;
        bool isActive;
        uint256 registeredAt;
        string ipfsHash; // IPFS hash for company profile data
    }

    struct Student {
        string name;
        string email;
        string studentId;
        string apaarId; // Government-issued APAAR ID
        address walletAddress;
        address universityAddress;
        uint256 yearOfJoining;
        string branch;
        bool isActive;
        uint256 registeredAt;
        string ipfsHash; // IPFS hash for student profile data
    }

    struct Certificate {
        string certificateHash;
        string certificateName;
        address studentAddress;
        address issuedBy;
        CertificateType certificateType;
        CertificateStatus status;
        uint256 issueDate;
        uint256 graduationDate;
        string degreeType;
        string fieldOfStudy;
        bool isRevoked;
        string metadata; // Additional data as JSON string
        string ipfsHash; // IPFS hash for certificate/grade sheet file
    }
    
    // Grade Sheet structure
    struct GradeSheet {
        bytes32 certificateHash;
        string ipfsHash; // IPFS hash of the grade sheet file
        address studentAddress;
        address uploadedBy;
        uint256 uploadDate;
        string semester;
        string academicYear;
        bool isVisible;
    }

    struct CertificateRequest {
        address verifierAddress;
        address studentAddress;
        string message;
        bool isApproved;
        bool isRejected;
        uint256 requestedAt;
        uint256 respondedAt;
    }
    
    struct UniversityApprovalRequest {
        address verifierAddress;
        address universityAddress;
        string message;
        bool isApproved;
        bool isRejected;
        uint256 requestedAt;
        uint256 respondedAt;
    }
    
    struct RegistrationRequest {
        address walletAddress;
        string entityType; // "university" or "verifier"
        string name;
        string registrationNumber;
        string email;
        string contactPerson;
        string phoneNumber;
        string website;
        string description;
        bool isApproved;
        bool isRejected;
        uint256 requestedAt;
        uint256 respondedAt;
    }
    
    struct DocumentVerification {
        address verifierAddress;
        address studentAddress;
        bytes32 documentHash;
        string documentType; // "certificate" or "gradeSheet"
        string status; // "verified" or "needMoreDocuments"
        string comments;
        uint256 verifiedAt;
    }

    // State variables
    mapping(address => University) public universities;
    mapping(address => Verifier) public verifiers;
    mapping(address => Student) public students;
    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => bool) public certificateExists;
    
    // APAAR ID to student address mapping
    mapping(string => address) public apaarIdToStudent;
    
    // Student's certificates
    mapping(address => bytes32[]) public studentCertificates;
    
    // University's students
    mapping(address => address[]) public universityStudents;
    
    // Certificate requests
    mapping(bytes32 => CertificateRequest) public certificateRequests;
    mapping(address => bytes32[]) public studentRequests;
    
    // Shared certificates (student -> verifier -> certificate hashes)
    mapping(address => mapping(address => bytes32[])) public sharedCertificates;
    
    // Shared grade sheets (student -> verifier -> grade sheet hashes)
    mapping(address => mapping(address => bytes32[])) public sharedGradeSheets;
    
    // Grade sheets mapping (student -> grade sheet hashes)
    mapping(address => bytes32[]) public studentGradeSheets;
    mapping(bytes32 => GradeSheet) public gradeSheets;
    
    // Company approval system (university -> verifier -> approved)
    mapping(address => mapping(address => bool)) public universityApprovedVerifiers;
    mapping(address => address[]) public universityVerifiersList;
    mapping(address => address[]) public verifierUniversitiesList;
    
    // Approval requests from verifiers to universities
    mapping(bytes32 => UniversityApprovalRequest) public approvalRequests;
    mapping(address => bytes32[]) public universityApprovalRequests; // university -> request hashes
    mapping(address => bytes32[]) public verifierApprovalRequests; // verifier -> request hashes
    
    // Registration requests (for onboarding)
    mapping(bytes32 => RegistrationRequest) public registrationRequests;
    bytes32[] public allRegistrationRequests;
    mapping(address => bytes32) public addressToRegistrationRequest; // Track if address already requested
    
    // Document verifications (documentHash -> verifierAddress -> verification)
    mapping(bytes32 => mapping(address => DocumentVerification)) public documentVerifications;
    // Student's verification notifications (student -> verification hashes)
    mapping(address => bytes32[]) public studentVerificationNotifications;

    // Arrays for enumeration
    address[] public allUniversities;
    address[] public allVerifiers;
    address[] public allStudents;
    bytes32[] public allCertificates;

    // Events
    event RegistrationRequestSubmitted(bytes32 indexed requestHash, address indexed walletAddress, string entityType, uint256 timestamp);
    event RegistrationRequestApproved(bytes32 indexed requestHash, address indexed walletAddress, string entityType, uint256 timestamp);
    event RegistrationRequestRejected(bytes32 indexed requestHash, address indexed walletAddress, string entityType, uint256 timestamp);
    event UniversityRegistered(address indexed universityAddress, string name, uint256 timestamp);
    event VerifierRegistered(address indexed verifierAddress, string companyName, uint256 timestamp);
    event StudentRegistered(address indexed studentAddress, address indexed universityAddress, string name, uint256 timestamp);
    event CertificateIssued(bytes32 indexed certificateHash, address indexed studentAddress, CertificateType certificateType, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed certificateHash, address indexed revokedBy, uint256 timestamp);
    event CertificateRequested(bytes32 indexed requestHash, address indexed verifier, address indexed student, uint256 timestamp);
    event CertificateShared(address indexed student, address indexed verifier, bytes32 indexed certificateHash, uint256 timestamp);
    event NonAcademicCertificateStatusUpdated(bytes32 indexed certificateHash, CertificateStatus status, uint256 timestamp);
    event GradeSheetUploaded(bytes32 indexed gradeSheetHash, address indexed studentAddress, address indexed uploadedBy, uint256 timestamp);
    event ProfileUpdated(address indexed userAddress, string ipfsHash, uint256 timestamp);
    event VerifierApprovedByUniversity(address indexed university, address indexed verifier, uint256 timestamp);
    event VerifierRejectedByUniversity(address indexed university, address indexed verifier, uint256 timestamp);
    event ApprovalRequestSent(bytes32 indexed requestHash, address indexed verifier, address indexed university, uint256 timestamp);
    event ApprovalRequestResponded(bytes32 indexed requestHash, bool approved, uint256 timestamp);
    event DocumentVerified(bytes32 indexed documentHash, address indexed verifier, address indexed student, string status, uint256 timestamp);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == owner(), "Only admin can perform this action");
        _;
    }

    modifier onlyUniversity() {
        require(universities[msg.sender].isActive, "Only active universities can perform this action");
        _;
    }

    modifier onlyStudent() {
        require(students[msg.sender].isActive, "Only active students can perform this action");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender].isActive, "Only active verifiers can perform this action");
        _;
    }

    constructor() Ownable(msg.sender) {}

    // Admin Functions
    function registerUniversity(
        address _universityAddress,
        string memory _name,
        string memory _registrationNumber,
        string memory _contactEmail
    ) external onlyAdmin {
        require(_universityAddress != address(0), "Invalid address");
        require(!universities[_universityAddress].isActive, "University already registered");

        universities[_universityAddress] = University({
            name: _name,
            registrationNumber: _registrationNumber,
            contactEmail: _contactEmail,
            walletAddress: _universityAddress,
            isActive: true,
            registeredAt: block.timestamp,
            ipfsHash: ""
        });

        allUniversities.push(_universityAddress);
        emit UniversityRegistered(_universityAddress, _name, block.timestamp);
    }
    
    function updateUniversityProfile(string memory _ipfsHash) external onlyUniversity {
        universities[msg.sender].ipfsHash = _ipfsHash;
        emit ProfileUpdated(msg.sender, _ipfsHash, block.timestamp);
    }

    function registerVerifier(
        address _verifierAddress,
        string memory _companyName,
        string memory _registrationNumber,
        string memory _contactEmail
    ) external onlyAdmin {
        require(_verifierAddress != address(0), "Invalid address");
        require(!verifiers[_verifierAddress].isActive, "Verifier already registered");

        verifiers[_verifierAddress] = Verifier({
            companyName: _companyName,
            registrationNumber: _registrationNumber,
            contactEmail: _contactEmail,
            walletAddress: _verifierAddress,
            isActive: true,
            registeredAt: block.timestamp,
            ipfsHash: ""
        });

        allVerifiers.push(_verifierAddress);
        emit VerifierRegistered(_verifierAddress, _companyName, block.timestamp);
    }
    
    function updateVerifierProfile(string memory _ipfsHash) external onlyVerifier {
        verifiers[msg.sender].ipfsHash = _ipfsHash;
        emit ProfileUpdated(msg.sender, _ipfsHash, block.timestamp);
    }

    function deactivateUniversity(address _universityAddress) external onlyAdmin {
        require(universities[_universityAddress].isActive, "University not active");
        universities[_universityAddress].isActive = false;
    }

    function deactivateVerifier(address _verifierAddress) external onlyAdmin {
        require(verifiers[_verifierAddress].isActive, "Verifier not active");
        verifiers[_verifierAddress].isActive = false;
    }

    // University Functions
    function registerStudent(
        address _studentAddress,
        string memory _name,
        string memory _email,
        string memory _studentId,
        string memory _apaarId,
        uint256 _yearOfJoining,
        string memory _branch
    ) external onlyUniversity {
        require(_studentAddress != address(0), "Invalid address");
        require(!students[_studentAddress].isActive, "Student already registered");
        require(bytes(_apaarId).length > 0, "APAAR ID required");

        students[_studentAddress] = Student({
            name: _name,
            email: _email,
            studentId: _studentId,
            apaarId: _apaarId,
            walletAddress: _studentAddress,
            universityAddress: msg.sender,
            yearOfJoining: _yearOfJoining,
            branch: _branch,
            isActive: true,
            registeredAt: block.timestamp,
            ipfsHash: ""
        });

        // Map APAAR ID to student address
        apaarIdToStudent[_apaarId] = _studentAddress;

        universityStudents[msg.sender].push(_studentAddress);
        allStudents.push(_studentAddress);
        emit StudentRegistered(_studentAddress, msg.sender, _name, block.timestamp);
    }
    
    function updateStudentProfile(string memory _ipfsHash) external onlyStudent {
        students[msg.sender].ipfsHash = _ipfsHash;
        emit ProfileUpdated(msg.sender, _ipfsHash, block.timestamp);
    }
    
    /**
     * Update student details (by university)
     */
    function updateStudentDetails(
        address _studentAddress,
        string memory _name,
        string memory _email,
        string memory _studentId,
        string memory _branch,
        uint256 _yearOfJoining
    ) external onlyUniversity {
        require(_studentAddress != address(0), "Invalid address");
        require(students[_studentAddress].isActive, "Student not registered");
        require(students[_studentAddress].universityAddress == msg.sender, "Not your student");
        
        // Update student details
        students[_studentAddress].name = _name;
        students[_studentAddress].email = _email;
        students[_studentAddress].studentId = _studentId;
        students[_studentAddress].branch = _branch;
        students[_studentAddress].yearOfJoining = _yearOfJoining;
        
        emit ProfileUpdated(_studentAddress, students[_studentAddress].ipfsHash, block.timestamp);
    }

    function issueAcademicCertificate(
        address _studentAddress,
        string memory _certificateHash,
        string memory _certificateName,
        string memory _degreeType,
        string memory _fieldOfStudy,
        uint256 _graduationDate,
        string memory _metadata
    ) external onlyUniversity {
        require(students[_studentAddress].isActive, "Student not registered");
        require(students[_studentAddress].universityAddress == msg.sender, "Not student's university");

        bytes32 certHash = keccak256(abi.encodePacked(_certificateHash, _studentAddress, block.timestamp));
        require(!certificateExists[certHash], "Certificate already exists");

        certificates[certHash] = Certificate({
            certificateHash: _certificateHash,
            certificateName: _certificateName,
            studentAddress: _studentAddress,
            issuedBy: msg.sender,
            certificateType: CertificateType.ACADEMIC,
            status: CertificateStatus.APPROVED,
            issueDate: block.timestamp,
            graduationDate: _graduationDate,
            degreeType: _degreeType,
            fieldOfStudy: _fieldOfStudy,
            isRevoked: false,
            metadata: _metadata,
            ipfsHash: ""
        });

        certificateExists[certHash] = true;
        studentCertificates[_studentAddress].push(certHash);
        allCertificates.push(certHash);

        emit CertificateIssued(certHash, _studentAddress, CertificateType.ACADEMIC, block.timestamp);
    }

    function approveNonAcademicCertificate(bytes32 _certificateHash) external onlyUniversity {
        require(certificateExists[_certificateHash], "Certificate does not exist");
        Certificate storage cert = certificates[_certificateHash];
        require(cert.certificateType == CertificateType.NON_ACADEMIC, "Not a non-academic certificate");
        require(students[cert.studentAddress].universityAddress == msg.sender, "Not student's university");
        require(cert.status == CertificateStatus.PENDING, "Certificate already processed");

        cert.status = CertificateStatus.APPROVED;
        emit NonAcademicCertificateStatusUpdated(_certificateHash, CertificateStatus.APPROVED, block.timestamp);
    }

    function rejectNonAcademicCertificate(bytes32 _certificateHash) external onlyUniversity {
        require(certificateExists[_certificateHash], "Certificate does not exist");
        Certificate storage cert = certificates[_certificateHash];
        require(cert.certificateType == CertificateType.NON_ACADEMIC, "Not a non-academic certificate");
        require(students[cert.studentAddress].universityAddress == msg.sender, "Not student's university");
        require(cert.status == CertificateStatus.PENDING, "Certificate already processed");

        cert.status = CertificateStatus.REJECTED;
        emit NonAcademicCertificateStatusUpdated(_certificateHash, CertificateStatus.REJECTED, block.timestamp);
    }
    
    // Upload grade sheet for a student
    function uploadGradeSheet(
        address _studentAddress,
        string memory _ipfsHash,
        string memory _semester,
        string memory _academicYear
    ) external onlyUniversity {
        require(students[_studentAddress].isActive, "Student not registered");
        require(students[_studentAddress].universityAddress == msg.sender, "Not student's university");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        bytes32 gradeSheetHash = keccak256(abi.encodePacked(_ipfsHash, _studentAddress, block.timestamp));

        gradeSheets[gradeSheetHash] = GradeSheet({
            certificateHash: bytes32(0),
            ipfsHash: _ipfsHash,
            studentAddress: _studentAddress,
            uploadedBy: msg.sender,
            uploadDate: block.timestamp,
            semester: _semester,
            academicYear: _academicYear,
            isVisible: true
        });

        studentGradeSheets[_studentAddress].push(gradeSheetHash);
        emit GradeSheetUploaded(gradeSheetHash, _studentAddress, msg.sender, block.timestamp);
    }
    
    // Get all grade sheets for a student
    function getStudentGradeSheets(address _studentAddress) external view returns (bytes32[] memory) {
        return studentGradeSheets[_studentAddress];
    }
    
    // University approves a verifier/company to access their students
    function approveVerifier(address _verifierAddress) external onlyUniversity {
        require(verifiers[_verifierAddress].isActive, "Verifier not active");
        require(!universityApprovedVerifiers[msg.sender][_verifierAddress], "Already approved");
        
        universityApprovedVerifiers[msg.sender][_verifierAddress] = true;
        universityVerifiersList[msg.sender].push(_verifierAddress);
        verifierUniversitiesList[_verifierAddress].push(msg.sender);
        
        emit VerifierApprovedByUniversity(msg.sender, _verifierAddress, block.timestamp);
    }
    
    // University responds to approval request
    function respondToApprovalRequest(bytes32 _requestHash, bool _approve) external onlyUniversity {
        require(approvalRequests[_requestHash].universityAddress == msg.sender, "Not your request");
        require(!approvalRequests[_requestHash].isApproved && !approvalRequests[_requestHash].isRejected, "Request already responded");
        
        UniversityApprovalRequest storage request = approvalRequests[_requestHash];
        
        if (_approve) {
            request.isApproved = true;
            universityApprovedVerifiers[msg.sender][request.verifierAddress] = true;
            universityVerifiersList[msg.sender].push(request.verifierAddress);
            verifierUniversitiesList[request.verifierAddress].push(msg.sender);
            emit VerifierApprovedByUniversity(msg.sender, request.verifierAddress, block.timestamp);
        } else {
            request.isRejected = true;
            emit VerifierRejectedByUniversity(msg.sender, request.verifierAddress, block.timestamp);
        }
        
        request.respondedAt = block.timestamp;
        emit ApprovalRequestResponded(_requestHash, _approve, block.timestamp);
    }
    
    // University rejects/removes a verifier
    function rejectVerifier(address _verifierAddress) external onlyUniversity {
        require(universityApprovedVerifiers[msg.sender][_verifierAddress], "Not approved");
        
        universityApprovedVerifiers[msg.sender][_verifierAddress] = false;
        
        emit VerifierRejectedByUniversity(msg.sender, _verifierAddress, block.timestamp);
    }
    
    // Get approval requests for a university
    function getUniversityApprovalRequests(address _university) external view returns (bytes32[] memory) {
        return universityApprovalRequests[_university];
    }
    
    // Get approval requests sent by a verifier
    function getVerifierApprovalRequests(address _verifier) external view returns (bytes32[] memory) {
        return verifierApprovalRequests[_verifier];
    }
    
    // Check if verifier is approved by university
    function isVerifierApprovedByUniversity(address _university, address _verifier) external view returns (bool) {
        return universityApprovedVerifiers[_university][_verifier];
    }
    
    // Get all approved verifiers for a university
    function getUniversityApprovedVerifiers(address _university) external view returns (address[] memory) {
        return universityVerifiersList[_university];
    }
    
    // Get all universities that approved a verifier
    function getVerifierApprovedUniversities(address _verifier) external view returns (address[] memory) {
        return verifierUniversitiesList[_verifier];
    }

    // Student Functions
    function uploadNonAcademicCertificate(
        string memory _certificateHash,
        string memory _certificateName,
        string memory _metadata
    ) external onlyStudent {
        bytes32 certHash = keccak256(abi.encodePacked(_certificateHash, msg.sender, block.timestamp));
        require(!certificateExists[certHash], "Certificate already exists");

        certificates[certHash] = Certificate({
            certificateHash: _certificateHash,
            certificateName: _certificateName,
            studentAddress: msg.sender,
            issuedBy: msg.sender,
            certificateType: CertificateType.NON_ACADEMIC,
            status: CertificateStatus.PENDING,
            issueDate: block.timestamp,
            graduationDate: 0,
            degreeType: "",
            fieldOfStudy: "",
            isRevoked: false,
            metadata: _metadata,
            ipfsHash: ""
        });

        certificateExists[certHash] = true;
        studentCertificates[msg.sender].push(certHash);
        allCertificates.push(certHash);

        emit CertificateIssued(certHash, msg.sender, CertificateType.NON_ACADEMIC, block.timestamp);
    }

    // Upload auto-verified non-academic certificate (HIGH/HIGHEST trust level)
    function uploadVerifiedNonAcademicCertificate(
        string memory _certificateHash,
        string memory _certificateName,
        string memory _metadata
    ) external onlyStudent {
        bytes32 certHash = keccak256(abi.encodePacked(_certificateHash, msg.sender, block.timestamp));
        require(!certificateExists[certHash], "Certificate already exists");

        certificates[certHash] = Certificate({
            certificateHash: _certificateHash,
            certificateName: _certificateName,
            studentAddress: msg.sender,
            issuedBy: msg.sender,
            certificateType: CertificateType.NON_ACADEMIC,
            status: CertificateStatus.APPROVED,  // Auto-approved!
            issueDate: block.timestamp,
            graduationDate: 0,
            degreeType: "",
            fieldOfStudy: "",
            isRevoked: false,
            metadata: _metadata,
            ipfsHash: ""
        });

        certificateExists[certHash] = true;
        studentCertificates[msg.sender].push(certHash);
        allCertificates.push(certHash);

        emit CertificateIssued(certHash, msg.sender, CertificateType.NON_ACADEMIC, block.timestamp);
    }

    function shareCertificateWithVerifier(address _verifierAddress, bytes32 _certificateHash) external onlyStudent {
        require(verifiers[_verifierAddress].isActive, "Verifier not active");
        require(certificateExists[_certificateHash], "Certificate does not exist");
        require(certificates[_certificateHash].studentAddress == msg.sender, "Not your certificate");

        sharedCertificates[msg.sender][_verifierAddress].push(_certificateHash);
        emit CertificateShared(msg.sender, _verifierAddress, _certificateHash, block.timestamp);
    }

    function respondToCertificateRequest(bytes32 _requestHash, bool _approve, bytes32[] memory _certificateHashes, bytes32[] memory _gradeSheetHashes) external onlyStudent {
        require(certificateRequests[_requestHash].studentAddress == msg.sender, "Not your request");
        require(!certificateRequests[_requestHash].isApproved && !certificateRequests[_requestHash].isRejected, "Request already responded");

        CertificateRequest storage request = certificateRequests[_requestHash];
        
        if (_approve) {
            request.isApproved = true;
            
            // Share certificates
            for (uint256 i = 0; i < _certificateHashes.length; i++) {
                require(verifiers[request.verifierAddress].isActive, "Verifier not active");
                require(certificateExists[_certificateHashes[i]], "Certificate does not exist");
                require(certificates[_certificateHashes[i]].studentAddress == msg.sender, "Not your certificate");
                
                sharedCertificates[msg.sender][request.verifierAddress].push(_certificateHashes[i]);
                emit CertificateShared(msg.sender, request.verifierAddress, _certificateHashes[i], block.timestamp);
            }
            
            // Share grade sheets
            for (uint256 i = 0; i < _gradeSheetHashes.length; i++) {
                require(gradeSheets[_gradeSheetHashes[i]].studentAddress == msg.sender, "Not your grade sheet");
                sharedGradeSheets[msg.sender][request.verifierAddress].push(_gradeSheetHashes[i]);
            }
        } else {
            request.isRejected = true;
        }
        
        request.respondedAt = block.timestamp;
    }

    // Verifier Functions
    function sendApprovalRequest(address _universityAddress, string memory _message) external onlyVerifier {
        require(universities[_universityAddress].isActive, "University not active");
        require(!universityApprovedVerifiers[_universityAddress][msg.sender], "Already approved");
        
        bytes32 requestHash = keccak256(abi.encodePacked(msg.sender, _universityAddress, block.timestamp));
        
        approvalRequests[requestHash] = UniversityApprovalRequest({
            verifierAddress: msg.sender,
            universityAddress: _universityAddress,
            message: _message,
            isApproved: false,
            isRejected: false,
            requestedAt: block.timestamp,
            respondedAt: 0
        });
        
        universityApprovalRequests[_universityAddress].push(requestHash);
        verifierApprovalRequests[msg.sender].push(requestHash);
        
        emit ApprovalRequestSent(requestHash, msg.sender, _universityAddress, block.timestamp);
    }
    
    function requestCertificates(address _studentAddress, string memory _message) external onlyVerifier {
        require(students[_studentAddress].isActive, "Student not registered");
        
        // Check if verifier is approved by student's university
        address studentUniversity = students[_studentAddress].universityAddress;
        require(universityApprovedVerifiers[studentUniversity][msg.sender], "Not approved by university");

        bytes32 requestHash = keccak256(abi.encodePacked(msg.sender, _studentAddress, block.timestamp));

        certificateRequests[requestHash] = CertificateRequest({
            verifierAddress: msg.sender,
            studentAddress: _studentAddress,
            message: _message,
            isApproved: false,
            isRejected: false,
            requestedAt: block.timestamp,
            respondedAt: 0
        });

        studentRequests[_studentAddress].push(requestHash);
        emit CertificateRequested(requestHash, msg.sender, _studentAddress, block.timestamp);
    }

    // View Functions
    function getUniversityStudents(address _universityAddress) external view returns (address[] memory) {
        return universityStudents[_universityAddress];
    }

    function getStudentCertificates(address _studentAddress) external view returns (bytes32[] memory) {
        return studentCertificates[_studentAddress];
    }

    function getSharedCertificates(address _studentAddress, address _verifierAddress) external view returns (bytes32[] memory) {
        return sharedCertificates[_studentAddress][_verifierAddress];
    }

    function getStudentRequests(address _studentAddress) external view returns (bytes32[] memory) {
        return studentRequests[_studentAddress];
    }

    function getAllUniversities() external view returns (address[] memory) {
        return allUniversities;
    }

    function getAllVerifiers() external view returns (address[] memory) {
        return allVerifiers;
    }

    function getAllStudents() external view returns (address[] memory) {
        return allStudents;
    }

    function getCertificate(bytes32 _certificateHash) external view returns (Certificate memory) {
        require(certificateExists[_certificateHash], "Certificate does not exist");
        return certificates[_certificateHash];
    }

    function getStudentsByUniversityAndFilters(
        address _universityAddress,
        uint256 _yearOfJoining,
        string memory _branch
    ) external view returns (address[] memory) {
        address[] memory universityStudentsList = universityStudents[_universityAddress];
        uint256 count = 0;

        // Count matching students
        for (uint256 i = 0; i < universityStudentsList.length; i++) {
            Student memory student = students[universityStudentsList[i]];
            bool matchesYear = _yearOfJoining == 0 || student.yearOfJoining == _yearOfJoining;
            bool matchesBranch = bytes(_branch).length == 0 || keccak256(bytes(student.branch)) == keccak256(bytes(_branch));
            
            if (matchesYear && matchesBranch) {
                count++;
            }
        }

        // Create result array
        address[] memory result = new address[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < universityStudentsList.length; i++) {
            Student memory student = students[universityStudentsList[i]];
            bool matchesYear = _yearOfJoining == 0 || student.yearOfJoining == _yearOfJoining;
            bool matchesBranch = bytes(_branch).length == 0 || keccak256(bytes(student.branch)) == keccak256(bytes(_branch));
            
            if (matchesYear && matchesBranch) {
                result[index] = universityStudentsList[i];
                index++;
            }
        }

        return result;
    }
    
    // Get student address by APAAR ID
    function getStudentByApaarId(string memory _apaarId) external view returns (address) {
        return apaarIdToStudent[_apaarId];
    }
    
    // Get student details by APAAR ID
    function getStudentDetailsByApaarId(string memory _apaarId) external view returns (
        address studentAddress,
        string memory name,
        string memory email,
        string memory studentId,
        string memory apaarId,
        address universityAddress,
        uint256 yearOfJoining,
        string memory branch,
        bool isActive
    ) {
        address addr = apaarIdToStudent[_apaarId];
        require(addr != address(0), "Student not found");
        
        Student memory student = students[addr];
        return (
            student.walletAddress,
            student.name,
            student.email,
            student.studentId,
            student.apaarId,
            student.universityAddress,
            student.yearOfJoining,
            student.branch,
            student.isActive
        );
    }
    
    // Get shared grade sheets between student and verifier
    function getSharedGradeSheets(address _studentAddress, address _verifierAddress) external view returns (bytes32[] memory) {
        return sharedGradeSheets[_studentAddress][_verifierAddress];
    }
    
    // Registration Request Functions
    
    /**
     * Submit registration request (for universities or verifiers)
     */
    function submitRegistrationRequest(
        string memory _entityType,
        string memory _name,
        string memory _registrationNumber,
        string memory _email,
        string memory _contactPerson,
        string memory _phoneNumber,
        string memory _website,
        string memory _description
    ) external {
        require(
            keccak256(bytes(_entityType)) == keccak256(bytes("university")) || 
            keccak256(bytes(_entityType)) == keccak256(bytes("verifier")),
            "Invalid entity type"
        );
        require(addressToRegistrationRequest[msg.sender] == bytes32(0), "Request already submitted");
        require(!universities[msg.sender].isActive && !verifiers[msg.sender].isActive, "Already registered");
        
        bytes32 requestHash = keccak256(abi.encodePacked(msg.sender, _entityType, block.timestamp));
        
        registrationRequests[requestHash] = RegistrationRequest({
            walletAddress: msg.sender,
            entityType: _entityType,
            name: _name,
            registrationNumber: _registrationNumber,
            email: _email,
            contactPerson: _contactPerson,
            phoneNumber: _phoneNumber,
            website: _website,
            description: _description,
            isApproved: false,
            isRejected: false,
            requestedAt: block.timestamp,
            respondedAt: 0
        });
        
        allRegistrationRequests.push(requestHash);
        addressToRegistrationRequest[msg.sender] = requestHash;
        
        emit RegistrationRequestSubmitted(requestHash, msg.sender, _entityType, block.timestamp);
    }
    
    /**
     * Admin approves registration request
     */
    function approveRegistrationRequest(bytes32 _requestHash) external onlyAdmin {
        RegistrationRequest storage request = registrationRequests[_requestHash];
        require(request.walletAddress != address(0), "Request does not exist");
        require(!request.isApproved && !request.isRejected, "Request already processed");
        
        request.isApproved = true;
        request.respondedAt = block.timestamp;
        
        // Register the entity based on type
        if (keccak256(bytes(request.entityType)) == keccak256(bytes("university"))) {
            require(!universities[request.walletAddress].isActive, "University already registered");
            
            universities[request.walletAddress] = University({
                name: request.name,
                registrationNumber: request.registrationNumber,
                contactEmail: request.email,
                walletAddress: request.walletAddress,
                isActive: true,
                registeredAt: block.timestamp,
                ipfsHash: ""
            });
            
            allUniversities.push(request.walletAddress);
            emit UniversityRegistered(request.walletAddress, request.name, block.timestamp);
            
        } else if (keccak256(bytes(request.entityType)) == keccak256(bytes("verifier"))) {
            require(!verifiers[request.walletAddress].isActive, "Verifier already registered");
            
            verifiers[request.walletAddress] = Verifier({
                companyName: request.name,
                registrationNumber: request.registrationNumber,
                contactEmail: request.email,
                walletAddress: request.walletAddress,
                isActive: true,
                registeredAt: block.timestamp,
                ipfsHash: ""
            });
            
            allVerifiers.push(request.walletAddress);
            emit VerifierRegistered(request.walletAddress, request.name, block.timestamp);
        }
        
        emit RegistrationRequestApproved(_requestHash, request.walletAddress, request.entityType, block.timestamp);
    }
    
    /**
     * Admin rejects registration request
     */
    function rejectRegistrationRequest(bytes32 _requestHash, string memory _reason) external onlyAdmin {
        RegistrationRequest storage request = registrationRequests[_requestHash];
        require(request.walletAddress != address(0), "Request does not exist");
        require(!request.isApproved && !request.isRejected, "Request already processed");
        
        request.isRejected = true;
        request.respondedAt = block.timestamp;
        
        emit RegistrationRequestRejected(_requestHash, request.walletAddress, request.entityType, block.timestamp);
    }
    
    /**
     * Get all pending registration requests
     */
    function getPendingRegistrationRequests() external view returns (bytes32[] memory) {
        uint256 pendingCount = 0;
        
        // Count pending requests
        for (uint256 i = 0; i < allRegistrationRequests.length; i++) {
            RegistrationRequest memory req = registrationRequests[allRegistrationRequests[i]];
            if (!req.isApproved && !req.isRejected) {
                pendingCount++;
            }
        }
        
        // Create array of pending requests
        bytes32[] memory pending = new bytes32[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allRegistrationRequests.length; i++) {
            RegistrationRequest memory req = registrationRequests[allRegistrationRequests[i]];
            if (!req.isApproved && !req.isRejected) {
                pending[index] = allRegistrationRequests[i];
                index++;
            }
        }
        
        return pending;
    }
    
    /**
     * Get all registration requests (for admin)
     */
    function getAllRegistrationRequests() external view onlyAdmin returns (bytes32[] memory) {
        return allRegistrationRequests;
    }
    
    /**
     * Check if address has pending request
     */
    function hasRegistrationRequest(address _address) external view returns (bool) {
        bytes32 requestHash = addressToRegistrationRequest[_address];
        if (requestHash == bytes32(0)) return false;
        
        RegistrationRequest memory req = registrationRequests[requestHash];
        return !req.isApproved && !req.isRejected;
    }
    
    /**
     * Submit document verification (by verifier)
     */
    function submitDocumentVerification(
        bytes32 _documentHash,
        address _studentAddress,
        string memory _documentType,
        string memory _status,
        string memory _comments
    ) external {
        require(verifiers[msg.sender].isActive, "Only active verifiers can verify documents");
        require(students[_studentAddress].isActive, "Student must be active");
        require(
            keccak256(bytes(_status)) == keccak256(bytes("verified")) || 
            keccak256(bytes(_status)) == keccak256(bytes("needMoreDocuments")),
            "Invalid status"
        );
        
        // Create verification record
        DocumentVerification memory verification = DocumentVerification({
            verifierAddress: msg.sender,
            studentAddress: _studentAddress,
            documentHash: _documentHash,
            documentType: _documentType,
            status: _status,
            comments: _comments,
            verifiedAt: block.timestamp
        });
        
        documentVerifications[_documentHash][msg.sender] = verification;
        
        // Create notification hash for student
        bytes32 notificationHash = keccak256(abi.encodePacked(_documentHash, msg.sender, block.timestamp));
        studentVerificationNotifications[_studentAddress].push(notificationHash);
        
        emit DocumentVerified(_documentHash, msg.sender, _studentAddress, _status, block.timestamp);
    }
    
    /**
     * Get verification for a document by a specific verifier
     */
    function getDocumentVerification(bytes32 _documentHash, address _verifierAddress) 
        external 
        view 
        returns (DocumentVerification memory) 
    {
        return documentVerifications[_documentHash][_verifierAddress];
    }
    
    /**
     * Get all verification notifications for a student
     */
    function getStudentVerificationNotifications(address _studentAddress) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return studentVerificationNotifications[_studentAddress];
    }
    
    /**
     * Get verification count for a student
     */
    function getVerificationNotificationCount(address _studentAddress) 
        external 
        view 
        returns (uint256) 
    {
        return studentVerificationNotifications[_studentAddress].length;
    }
}
