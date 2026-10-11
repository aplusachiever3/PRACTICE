import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// This bridge exists only in the packaged mobile app. The GitHub Pages browser
// continues using the existing Web Share API and local browser storage.
if (Capacitor.isNativePlatform()) {
  window.NativeShareBridge = {
    async share({ title, text, attachments = [] }) {
      const files = [];
      for (let i = 0; i < attachments.length; i += 1) {
        const attachment = attachments[i];
        if (!attachment || typeof attachment.data !== 'string') continue;
        const match = attachment.data.match(/^data:(image\\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
        if (!match) continue;
        const mime = match[1].toLowerCase();
        const extension = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('gif') ? 'gif' : 'jpg';
        const safeName = String(attachment.name || `photo-${i + 1}`).replace(/[^\\w.-]/g, '_').replace(/\\.[^.]+$/, '');
        const saved = await Filesystem.writeFile({
          path: `suibiji-share-${Date.now()}-${i}-${safeName}.${extension}`,
          data: match[2],
          directory: Directory.Cache,
          recursive: true
        });
        files.push(saved.uri);
      }
      const payload = { title: title || '随笔记智能机器', text: text || '' };
      if (files.length) payload.files = files;
      await Share.share(payload);
    }
  };
}
