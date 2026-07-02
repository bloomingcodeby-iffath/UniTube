# Software Requirements Specifications (SRS)
## Project Title:
### **UniTube - University Course video Library Platform**
---
#  1. Introduction:
 - ### Purpose:
	**UniTube** is a web-based platform designed to help university students access high-quality, curated **educational video** recourses for their **academic courses**.
		The platform solves the problem of spending excessive time searching through numerous online playlists by providing organized course-wise video materials in one place.

 - ### Problem Statement:
	   University students often depend on online platforms like YouTube for learning course topics. However:
			- Many playlists exist for the same subject
			- Quality of resources varies
			- Students waste time comparing different playlists
			- Lack of proper learning structure reduces motivation
			- Students often cannot find complete resources for a course
		UniTube here provides a structured learning environment where students can select their courses and instantly access recommended video resources.
		
#  2. Objectives:
The main objectives of UniTube are:
-  Provide a centralized academic video library
- Reduce time spent searching for learning resources
- Provide course-wise, organized video materials
- Allow students to personalize their learning dashboard
- Track learning progress
- Allow students to take notes while studying
- Provide AI-based learning assistance in future versions
	
#  3. Scope:
## Student Side (User)
	Students can:
		- Create an account 
		- Login securely
		- Select courses
		- Remove courses
		- View course materials
		- Watch videos inside UniTube
		- Track video completion
		- Save personal notes
		- Use dark/light mode
		
## Admin Side:
	Administrators can:
		- Login to admin panel
		- Add new courses
		- Add playlists from YouTube
		- Add YouTube video links to courses
		- Update video information
		- Remove outdated resources
		- Manage users
		- Assign playlist order
		- Manage course structure
	
# 4. User Roles:
## student
A registered student can:

 - Access personalized dashboard
 - Manage courses
 - Watch videos
 - Track progress
 - Write notes
 
## Administrator
Admin manages:

 - Course database
 - Video resources
 - User management
 
# 5. Functional Requirements:
### FR-01: User Registration
---
System shall allow students to create accounts in UniTube by providing personal and academic details. the system shall securely store user information and encrypted credentials.
### Input:
**A. Personal Information**
- **user_id**: Auto generated (primary key)
- **username**: Unique and valid display name
- **email**: Unique and valid login identifier
- **password**: User password (hashed before storage)
- **phone number**: Contact number
	
**B. Academic Information**
- **institution**: University name
- **department**: Academic department
- **batch**: Admission batch
- **year_semester**: current academic year-semester

**C. Course Selection**
- **selected courses**: list of course IDs **( many-to-many relationship )**

System shall -
 - [ ] generate a unique `user_id` automatically
 - [ ] validate Unique email
 - [ ] Password Strength
 - [ ] hash password before storing
 - [ ] allow students to select **multiple courses during registration**
 - [ ] store course selection in a separate mapping table
 - [ ] add more courses after registration
 - [ ] remove courses anytime from dashboard
---
### FR-02: User Authentication
---
System shall allow users to login using:

-   Email/Username
-   Password

System shall use secure authentication (JWT token-based login)

---
### FR-03: Course Selection
---
Student can:

-   Browse available courses
-   Add courses
-   Remove courses
---
### FR-04: Video Access
---
System shall display course-wise organized video playlists using embedded **YouTube videos**, allowing students to watch content directly **within the platform**.

----------
### FR-05: Video Progress Tracking
---
System shall store:
-   Watched videos
-   Completion percentage
-   Last watched position

----------
### FR-06: Notes System
---
Student can:
-   Create notes
-   Edit notes
-   Delete notes

Notes are connected with specific videos.

----------

### FR-07: Theme Selection
----
System shall provide:

-   Light mode
-   Dark mode

----------
### FR-08: Admin Content Management
---
Admin can perform CRUD operations:
**Create**  - **Read**  - **Update**  - **Delete**
for:
-   Courses
-   Videos
-   Playlists
---
### FR-09: Student Dashboard
---
System shall provide a personalized dashboard showing:

-   Enrolled courses
-   Available video playlists
-   Progress overview
-   Notes access

# 6. Non-Functional Requirements

## Performance
-   Pages should load quickly
-   Video browsing should be smooth

## Security
-   Password hashing
-   Secure authentication
-   Database protection

## Usability
-   Simple interface
-   Student-friendly design

## Scalability
System should support adding:
-   More departments (later on)
-   More courses
-   More videos

----------

# 7. Technology Stack
### Frontend
-  React js

### Backend
-   FastAPI (Python)

### Database

-   MySQL

### Database Connection

-   SQLAlchemy ORM

## Deployment

Frontend:

-   Vercel

Backend:

-   Render/Railway

Database:

-   Cloud MySQL

# 8. System Architecture
              Student
                 |
                 |
          Frontend (HTML/CSS/JS)
                 |
                 |
          FastAPI Backend
                 |
        -----------------
        |               |
      MySQL          YouTube
     Database    (Embedded videos)

# 9. Future Enhancements
-   AI study assistant
-   AI-generated summaries
-   Quiz generation
-   Discussion forum
-   Mobile application
-   Offline learning support
