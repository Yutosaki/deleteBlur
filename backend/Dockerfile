# Goイメージの選定
FROM golang:1.21-alpine

# 作業ディレクトリの設定
WORKDIR /app

# Goモジュールのキャッシュ用
COPY go.mod ./
RUN go mod download

# アプリのコピー
COPY . .

# ポートの公開
EXPOSE 8080

# ビルドと起動
RUN go build -o app .
CMD ["./app"]
