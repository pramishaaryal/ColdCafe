import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL('./index.html', import.meta.url)),
                about: fileURLToPath(new URL('./about.html', import.meta.url)),
                menu: fileURLToPath(new URL('./menu.html', import.meta.url)),
                media: fileURLToPath(new URL('./media.html', import.meta.url)),
                contact: fileURLToPath(new URL('./contact.html', import.meta.url)),
            },
        },
    },
});
