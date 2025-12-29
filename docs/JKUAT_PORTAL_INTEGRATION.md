# JKUAT Portal Integration

This document describes the integration between the JKUAT Innovation and Entrepreneurship Club website and the JKUAT student portal system.

## Overview

The integration allows students to:
1. **Auto-fill registration details** from their JKUAT student portal account
2. **Validate student credentials** during registration
3. **Login using JKUAT portal credentials** (optional)
4. **Verify enrollment status** to ensure only active students can join

## Features

### 1. Student Validation
- Validates JKUAT registration number format (XX111-0000/YYYY)
- Fetches student details from the portal
- Verifies enrollment status
- Auto-populates registration form

### 2. Dual Authentication
- **Standard Login**: Email + club password
- **Portal Login**: Registration number + portal password

### 3. Registration Modes
- **Portal Mode**: Auto-fill from JKUAT portal (recommended)
- **Manual Mode**: Enter details manually

## API Endpoints

### POST `/api/auth/validate-student`
Validates a student with the JKUAT portal.

**Request Body:**
```json
{
  "registrationNumber": "EN111-0001/2021",
  "portalPassword": "optional_portal_password"
}
```

**Response:**
```json
{
  "message": "Student validation successful",
  "studentData": {
    "name": "John Doe Kamau",
    "email": "john.kamau@student.jkuat.ac.ke",
    "phone": "+254712345678",
    "registrationNumber": "EN111-0001/2021",
    "course": "Bachelor of Science in Computer Science",
    "college": "COETEC",
    "yearOfStudy": 3
  },
  "enrollmentStatus": {
    "isEnrolled": true,
    "academicYear": "2024/2025",
    "semester": 1,
    "status": "Active"
  },
  "canRegister": true
}
```

### POST `/api/auth/register`
Enhanced registration with portal integration.

**Request Body (Portal Mode):**
```json
{
  "registrationNumber": "EN111-0001/2021",
  "password": "club_password",
  "usePortalData": true
}
```

**Request Body (Manual Mode):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254712345678",
  "registrationNumber": "EN111-0001/2021",
  "course": "Computer Science",
  "yearOfStudy": 3,
  "college": "COETEC",
  "password": "club_password",
  "usePortalData": false
}
```

### POST `/api/auth/login`
Enhanced login with portal authentication.

**Request Body:**
```json
{
  "identifier": "john@example.com", // or registration number
  "password": "password",
  "usePortalAuth": false // true for portal authentication
}
```

## Frontend Integration

### Registration Modal
The registration modal now includes:
- **Mode Selection**: Portal vs Manual registration
- **Student Validation**: Real-time validation with JKUAT portal
- **Auto-fill**: Automatic form population from portal data
- **Visual Feedback**: Success/error messages for validation

### Login Modal
The login modal now supports:
- **Dual Mode**: Standard vs Portal authentication
- **Flexible Identifier**: Email or registration number
- **Portal Authentication**: Direct authentication with JKUAT credentials

## Mock Data

For development and testing, the system includes mock student data:

```javascript
const mockStudents = {
  'EN111-0001/2021': {
    name: 'John Doe Kamau',
    email: 'john.kamau@student.jkuat.ac.ke',
    course: 'Bachelor of Science in Computer Science',
    college: 'COETEC',
    yearOfStudy: 3
  },
  'EN111-0002/2022': {
    name: 'Jane Mary Wanjiku',
    email: 'jane.wanjiku@student.jkuat.ac.ke',
    course: 'Bachelor of Science in Information Technology',
    college: 'COETEC',
    yearOfStudy: 2
  },
  'BT111-0003/2023': {
    name: 'Peter Mwangi Kiprotich',
    email: 'peter.kiprotich@student.jkuat.ac.ke',
    course: 'Bachelor of Science in Biotechnology',
    college: 'CONAS',
    yearOfStudy: 1
  }
};
```

## Registration Number Format

JKUAT registration numbers follow the format: `XX111-0000/YYYY`

Where:
- `XX`: College code (EN, BT, HS, HR, AF)
- `111`: Course code
- `0000`: Student number
- `YYYY`: Admission year

### College Codes
- `EN`: COETEC (College of Engineering and Technology)
- `BT`: CONAS (College of Natural Sciences)
- `HS`: COHES (College of Health Sciences)
- `HR`: COHRED (College of Human Resource Development)
- `AF`: COAFS (College of Agriculture and Food Sciences)

## Configuration

### Environment Variables
```bash
# JKUAT Portal API Configuration
JKUAT_PORTAL_URL=https://portal.jkuat.ac.ke/api
JKUAT_PORTAL_API_KEY=your_api_key_here
```

### Production Setup

To integrate with the actual JKUAT portal:

1. **Replace Mock Functions**: Update the mock functions in `utils/jkuatPortal.js` with actual API calls
2. **API Authentication**: Configure proper API keys and authentication
3. **Error Handling**: Implement robust error handling for network issues
4. **Rate Limiting**: Add rate limiting to prevent API abuse
5. **Caching**: Implement caching for frequently accessed student data

## Security Considerations

1. **Data Privacy**: Student data is handled according to GDPR and local privacy laws
2. **Secure Transmission**: All API calls use HTTPS
3. **Input Validation**: All inputs are validated on both client and server
4. **Authentication**: Portal passwords are never stored locally
5. **Access Control**: Only verified students can access club features

## Testing

Use the following test registration numbers:
- `EN111-0001/2021` (Computer Science, Year 3)
- `EN111-0002/2022` (Information Technology, Year 2)
- `BT111-0003/2023` (Biotechnology, Year 1)

Default portal password for testing: `student123`

## Future Enhancements

1. **Real-time Sync**: Sync student data changes from portal
2. **Academic Integration**: Display academic performance data
3. **Fee Status**: Show fee payment status
4. **Course Recommendations**: Suggest relevant club activities based on course
5. **Alumni Integration**: Connect with JKUAT alumni network

## Support

For technical issues or questions about the JKUAT portal integration, contact:
- **Technical Team**: tech@jkuatinnovation.club
- **JKUAT IT Support**: it-support@jkuat.ac.ke