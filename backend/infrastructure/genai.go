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

	prompt := fmt.Sprintf(`以下のDBに関する文章の文字を並びかえて自然な日本語に直してください。その際に、文字を追加したり削除することは絶対にせずに、文字の並び替えのみで正しい日本語の文章に直してください。
	また"、"や"。"や"（"などの間で区切られている文章の文字はその文章の区間内で並び替えてください。

例：
（質問）：ドッデはロクッ、能占順可の有源なすあす生がるる合りまに性資発場序異が。に記は述「デ全てラン対シ象トンザョのがクーッすロク一をタの定序順で」あるめたと、し生デせドッロクッんは発ま。
（回答）：デッドロックは、資源の占有順序が異なる場合に発生する可能性があります。記述には「全てのトランザクションがロック対象のデータを一定の順序で」とあるため、デッドロックは発生しません。

並び替えのみを行い、正しい文章のみを出力してください：
%s`, text)

	response, err := model.GenerateContent(
		context,
		genai.Text(prompt),
	)
	if err != nil {
		log.Println(err)
		return "", err
	}
	var result string
	for _, part := range response.Candidates[0].Content.Parts {
		result += fmt.Sprintf("%v", part)
	}
	return result, nil
}
