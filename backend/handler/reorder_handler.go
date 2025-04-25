package handler

import (
	"fmt"
	genai "github.com/google/generative-ai-go/genai"
	"github.com/labstack/echo/v4"
	"google.golang.org/api/option"
	"log"
	"net/http"
	"os"
)

func ReorderHandler(c echo.Context) error {
	text := c.FormValue("text")
	if text == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "textを入力してください"})
	}
	result, err := rewriteText(c, text)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "テキストの修正に失敗しました"})
	}
	return c.JSON(http.StatusOK, result)
}

func rewriteText(c echo.Context, text string) (string, error) {
	context := c.Request().Context()

	client, err := genai.NewClient(context, option.WithAPIKey(os.Getenv("API_KEY")))
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.0-flash")

	response, err := model.GenerateContent(
		context,
		genai.Text(fmt.Sprintf("以下の文章を自然な日本語に直してください。\n%s", text)),
	)
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	var result string
	for _, cand := range response.Candidates {
		log.Println(cand.Content.Parts)
		if cand.Content == nil {
			continue
		}
		for _, part := range cand.Content.Parts {
			result += fmt.Sprint(part)
		}
	}
	return result, nil
}
