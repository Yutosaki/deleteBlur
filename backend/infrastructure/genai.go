package infrastructure

import (
	"fmt"
	genai "github.com/google/generative-ai-go/genai"
	"github.com/labstack/echo/v4"
	"google.golang.org/api/option"
	"log"
	"os"
)

func Requestgenai(c echo.Context, text string, modelName string) (string, error) {
	context := c.Request().Context()

	client, err := genai.NewClient(context, option.WithAPIKey(os.Getenv("API_KEY")))
	if err != nil {
		log.Println(err)
		return "", err
	}
	defer client.Close()

	model := client.GenerativeModel(modelName)

	response, err := model.GenerateContent(
		context,
		genai.Text(fmt.Sprintf("以下の文章を自然な日本語に直してください。\n整形した文章のみ出力してください\n%s", text)),
	)
	if err != nil {
		log.Println(err)
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
