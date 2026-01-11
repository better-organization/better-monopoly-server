curl -X 'POST' \
  'http://localhost:8080/api/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "akash",
  "password": "123456",
  "userId": "akash"
}'

curl -X 'POST' \
  'http://localhost:8080/api/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "akash",
  "password": "123456"
}' -c ./cookie.txt -b ./cookie.txt

 curl -X 'POST' \
  'http://localhost:8080/api/room/create' \
  -H 'accept: application/json' \
  -d '' -c ./cookie.txt -b ./cookie.txt

 curl -X 'GET' \
  'http://localhost:8080/api/room/status' \
  -H 'accept: application/json' \
  -d '' -c ./cookie.txt -b ./cookie.txt