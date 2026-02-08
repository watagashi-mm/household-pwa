# household-pwa

## デプロイ方法 (GitHub Pages)

このプロジェクトは GitHub Actions を使用して GitHub Pages に自動デプロイされるように設定されています。

### 初回設定手順
1. このリポジトリを GitHub にプッシュします。
2. GitHub リポジトリの **Settings** > **Pages** を開きます。
3. **Build and deployment** > **Source** で **GitHub Actions** を選択します。
4. `main` ブランチにプッシュすると、自動的にビルドとデプロイが開始されます。

### 注意事項
- `vite.config.ts` の `base: './'` 設定により、サブディレクトリでも動作するようになっています。
- PWAとして正しく動作させるためには、HTTPS環境（GitHub Pagesは標準でHTTPS）での実行が必要です。