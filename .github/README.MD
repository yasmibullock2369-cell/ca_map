# RSBuild React Kit

React boilerplate with RSBuild, TypeScript and TailwindCSS 4.0.

## Tech Stack Versions

- **React**: 19.0.0
- **React Router**: 7.2.0
- **TailwindCSS**: 4.0.7
- **TypeScript**: 5.7.3
- **Node.js**: ≥ 18

## Cấu Hình RSBuild

Xem thêm chi tiết về các tùy chọn cấu hình RSBuild tại [tài liệu chính thức](https://rsbuild.dev/config/html/app-icon).

## Getting Started

### Requirements

- Node.js (v18 trở lên)
- [Biome VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Tailwind CSS Extension](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

#### VS Code Settings

Thêm các settings sau vào settings.json của VS Code để sử dụng Biome làm default formatter:

Xem thêm thông tin về cài đặt Biome VS Code tại [tài liệu Biome VS Code](https://biomejs.dev/reference/vscode/).

```json
{
  "biome.enabled": true,
  "editor.defaultFormatter": "biomejs.biome"
}
```

### Installation

```bash
git clone https://github.com/ovftank/rsbuild-react-kit.git
pnpm install
```

### Development

```bash
pnpm dev
pnpm build
pnpm preview
```

## Project Structure

```text
├── src/
│   ├── assets/         # Static assets
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── app.tsx        # Main App component
│   └── index.tsx      # Entry point
├── public/            # Public files
└── rsbuild.config.ts  # RSBuild config
```
