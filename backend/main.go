package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
	"net/http"
	"os"
)

type responseJSON struct {
	Text string `json:"text"`
}

func reorderHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		return
	}
	text := r.FormValue("text")
	if text == "" {
		http.Error(w, "text parameter is required", http.StatusBadRequest)
		return
	}
	result, err := rewriteText(r.Context(), text)
	if err != nil {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responseJSON{Text: result})
}

func rewriteText(ctx context.Context, text string) (string, error) {
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("API_KEY")))
	if err != nil {
		return "", err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.0-flash")

	resp, err := model.GenerateContent(
		ctx,
		genai.Text(fmt.Sprintf("以下の文章を自然な日本語に直してください。\n%s", text)),
	)
	if err != nil {
		return "", err
	}

	var result string
	for _, cand := range resp.Candidates {
		if cand.Content == nil {
			continue
		}
		for _, part := range cand.Content.Parts {
			result += fmt.Sprint(part)
		}
	}
	return result, nil
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println(err)
		return
	}
	http.HandleFunc("/reorder", reorderHandler)
	fmt.Println("Listening on :8080")
	http.ListenAndServe(":8080", nil)
}
