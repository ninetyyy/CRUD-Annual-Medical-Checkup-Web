  🛠️ How to Restart After Reboot

   1. Open Docker Desktop
       * Make sure Docker is running (wait for the green status).

   2. Open Terminal in Project Folder
       * Navigate to: D:\Coding\Mini_Project\Blood_Result_Storage_gemini_cli

   3. Start the Database
       * Run this command to start the Postgres container:

   1         docker-compose up -d

   4. Start the Web Server
       * Run this command to start the app:
   1         npm start
          (Note: If npm start still gives an execution policy error, use: node app.js)

   5. Open the App
       * Go to: http://localhost:3000 (http://localhost:3000)