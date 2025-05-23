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

	prompt := fmt.Sprintf(`
        ▼指示開始
        ────────────────────────────────────────
        1️⃣ ゴール（1 行宣言）
        - 下の **「材料」** の各行を、**文字を余さず** 並べ替えて “意味の通る IT 用語・説明文” に直してください。
        - 出力は **入力と同じ行数・同じ順番**、1 行 1 文のみ。

        2️⃣ 絶対ルール
        1. 文字の **追加・削除・変形** は一切禁止（全角／半角・句読点も保持）。
        2. 材料に含まれる記号・スペースも **必ず使う**。
        3. 回答は、回答以外何も書かない。

        3️⃣ ヒント（必要に応じて調節）
        - 試験区分　　：★ここに “DB / 応用情報 / NW / PM …” などを列挙
        - 想定テーマ　：【例】排他制御、BCP、スケジューリングアルゴリズム …
          - 行 (1) は **キーワードのみ** の可能性あり
          - 行 (2) 以降は **定義や説明文** の可能性あり
        - 文字数の目安：【例】10〜50 文字

        4️⃣ 回答フォーマット
        正しい順序に並び替えた文章のみ

        5️⃣ 材料（順不同・行番号は削らないこと）
        %s

        ✅ チェックリスト
        - [ ] 【回答欄】以外を編集していない
        - [ ] 各行が IT 試験で出る “意味の通る日本語” になった
        - [ ] 材料の文字・記号を **1 つも余さず** 使った
        - [ ] 行数と順番を入力と一致させた
        ────────────────────────────────────────
        ▼指示終了`, text)

	response, err := model.GenerateContent(
		context,
		genai.Text(prompt),
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
