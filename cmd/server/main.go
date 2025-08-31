package main

import (
	"log"
	"net/http"
	"path/filepath"
)

func main() {
	// Serve static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("web/static/"))))

	// Serve HTML template
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join("web/templates", "index.html"))
	})

	log.Println("Server starting on :8080")
	log.Println("Visit http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
