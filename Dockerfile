FROM node:23.6.0
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack install
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000