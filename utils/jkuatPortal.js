const axios = require('axios');

/**
 * JKUAT Student Portal Integration Service
 * 
 * This service integrates with the JKUAT student portal to fetch and validate
 * student information during registration and login processes.
 * 
 * Note: This is a mock implementation. Replace with actual JKUAT portal API
 * endpoints and authentication when available.
 */

class JKUATPortalService {
  constructor() {
    // JKUAT Portal API configuration
    this.baseURL = process.env.JKUAT_PORTAL_URL || 'https://portal.jkuat.ac.ke/api';
    this.apiKey = process.env.JKUAT_PORTAL_API_KEY;
    this.timeout = 10000; // 10 seconds timeout
  }

  /**
   * Validate student credentials with JKUAT portal
   * @param {string} registrationNumber - Student registration number
   * @param {string} password - Student portal password (optional)
   * @returns {Promise<Object>} Student information if valid
   */
  async validateStudent(registrationNumber, password = null) {
    try {
      // Mock implementation - replace with actual API call
      const studentData = await this.mockValidateStudent(registrationNumber, password);
      
      if (!studentData) {
        throw new Error('Student not found in JKUAT portal');
      }

      return {
        isValid: true,
        studentInfo: studentData
      };
    } catch (error) {
      console.error('JKUAT Portal validation error:', error.message);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Fetch detailed student information from JKUAT portal
   * @param {string} registrationNumber - Student registration number
   * @returns {Promise<Object>} Detailed student information
   */
  async getStudentDetails(registrationNumber) {
    try {
      // Mock implementation - replace with actual API call
      const studentData = await this.mockGetStudentDetails(registrationNumber);
      
      if (!studentData) {
        throw new Error('Student details not found');
      }

      return {
        success: true,
        data: studentData
      };
    } catch (error) {
      console.error('Error fetching student details:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify student enrollment status
   * @param {string} registrationNumber - Student registration number
   * @returns {Promise<Object>} Enrollment status information
   */
  async verifyEnrollmentStatus(registrationNumber) {
    try {
      // Mock implementation - replace with actual API call
      const enrollmentData = await this.mockVerifyEnrollment(registrationNumber);
      
      return {
        isEnrolled: enrollmentData.isActive,
        academicYear: enrollmentData.academicYear,
        semester: enrollmentData.semester,
        status: enrollmentData.status
      };
    } catch (error) {
      console.error('Error verifying enrollment:', error.message);
      return {
        isEnrolled: false,
        error: error.message
      };
    }
  }

  /**
   * Mock implementation for student validation
   * Replace this with actual JKUAT portal API integration
   */
  async mockValidateStudent(registrationNumber, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock student database - replace with actual API call
    const mockStudents = {
      'EN111-0001/2021': {
        registrationNumber: 'EN111-0001/2021',
        name: 'John Doe Kamau',
        email: 'john.kamau@student.jkuat.ac.ke',
        phone: '+254712345678',
        course: 'Bachelor of Science in Computer Science',
        college: 'COETEC',
        yearOfStudy: 3,
        academicYear: '2024/2025',
        semester: 1,
        isActive: true,
        admissionDate: '2021-09-01',
        expectedGraduation: '2025-12-01'
      },
      'EN111-0002/2022': {
        registrationNumber: 'EN111-0002/2022',
        name: 'Jane Mary Wanjiku',
        email: 'jane.wanjiku@student.jkuat.ac.ke',
        phone: '+254723456789',
        course: 'Bachelor of Science in Information Technology',
        college: 'COETEC',
        yearOfStudy: 2,
        academicYear: '2024/2025',
        semester: 1,
        isActive: true,
        admissionDate: '2022-09-01',
        expectedGraduation: '2026-12-01'
      },
      'BT111-0003/2023': {
        registrationNumber: 'BT111-0003/2023',
        name: 'Peter Mwangi Kiprotich',
        email: 'peter.kiprotich@student.jkuat.ac.ke',
        phone: '+254734567890',
        course: 'Bachelor of Science in Biotechnology',
        college: 'CONAS',
        yearOfStudy: 1,
        academicYear: '2024/2025',
        semester: 1,
        isActive: true,
        admissionDate: '2023-09-01',
        expectedGraduation: '2027-12-01'
      }
    };

    const student = mockStudents[registrationNumber];
    
    if (!student) {
      return null;
    }

    // If password is provided, validate it (mock validation)
    if (password && password !== 'student123') {
      throw new Error('Invalid portal credentials');
    }

    return student;
  }

  /**
   * Mock implementation for getting detailed student information
   */
  async mockGetStudentDetails(registrationNumber) {
    const student = await this.mockValidateStudent(registrationNumber);
    
    if (!student) {
      return null;
    }

    // Add additional details that might be available from the portal
    return {
      ...student,
      profilePhoto: null,
      guardianInfo: {
        name: 'Guardian Name',
        phone: '+254700000000',
        relationship: 'Parent'
      },
      academicRecord: {
        currentGPA: 3.2,
        totalCredits: 120,
        completedCredits: 80
      },
      financialStatus: {
        feesBalance: 50000,
        lastPaymentDate: '2024-11-15'
      }
    };
  }

  /**
   * Mock implementation for enrollment verification
   */
  async mockVerifyEnrollment(registrationNumber) {
    const student = await this.mockValidateStudent(registrationNumber);
    
    if (!student) {
      return {
        isActive: false,
        status: 'Not Found'
      };
    }

    return {
      isActive: student.isActive,
      academicYear: student.academicYear,
      semester: student.semester,
      status: student.isActive ? 'Active' : 'Inactive'
    };
  }

  /**
   * Format student data for our application
   * @param {Object} portalData - Raw data from JKUAT portal
   * @returns {Object} Formatted data for our User model
   */
  formatStudentData(portalData) {
    return {
      name: portalData.name,
      email: portalData.email,
      phone: portalData.phone,
      registrationNumber: portalData.registrationNumber,
      course: portalData.course,
      college: portalData.college,
      yearOfStudy: portalData.yearOfStudy,
      // Additional fields that can be auto-populated
      profilePhoto: portalData.profilePhoto,
      // Set membership status based on enrollment
      membershipStatus: portalData.isActive ? 'Pending' : 'Suspended'
    };
  }

  /**
   * Check if registration number format is valid for JKUAT
   * @param {string} registrationNumber - Registration number to validate
   * @returns {boolean} True if format is valid
   */
  isValidRegistrationFormat(registrationNumber) {
    // JKUAT registration number format: XX111-0000/YYYY
    // Where XX is college code, 111 is course code, 0000 is student number, YYYY is year
    const jkuatRegexPattern = /^[A-Z]{2}\d{3}-\d{4}\/\d{4}$/;
    return jkuatRegexPattern.test(registrationNumber);
  }

  /**
   * Extract information from registration number
   * @param {string} registrationNumber - JKUAT registration number
   * @returns {Object} Parsed information
   */
  parseRegistrationNumber(registrationNumber) {
    if (!this.isValidRegistrationFormat(registrationNumber)) {
      throw new Error('Invalid JKUAT registration number format');
    }

    const parts = registrationNumber.split('-');
    const collegeCode = parts[0].substring(0, 2);
    const courseCode = parts[0].substring(2);
    const studentNumberAndYear = parts[1].split('/');
    const studentNumber = studentNumberAndYear[0];
    const admissionYear = studentNumberAndYear[1];

    // Map college codes to full names
    const collegeMap = {
      'EN': 'COETEC', // College of Engineering and Technology
      'BT': 'CONAS',  // College of Natural Sciences
      'HS': 'COHES',  // College of Health Sciences
      'HR': 'COHRED', // College of Human Resource Development
      'AF': 'COAFS'   // College of Agriculture and Food Sciences
    };

    return {
      collegeCode,
      collegeName: collegeMap[collegeCode] || 'Unknown College',
      courseCode,
      studentNumber,
      admissionYear: parseInt(admissionYear),
      currentYear: new Date().getFullYear() - parseInt(admissionYear) + 1
    };
  }
}

module.exports = new JKUATPortalService();