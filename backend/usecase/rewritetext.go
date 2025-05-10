package usecase

import (
	"deleteBlur/infrastructure"
	"deleteBlur/model"
	"github.com/labstack/echo/v4"
	"sync"
	"context"
)

func RewriteText(c echo.Context, texts model.Texts) ([]string, error) {
	modelName := "gemini-2.0-flash"
	results := make([]string, len(texts.Texts))
	var wg sync.WaitGroup
	errCh := make(chan error)

	ctx, cancel := context.WithCancel(c.Request().Context())
	defer cancel()

	for i, text := range texts.Texts {
		wg.Add(1)
		go func() {
			defer wg.Done()
            // 他の後ルーチンで cancel() が呼ばれていた場合、終了させたいため、初めにチェックする
			select {
			case <-ctx.Done():
				return
			default:
			}

			res, err := infrastructure.Requestgenai(c, text, modelName)
			if err != nil {
				select {
				case errCh <- err:
					cancel()
				default: // 既にエラーが発生しているがまだ、キャンセルが送信されていない時は何もせずに終わりたい
				}
				return
			}
			results[i] = res // ここで元の位置に格納する（localのindexが保持されているから、indexが更新されずに元の配列の順番のところに入る）
		}()
	}

    // エラーが発生したら即時に受け取ってreturnしたいから、ゴルーチンで動かす
	go func() {
		wg.Wait()
		close(errCh)
	}()

	if err := <-errCh; err != nil {
		return nil, err
	}
	return results, nil
}
