package handler

import (
	"deleteBlur/model"
	"deleteBlur/usecase"
	"github.com/labstack/echo/v4"
	"net/http"
)

func ReorderHandler(c echo.Context) error {
	var texts model.Texts
	if err := c.Bind(&texts); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "textを入力してください"})
	}
	result, err := usecase.RewriteText(c, texts)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "テキストの修正に失敗しました"})
	}
	return c.JSON(http.StatusOK, model.Texts{Texts: result})
}
