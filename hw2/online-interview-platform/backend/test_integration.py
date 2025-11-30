from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_websocket_broadcast():
    with client.websocket_connect("/ws/1") as websocket1:
        with client.websocket_connect("/ws/2") as websocket2:
            # Client 1 sends a message
            websocket1.send_text("Hello from client 1")
            
            # Client 2 should receive it
            data2 = websocket2.receive_text()
            assert data2 == "Hello from client 1"

            # Client 2 sends a message
            websocket2.send_text("Hello from client 2")
            
            # Client 1 should receive it
            data1 = websocket1.receive_text()
            assert data1 == "Hello from client 2"

def test_websocket_disconnect():
    with client.websocket_connect("/ws/1") as websocket1:
        with client.websocket_connect("/ws/2") as websocket2:
            websocket1.send_text("Client 1 is here")
            data2 = websocket2.receive_text()
            assert data2 == "Client 1 is here"
        
        # websocket2 is closed now
        # Client 1 sends another message, should not fail
        websocket1.send_text("Client 1 is still here")
        # No one to receive, but server shouldn't crash
