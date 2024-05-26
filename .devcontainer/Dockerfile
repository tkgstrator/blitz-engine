FROM oven/bun:1.1.10

COPY --from=node:20.13.1 /usr/local/bin/node /usr/local/bin/node
COPY --from=node:20.13.1 /opt/yarn* /opt/yarn/

RUN ln -fs /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN ln -fs /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npx
RUN ln -fs /usr/local/lib/node /usr/local/bin/nodejs
RUN ln -fs /opt/yarn/bin/yarn /usr/local/bin/yarn
RUN ln -fs /opt/yarn/bin/yarn /usr/local/bin/yarnpkg

RUN apt-get update
RUN apt-get install -y build-essential clang lld libopenblas-dev unzip zip
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

EXPOSE 8080

USER bun
WORKDIR /home/bun/app
CMD ["/bin/bash"]
