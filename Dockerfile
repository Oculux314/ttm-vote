# syntax = docker/dockerfile:1.4

ARG NODE_VERSION=20.18.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

RUN --mount=type=secret,id=DATABASE_URI \
    cat /run/secrets/DATABASE_URI

RUN printenv

WORKDIR /app
ENV NODE_ENV="production"

# Install yarn
ARG YARN_VERSION=1.22.22
RUN npm install -g yarn@$YARN_VERSION

# ---------------- Build Stage ----------------
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy source
COPY . .

# Build
RUN --mount=type=secret,id=DATABASE_URI \
    --mount=type=secret,id=PAYLOAD_SECRET \
    --mount=type=secret,id=S3_BUCKET \
    --mount=type=secret,id=S3_ACCESS_KEY_ID \
    --mount=type=secret,id=S3_SECRET_ACCESS_KEY \
    --mount=type=secret,id=S3_REGION \
    DATABASE_URI="$(cat /run/secrets/DATABASE_URI)" \
    PAYLOAD_SECRET="$(cat /run/secrets/PAYLOAD_SECRET)" \
    S3_BUCKET="$(cat /run/secrets/S3_BUCKET)" \
    S3_ACCESS_KEY_ID="$(cat /run/secrets/S3_ACCESS_KEY_ID)" \
    S3_SECRET_ACCESS_KEY="$(cat /run/secrets/S3_SECRET_ACCESS_KEY)" \
    S3_REGION="$(cat /run/secrets/S3_REGION)" \
    yarn build

# Remove dev dependencies
RUN yarn install --production --frozen-lockfile

# ---------------- Final Stage ----------------
FROM base

COPY --from=build /app /app

RUN apt-get update -qq && \
    apt-get install tree
RUN tree -I "node_modules"

EXPOSE 3000
CMD ["yarn", "start"]
