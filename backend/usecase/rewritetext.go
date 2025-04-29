package usecase

import (
	"deleteBlur/infrastructure"
	"deleteBlur/model"
	"github.com/labstack/echo/v4"
)

func RewriteText(c echo.Context, texts []model.Text) ([]string, error) {
	modelName := "gemini-2.0-flash"
	resChan := make(chan string, len(texts))
	errChan := make(chan error, len(texts))

	for _, text := range texts {
		t := text
		go func() {
			res, err := infrastructure.Requestgenai(c, t.Text, modelName)
			if err != nil {
				errChan <- err
				return
			}
			resChan <- res
		}()
	}

	var results []string
	for i := 0; i < len(texts); i++ {
		select {
		case res := <-resChan:
			results = append(results, res)
		case err := <-errChan:
			return nil, err
		}
	}
	return results, nil
}
