all: install build up

install:
	cd backend && npm install
	cd frontend && npm install

build:
	docker compose build

up:
	docker compose up

down:
	docker compose down

clean: down
	docker system prune -f

fclean: clean
	rm -rf backend/node_modules frontend/node_modules
	rm -rf backend/dist frontend/dist

re: fclean all

stop:
	docker compose stop

start:
	docker compose start

logs:
	docker compose logs -f

seed:
	python3 generate_seed.py

.PHONY: all install build up down clean fclean re stop start logs seed
