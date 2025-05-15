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
		genai.Text(fmt.Sprintf("DBに関する試験の以下の文章の文字を並びかえて自然な日本語に直してください。その際に、**絶対に新しい文字を追加せず、並び替えのみで正しい文章に直してください。**\n整形した文章のみを出力してください\n%s", text)),
	)
	if err != nil {
		log.Println(err)
		return "", err
	}
	var result string
	if len(response.Candidates) == 0 {
		log.Println("レスポンスを取得できませんでした")
		return "", fmt.Errorf("レスポンスを取得できませんでした")
	}
	for _, part := range response.Candidates[0].Content.Parts {
		result += fmt.Sprintf("%v", part)
	}
	return result, nil
}
