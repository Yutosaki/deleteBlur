package middleware

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func SetupCORS(e *echo.Echo) echo.MiddlewareFunc {
    return middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins:     []string{"*"},
        AllowMethods:     []string{"POST"},
        AllowHeaders:     []string{"Content-Type"},
    })
}
