import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base trùng tên repo để chạy được trên GitHub Pages: https://<user>.github.io/CS112-TiemSachUI/
export default defineConfig({ base: '/CS112-TiemSachUI/', plugins: [react()] });
