all: install build up

install:
	docker run --rm -v $(PWD)/backend:/app -w /app -e NPM_CONFIG_CACHE=/tmp/.npm node:20-alpine npm install
	docker run --rm -v $(PWD)/frontend:/app -w /app -e NPM_CONFIG_CACHE=/tmp/.npm node:20-alpine npm install

build:
	docker compose build

up:
	docker compose up

down:
	docker compose down

clean: down
	docker system prune -a
	docker volume prune -a

fclean: clean
	docker run --rm -v $(PWD)/backend:/app -w /app node:20-alpine rm -rf node_modules dist
	docker run --rm -v $(PWD)/frontend:/app -w /app node:20-alpine rm -rf node_modules dist

re: fclean all

stop:
	docker compose stop

start:
	docker compose start

logs:
	docker compose logs -f

seed:
	python3 scripts/generate_seed.py

.PHONY: all install build up down clean fclean re stop start logs seed
