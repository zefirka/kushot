build:
	docker build -t cr.yandex/crpgoj0cihid1vmvhmj5/kushot:latest .

save:
	docker save -o kushot.tar cr.yandex/crpgoj0cihid1vmvhmj5/kushot:latest
 