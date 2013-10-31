#!/usr/bin/env python
import SimpleHTTPServer
import SocketServer
from webbrowser import open
 
PORT = 8000
 
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
 
httpd = SocketServer.TCPServer(("", PORT), Handler)
 
open('http://localhost:8000')
print "Server running on port ", PORT
httpd.serve_forever()



