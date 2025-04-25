package main

import (
	"github.com/joho/godotenv"
    "deleteBlur/middleware"
    "log"
	"github.com/labstack/echo/v4"
    "deleteBlur/handler"
)


func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println(err)
		return
	}
    e := echo.New()
    e.Use(middleware.SetupCORS(e))
	e.POST("/reorder", handler.ReorderHandler)
    e.Logger.Fatal(e.Start(":8080"))
}
