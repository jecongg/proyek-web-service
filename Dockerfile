# Gunakan Node.js image
FROM node:18

# Set direktori kerja
WORKDIR /app

# Salin file package.json dan install dependensi
COPY package*.json ./
RUN npm install

# Salin semua file project
COPY . .

# Expose port yang dipakai app
EXPOSE 3000

# Jalankan app
# CMD ["npm", "dev"]
CMD ["npx", "nodemon"]



