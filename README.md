# Real-Time Chat Application - Containerized

**NAME : MOHAMMED SOHEL PASHA** <br>
**COMPANY : CODTECH IT SLOUTIONS** <br>
**ID : CT08EHX** <br>
**DOMAIN : DEVOPS** <br>
**DURATION : DEC - JAN 2025**
# Real-Time Chat Application

## Overview
This project is a real-time chat application built using **Node.js**, **JavaScript**, **CSS**, and **HTML**. The application allows users to communicate in real time, supporting multiple participants in dynamic chat rooms. The app has been containerized using Docker to ensure consistent performance and ease of deployment across various environments.

---

## Features
- **Real-Time Messaging:** Instant communication between users using WebSocket technology.
- **Dynamic Chat Rooms:** Users can join or create chat rooms for topic-specific conversations.
- **Responsive Design:** Fully responsive UI for seamless use across devices.
- **Customizable Interface:** Styled with CSS for an engaging user experience.
- **Dockerized Application:** Containerized to ensure portability and scalability.
- **Easy Setup:** Simple commands to build and run the application.
- **Secure Communication:** Basic security features like user validation to protect chat environments.

---

## Advantages of a Containerized Application

1. **Portability:**
   - The application can run consistently across different environments, eliminating the "it works on my machine" problem.

2. **Scalability:**
   - Containers allow easy scaling of the application to handle increasing numbers of users.

3. **Simplified Deployment:**
   - Docker enables quick and hassle-free deployment using a predefined environment in the container.

4. **Resource Efficiency:**
   - Containers use system resources efficiently, leading to reduced overhead compared to virtual machines.

5. **Isolation:**
   - Each container runs independently, ensuring that the application is isolated from other running processes.

6. **Version Control:**
   - Docker images enable tracking of application versions, allowing rollbacks if necessary.

---

## Getting Started
### Prerequisites
- Install [Docker](https://www.docker.com/)
- Basic understanding of Docker commands

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sohelmohammed0/Bubblechat.git
   cd Bubblechat
   ```

2. Build the Docker image:
   ```bash
   docker build -t chat-app .
   ```

3. Run the Docker container:
   ```bash
   docker run -p 3000:3000 chat-app
   ```

4. Open your browser and navigate to `http://localhost:3000` to start using the chat application.

---

## Usage
- Open the app in a web browser.
- Enter a username to join a chat room.
- Start communicating in real-time with other users.
- Create new chat rooms or join existing ones.

---

## Technologies Used
- **Node.js:** Backend framework
- **WebSocket:** Real-time communication
- **JavaScript, CSS, HTML:** Frontend technologies
- **Docker:** Containerization platform

---

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature-name'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request.

---

## Contact
For any queries or support, please contact [sohel879879@gmail.com].



