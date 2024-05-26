FROM oven/bun:1.1.10 AS build

COPY --from=node:20.13.1 /usr/local/bin/node /usr/local/bin/node
COPY --from=node:20.13.1 /opt/yarn* /opt/yarn/

RUN ln -fs /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN ln -fs /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npx
RUN ln -fs /usr/local/lib/node /usr/local/bin/nodejs
RUN ln -fs /opt/yarn/bin/yarn /usr/local/bin/yarn
RUN ln -fs /opt/yarn/bin/yarn /usr/local/bin/yarnpkg

RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    make \
    unzip \
    git \
    clang \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/bun/app
COPY src src
COPY entrypoint.sh entrypoint.sh
COPY bun.lockb bun.lockb
COPY package.json package.json
COPY tsconfig.json tsconfig.json

RUN chmod +x entrypoint.sh
RUN bun install --production --ignore-scripts

EXPOSE 9564

ENTRYPOINT ["sh", "entrypoint.sh"]
