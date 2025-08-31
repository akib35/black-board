package main

import (
	"log"
	"net/http"
	"path/filepath"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin
	},
}

// Store connected clients
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)

// Message structure
type Message struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func main() {
	// Serve static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("web/static/"))))

	// Serve HTML template
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join("web/templates", "index.html"))
	})

	// WebSocket endpoint
	http.HandleFunc("/ws", handleConnections)

	// Start listening for messages
	go handleMessages()

	log.Println("Black Board Server starting on :8080")
	log.Println("Visit http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	// Register our new client
	clients[ws] = true

	log.Println("New client connected")

	for {
		var msg Message
		// Read in a new message as JSON
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error reading JSON: %v", err)
			delete(clients, ws)
			break
		}

		// Send the newly received message to the broadcast channel
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast

		// Send it out to every client that is currently connected
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("Error writing JSON: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
