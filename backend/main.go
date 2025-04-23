package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Backend prototype is running!")
}

func serveOpenAPI(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./openapi.yml")
}

func main() {
	http.HandleFunc("/", handler)
	http.HandleFunc("/docs/openapi.yml", serveOpenAPI)

	fmt.Println("Listening on :8080")
	http.ListenAndServe(":8080", nil)
}
