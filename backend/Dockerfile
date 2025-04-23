# Goイメージの選定
FROM golang:1.23-alpine

# 作業ディレクトリの設定
WORKDIR /app

# Goモジュールのキャッシュ用
COPY ./backend/go.mod ./
RUN go mod download

# アプリのコピー
COPY backend .

# ポートの公開
EXPOSE 8080

RUN go install github.com/air-verse/air@latest
ENV PATH=$PATH:/root/go/bin

CMD ["air", "-c", ".air.toml"]
