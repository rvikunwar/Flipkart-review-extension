import socketio
import eventlet

# Set up the Socket.IO server
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

from reviews import GetReviews


# Handle incoming connections
@sio.event
def connect(sid, environ, auth):
    print('connect ', sid)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)


@sio.on('GET_REVIEWS')
def reviewsHandler(sid, data):
    url = data['url']
    try:
        data = GetReviews(url)
    except:
        sio.emit("exception", "SERVER_ERROR")
    print(url)
    sio.emit('RESPONSE', data, room=sid)


@sio.on('message')
def message(sid, data):
    print('Received:', data)

    # Send a response back to the client
    sio.emit('response', 'Hello from Python!', room=sid)

# Start the server
if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('localhost', 12345)), app)
