import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';

export default defineConfig({
    preview: {
        host: '0.0.0.0',
        port: parseInt(process.env.PORT || '10000', 10),
        allowedHosts: true, // allow coldcafe.onrender.com and any Render host; use ['coldcafe.onrender.com'] to restrict
    },
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
