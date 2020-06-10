build:
	docker build -t kushot .

save:
	docker save -o kushot.tar kushot:latest
 