запуск в WSL под виндой (на локалхосте):

(пропустим про настройку и запуск WSL (c ubuntu!))

в WSL:

```bash
cd /mnt/c/
mkdir eaigaq
cd eaigaq
git clone https://github.com/Kyllerian/eaigaq-local
cd eaigaq-local
```

т.к. порт 80 и 8080 зарезервированы, в docker-compose.yml поменять строку 40:
```
80:80
```
на 
```
8081:80
```

после этого можно запуситить:
```
docker-compose up --build -d
```
далее создать суперюзера (если не стираете бд - один раз)
```
docker-compose exe backend python manage.py createsuperuser
```
(следуете инструкциям)

доступ в админку:

```
127.0.0.1:8081/admin
```

фронт:
```
127.0.0.1:8081/login
```