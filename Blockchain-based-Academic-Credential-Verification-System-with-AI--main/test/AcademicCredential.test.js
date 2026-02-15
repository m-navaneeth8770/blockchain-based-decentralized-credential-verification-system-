const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AcademicCredential", function () {
  let academicCredential;
  let owner;
  let university1;
  let university2;
  let student;
  let addrs;

  beforeEach(async function () {
    [owner, university1, university2, student, ...addrs] = await ethers.getSigners();
    
    const AcademicCredential = await ethers.getContractFactory("AcademicCredential");
    academicCredential = await AcademicCredential.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await academicCredential.owner()).to.equal(owner.address);
    });

    it("Should set deployer as university authority", async function () {
      expect(await academicCredential.isUniversityAuthority(owner.address)).to.be.true;
    });
  });

  describe("University Authority Management", function () {
    it("Should allow owner to add university authority", async function () {
      await academicCredential.addUniversityAuthority(university1.address);
      expect(await academicCredential.isUniversityAuthority(university1.address)).to.be.true;
    });

    it("Should allow owner to remove university authority", async function () {
      await academicCredential.addUniversityAuthority(university1.address);
      await academicCredential.removeUniversityAuthority(university1.address);
      expect(await academicCredential.isUniversityAuthority(university1.address)).to.be.false;
    });

    it("Should not allow non-owner to add university authority", async function () {
      await expect(
        academicCredential.connect(university1).addUniversityAuthority(university2.address)
      ).to.be.revertedWithCustomError(academicCredential, "OwnableUnauthorizedAccount");
    });

    it("Should not allow non-owner to remove university authority", async function () {
      await academicCredential.addUniversityAuthority(university1.address);
      await expect(
        academicCredential.connect(university1).removeUniversityAuthority(university2.address)
      ).to.be.revertedWithCustomError(academicCredential, "OwnableUnauthorizedAccount");
    });
  });

  describe("Credential Issuance", function () {
    beforeEach(async function () {
      await academicCredential.addUniversityAuthority(university1.address);
    });

    it("Should allow university authority to issue credential", async function () {
      const credentialData = {
        studentName: "John Doe",
        universityName: "MIT",
        degreeType: "Bachelor's",
        fieldOfStudy: "Computer Science",
        graduationDate: Math.floor(Date.now() / 1000),
        credentialHash: "QmHash123456789"
      };

      await expect(
        academicCredential.connect(university1).issueCredential(
          credentialData.studentName,
          credentialData.universityName,
          credentialData.degreeType,
          credentialData.fieldOfStudy,
          credentialData.graduationDate,
          credentialData.credentialHash
        )
      ).to.emit(academicCredential, "DegreeIssued");

      const credentialHash = ethers.keccak256(ethers.toUtf8Bytes(credentialData.credentialHash));
      expect(await academicCredential.credentialHashExists(credentialHash)).to.be.true;
    });

    it("Should not allow non-authority to issue credential", async function () {
      const credentialData = {
        studentName: "John Doe",
        universityName: "MIT",
        degreeType: "Bachelor's",
        fieldOfStudy: "Computer Science",
        graduationDate: Math.floor(Date.now() / 1000),
        credentialHash: "QmHash123456789"
      };

      await expect(
        academicCredential.connect(student).issueCredential(
          credentialData.studentName,
          credentialData.universityName,
          credentialData.degreeType,
          credentialData.fieldOfStudy,
          credentialData.graduationDate,
          credentialData.credentialHash
        )
      ).to.be.revertedWith("Only university authorities can perform this action");
    });

    it("Should not allow duplicate credential hash", async function () {
      const credentialData = {
        studentName: "John Doe",
        universityName: "MIT",
        degreeType: "Bachelor's",
        fieldOfStudy: "Computer Science",
        graduationDate: Math.floor(Date.now() / 1000),
        credentialHash: "QmHash123456789"
      };

      await academicCredential.connect(university1).issueCredential(
        credentialData.studentName,
        credentialData.universityName,
        credentialData.degreeType,
        credentialData.fieldOfStudy,
        credentialData.graduationDate,
        credentialData.credentialHash
      );

      await expect(
        academicCredential.connect(university1).issueCredential(
          credentialData.studentName,
          credentialData.universityName,
          credentialData.degreeType,
          credentialData.fieldOfStudy,
          credentialData.graduationDate,
          credentialData.credentialHash
        )
      ).to.be.revertedWith("Credential already exists");
    });
  });

  describe("Credential Verification", function () {
    let credentialHash;
    let credentialData;

    beforeEach(async function () {
      await academicCredential.addUniversityAuthority(university1.address);
      
      credentialData = {
        studentName: "John Doe",
        universityName: "MIT",
        degreeType: "Bachelor's",
        fieldOfStudy: "Computer Science",
        graduationDate: Math.floor(Date.now() / 1000),
        credentialHash: "QmHash123456789"
      };

      await academicCredential.connect(university1).issueCredential(
        credentialData.studentName,
        credentialData.universityName,
        credentialData.degreeType,
        credentialData.fieldOfStudy,
        credentialData.graduationDate,
        credentialData.credentialHash
      );

      credentialHash = ethers.keccak256(ethers.toUtf8Bytes(credentialData.credentialHash));
    });

    it("Should verify existing credential correctly", async function () {
      const [isValid, credential] = await academicCredential.verifyCredential(credentialData.credentialHash);
      
      expect(isValid).to.be.true;
      expect(credential.studentName).to.equal(credentialData.studentName);
      expect(credential.universityName).to.equal(credentialData.universityName);
      expect(credential.degreeType).to.equal(credentialData.degreeType);
      expect(credential.fieldOfStudy).to.equal(credentialData.fieldOfStudy);
      expect(credential.isRevoked).to.be.false;
    });

    it("Should return false for non-existent credential", async function () {
      const [isValid, credential] = await academicCredential.verifyCredential("NonExistentHash");
      
      expect(isValid).to.be.false;
      expect(credential.studentName).to.equal("");
    });
  });

  describe("Credential Revocation", function () {
    let credentialHash;
    let credentialData;

    beforeEach(async function () {
      await academicCredential.addUniversityAuthority(university1.address);
      
      credentialData = {
        studentName: "John Doe",
        universityName: "MIT",
        degreeType: "Bachelor's",
        fieldOfStudy: "Computer Science",
        graduationDate: Math.floor(Date.now() / 1000),
        credentialHash: "QmHash123456789"
      };

      await academicCredential.connect(university1).issueCredential(
        credentialData.studentName,
        credentialData.universityName,
        credentialData.degreeType,
        credentialData.fieldOfStudy,
        credentialData.graduationDate,
        credentialData.credentialHash
      );

      credentialHash = ethers.keccak256(ethers.toUtf8Bytes(credentialData.credentialHash));
    });

    it("Should allow issuing university to revoke credential", async function () {
      await expect(
        academicCredential.connect(university1).revokeCredential(credentialData.credentialHash)
      ).to.emit(academicCredential, "CredentialRevoked");

      const [isValid] = await academicCredential.verifyCredential(credentialData.credentialHash);
      expect(isValid).to.be.false;
    });

    it("Should allow contract owner to revoke credential", async function () {
      await expect(
        academicCredential.connect(owner).revokeCredential(credentialData.credentialHash)
      ).to.emit(academicCredential, "CredentialRevoked");

      const [isValid] = await academicCredential.verifyCredential(credentialData.credentialHash);
      expect(isValid).to.be.false;
    });

    it("Should not allow non-issuing university to revoke credential", async function () {
      await academicCredential.addUniversityAuthority(university2.address);
      
      await expect(
        academicCredential.connect(university2).revokeCredential(credentialData.credentialHash)
      ).to.be.revertedWith("Only the issuing university or contract owner can revoke credentials");
    });

    it("Should not allow revocation of already revoked credential", async function () {
      await academicCredential.connect(university1).revokeCredential(credentialData.credentialHash);
      
      await expect(
        academicCredential.connect(university1).revokeCredential(credentialData.credentialHash)
      ).to.be.revertedWith("Credential has been revoked");
    });
  });

  describe("Utility Functions", function () {
    beforeEach(async function () {
      await academicCredential.addUniversityAuthority(university1.address);
    });

    it("Should return correct total credentials count", async function () {
      expect(await academicCredential.getTotalCredentials()).to.equal(0);
      
      const credentialData = {
        studentName: "John Doe",
        universityName: "MIT",
        degreeType: "Bachelor's",
        fieldOfStudy: "Computer Science",
        graduationDate: Math.floor(Date.now() / 1000),
        credentialHash: "QmHash123456789"
      };

      await academicCredential.connect(university1).issueCredential(
        credentialData.studentName,
        credentialData.universityName,
        credentialData.degreeType,
        credentialData.fieldOfStudy,
        credentialData.graduationDate,
        credentialData.credentialHash
      );

      expect(await academicCredential.getTotalCredentials()).to.equal(1);
    });

    it("Should return correct credential hash by index", async function () {
      const credentialData = {
        studentName: "Hari Thapa",
        universityName: "MIT",
        degreeType: "Bachelor's",
        fieldOfStudy: "Computer Science",
        graduationDate: Math.floor(Date.now() / 1000),
        credentialHash: "QmHash123456789"
      };

      await academicCredential.connect(university1).issueCredential(
        credentialData.studentName,
        credentialData.universityName,
        credentialData.degreeType,
        credentialData.fieldOfStudy,
        credentialData.graduationDate,
        credentialData.credentialHash
      );

      const expectedHash = ethers.keccak256(ethers.toUtf8Bytes(credentialData.credentialHash));
      const retrievedHash = await academicCredential.getCredentialHashByIndex(0);
      expect(retrievedHash).to.equal(expectedHash);
    });

    it("Should revert when accessing index out of bounds", async function () {
      await expect(
        academicCredential.getCredentialHashByIndex(0)
      ).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("Events", function () {
    beforeEach(async function () {
      await academicCredential.addUniversityAuthority(university1.address);
    });

    it("Should emit DegreeIssued event with correct parameters", async function () {
      const credentialData = {
        studentName: "Hari Thapa",
        universityName: "MIT",
        degreeType: "Bachelor's",
        fieldOfStudy: "Computer Science",
        graduationDate: Math.floor(Date.now() / 1000),
        credentialHash: "QmHash123456789"
      };

      const tx = await academicCredential.connect(university1).issueCredential(
        credentialData.studentName,
        credentialData.universityName,
        credentialData.degreeType,
        credentialData.fieldOfStudy,
        credentialData.graduationDate,
        credentialData.credentialHash
      );
      
      await expect(tx).to.emit(academicCredential, "DegreeIssued")
        .withArgs(
          ethers.keccak256(ethers.toUtf8Bytes(credentialData.credentialHash)),
          credentialData.studentName,
          credentialData.universityName,
          credentialData.degreeType,
          credentialData.fieldOfStudy,
          credentialData.graduationDate,
          university1.address,
          await time()
        );
    });
  });
});

// Helper function to get current timestamp
async function time() {
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  return block.timestamp;
}
