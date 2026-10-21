#Intialisation
npm init
npm install -D typescript@5.9.3
npm install -D ts-node@10.9.2 ts-node-dev@2.0.0
tsc --init

#Update Package.json

  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },

#Add Prisma
npm install prisma @prisma/client

#Install Dependencies and Dev Dependencies
npm install @google/genai cookie-parser cors csv-parser dotenv express json2csv multer

npm install --save-dev @types/cookie-parser @types/cors @types/express @types/multer @types/node ts-node-dev typescript

#RUN
npm run dev
