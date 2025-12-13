# Bus Login and Verification System Implementation

## Overview
Implement a bus driver login system with verification process, admin approval/rejection, and bus driver dashboard.

## Steps

### 1. Set up data storage
- Create a JSON file (busDrivers.json) to store bus driver information and verification status.

### 2. Create bus driver registration page
- Create bus-login.html with form fields: name, email, phone, photo upload, license upload, and other relevant details.
- Add form validation and submission to backend API.

### 3. Add backend API endpoints
- POST /bus-register: Handle bus driver registration submission, save to JSON file with status 'pending'.
- GET /admin/pending-verifications: Return list of pending bus driver verifications.
- POST /admin/approve-verification: Update bus driver status to 'approved'.
- POST /admin/reject-verification: Update bus driver status to 'rejected'.
- Add simple authentication for admin endpoints (e.g., basic password check).

### 4. Create admin page
- Create admin.html with login form for admin access.
- Display two sections: pending approvals and rejected verifications.
- Add buttons to approve or reject each bus driver.
- Use JavaScript to fetch data from API and update UI.

### 5. Create bus driver dashboard
- Create bus-dashboard.html accessible only after admin approval.
- Check verification status before allowing access.
- Display bus driver information and relevant dashboard content.

### 6. Update routing and navigation
- Add links to bus-login.html from main page.
- Add link to admin.html (with authentication).
- Update server.js to serve new HTML files if needed.
- Ensure proper navigation flow between pages.

### 7. Add frontend JavaScript
- Create bus-login.js for registration form handling.
- Create admin.js for admin page functionality.
- Create bus-dashboard.js for dashboard logic.
- Integrate with existing script.js if needed.

### 8. Test the system
- Test bus driver registration.
- Test admin approval/rejection.
- Test bus driver dashboard access.
- Ensure proper error handling and user feedback.

### 9. Add CSS styling
- Add styles for bus-login.html, admin.html, bus-dashboard.html.
