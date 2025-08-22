FROM node:20-slim

# Install necessary dependencies for Puppeteer trước
RUN apt-get update \
   && apt-get install -y wget gnupg \
   && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
   && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
   && apt-get update \
   && apt-get install -y google-chrome-stable \
   fonts-liberation \
   libappindicator3-1 \
   libasound2 \
   libatk-bridge2.0-0 \
   libatk1.0-0 \
   libatspi2.0-0 \
   libgtk-3-0 \
   libnspr4 \
   libnss3 \
   libx11-xcb1 \
   libxcomposite1 \
   libxcursor1 \
   libxdamage1 \
   libxfixes3 \
   libxi6 \
   libxrandr2 \
   libxrender1 \
   libxss1 \
   libxtst6 \
   --no-install-recommends \
   && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files trước để cache npm install
COPY package*.json ./

# Set env để Puppeteer sử dụng Chrome đã cài sẵn
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install npm dependencies (xóa package-lock.json cũ nếu có conflict)
RUN rm -f package-lock.json && npm install --only=production

# Copy source code
COPY . .

# Create user để chạy app an toàn hơn
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 4000

CMD ["npm", "start"]