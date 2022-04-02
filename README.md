# Group Activity Planning - Nest.js Back-End Repo

Name: John Dennehy (20091408)

## Overview.

A Nest.js server that accepts requests from the client and manages interactions with the Postgres database and Python Flask web-scraping API.
Client interacts with server via requests to routes defined on the REST API (see link to Swagger documentation below for full overview).
Socket.io gateway also implemented for instant chat functionality between client and server (WebSockets).

## Live Site Url

The server is deployed at the following URL: https://group-activity-planning-nest.herokuapp.com

## Swagger Documentation

Can be found at https://group-activity-planning-nest.herokuapp.com/api/v1/docs

## Setup requirements.

- Open the command line
- Enter the following command in the terminal -
  `git clone https://github.com/JohnDennehy101/nestjs-backend-FYP`
- Locate the the downloaded folder in the terminal and enter using the following command -
  `cd nestjs-backend-FYP`
- Now project dependencies need to be installed, enter the following command in the terminal - `npm install`
- API keys need to be created for Mailgun, Google Places and Cloudinary.
  - A guide on how to create an account and obtain API key for Mailgun can be found at - https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials-
  - A guide on how to create an account and obtain API key for Google Places can be found at - https://developers.google.com/maps/documentation/places/web-service/get-api-key
  - A guide on how to create an account and obtain API key for Cloudinary can be found at - https://cloudinary.com/documentation/how_to_integrate_cloudinary
- You need to have a Postgres database running locally for the API to function locally. For more information on how to do this, please follow the instructions at this site https://www.codecademy.com/article/installing-and-using-postgresql-locally
- To get the app functional, a .env file needs to be added to the project. To do this, enter the following command - `touch .env`
- The .env file should now be created. To edit this file, enter the following - `nano .env`
- A nano editor should now be displayed in terminal with the .env file open. This now needs to be populated with the relevant environment variables list below.

  - DATABASE_PASSWORD={Put your Postgres db password here}
  - DATABASE_USERNAME=postgres
  - DATABASE_HOST=localhost
  - JWT_SECRET={Put a secret password for the JWT here}
  - WEBSCRAPE_SERVER_ACCESS_USERNAME={This needs to match the value used in the ACCESS_USERNAME variable in the .env file in the Flask API - see README at https://github.com/JohnDennehy101/web-scraper-FYP}
  - WEBSCRAPE_SERVER_ACCESS_PASSWORD={This needs to match the value used in the ACCESS_PASSWORD variable in the .env file in the Flask API - see README at https://github.com/JohnDennehy101/web-scraper-FYP}
  - WEBSCRAPE_SERVER_URL=http://127.0.0.1:5000/api/v1
  - MAILGUN_API_KEY={Put your Mailgun API key here}
  - MAILGUN_USERNAME={Put the email you signed up to with Mailgun here}
  - JWT_EMAIL_VERIFICATION_TOKEN_SECRET={Put a secret password for the JWT here}
  - JWT_VERIFICATION_TOKEN_EXPIRATION_TIME=21600
  - EMAIL_CONFIRMATION_URL=http://localhost:8080/user/account-verification
  - NODE_ENV=staging
  - GOOGLE_PLACES_API_KEY={Put your Google Places API key here}
  - CLOUDINARY_CLOUD_NAME={Put your Cloudinary cloud name here}
  - CLOUDINARY_API_KEY={Put your Cloudinary API key here}
  - CLOUDINARY_API_SECRET={Put your Cloudinary API Secret here}

- Save the .env file `(Ctrl + O)`
- To exit the file enter `(Ctrl + X)`
- You need to have the Python Flask web-scraping API running locally also for all routes on the Nest.js Server to function.
  For instructions on how to get this running locally, please see README.md document at https://github.com/JohnDennehy101/web-scraper-FYP
- Once you have the Python Flask web-scraping API running locally, enter `npm run start` to get the project running locally on localhost.
- You can then navigate to the swagger documentation locally at `http://localhost:3000/api/v1/docs` to see the full list of API routes available for use
- To stop the Nest.js server, hit CTRL and C in the terminal to kill the process.
