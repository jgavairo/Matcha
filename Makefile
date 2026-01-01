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

.PHONY: all install build up down clean fclean re
