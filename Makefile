.PHONY: build
build:
	docker build -t tkgling/blitz_engine .

.PHONY: up 
up:
	docker compose up 