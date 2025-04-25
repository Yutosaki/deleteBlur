package main

import (
	"deleteBlur/handler"
	"deleteBlur/middleware"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"log"
    "os"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println(err)
        os.Exit(1)
	}
	e := echo.New()
	e.Use(middleware.SetupCORS(e))
	e.POST("/reorder", handler.ReorderHandler)
	e.Logger.Fatal(e.Start(":8080"))
}
