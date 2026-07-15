import urllib.request, json
try:
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/register', data=b'{"email":"test3@example.com","password":"password","full_name":"Test"}', headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    print(res.read())
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read())
